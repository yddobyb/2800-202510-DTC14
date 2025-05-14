// Status page script to fetch and display payment data
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('Status page loaded, fetching payment data...');
        // Default user ID (using zoey from mock data)
        const userId = 1;
        
        // Check if we have a stored timer end time and payment ID
        const storedEndTime = localStorage.getItem('parkingEndTime');
        const storedPaymentId = localStorage.getItem('currentPaymentId');
        
        // If we previously stopped parking, don't try to load it again
        const parkingStopped = localStorage.getItem('parkingStopped');
        if (parkingStopped === 'true') {
            console.log('Parking was previously stopped, showing inactive UI');
            showNoActiveParkingUI();
            return;
        }
        
        // Fetch the latest payment data from the server
        const response = await fetch(`/api/payment/history/${userId}`);
        const data = await response.json();
        console.log('Payment data received:', data);
        
        if (data.success && data.payments && data.payments.length > 0) {
            // Store payments in window for other functions to access
            window.latestPayments = data.payments;
            
            // Get all payments with hours = 0 (stop records)
            const stopRecords = data.payments.filter(payment => payment.hours === 0);
            
            // Get the most recent payment with hours > 0 (potentially active parking)
            let latestPayment = null;
            for (const payment of data.payments) {
                // Check if payment has hours > 0 
                if (payment.hours > 0) {
                    latestPayment = payment;
                    break;
                }
            }
            
            if (!latestPayment) {
                console.log('No active parking found (no payments with hours > 0)');
                // Clear stored data if no active parking
                clearParkingData();
                showNoActiveParkingUI();
                return;
            }
            
            // Check if there's a stop record that came after this payment
            // Sort by payment_id (higher = more recent)
            const sortedStopRecords = stopRecords.sort((a, b) => b.payment_id - a.payment_id);
            
            // If there's a stop record with a higher payment_id than our active record,
            // it means this parking was stopped
            if (sortedStopRecords.length > 0 && sortedStopRecords[0].payment_id > latestPayment.payment_id) {
                console.log('Found a stop record newer than the latest payment, parking was stopped');
                clearParkingData();
                showNoActiveParkingUI();
                return;
            }
            
            console.log('Active payment found:', latestPayment);
            
            // Store payment ID for stop parking functionality
            window.currentPaymentId = latestPayment.payment_id;
            localStorage.setItem('currentPaymentId', latestPayment.payment_id);
            
            // Update parking spot (street number)
            const parkingSpotElement = document.querySelector('.mt-16.px-10 div:nth-child(1) span:last-child');
            if (parkingSpotElement) {
                parkingSpotElement.textContent = latestPayment.street_number;
            }
            
            // Calculate end time - either use stored end time or calculate new one
            let endTime;
            
            if (storedEndTime && storedPaymentId === String(latestPayment.payment_id)) {
                // Use stored end time if it exists and is for the same payment
                endTime = new Date(parseInt(storedEndTime));
                console.log('Using stored end time:', endTime);
            } else {
                // Otherwise calculate from payment data
                // Ensure payment_date is a valid date
                let paymentDate = new Date(latestPayment.payment_date);
                // Check if date is valid
                if (isNaN(paymentDate.getTime())) {
                    console.log('Invalid payment date detected, using current time');
                    // Use current time minus 1 minute as fallback
                    paymentDate = new Date(Date.now() - 60000);
                }
                
                const hoursInMs = latestPayment.hours * 60 * 60 * 1000;
                endTime = new Date(paymentDate.getTime() + hoursInMs);
                
                // Store the end time in localStorage for persistence
                localStorage.setItem('parkingEndTime', endTime.getTime());
                
                console.log('Calculated new end time:', endTime);
            }
            
            const now = new Date();
            
            console.log('End time:', endTime);
            console.log('Current time:', now);
            
            // Time left in milliseconds
            const timeLeftMs = endTime - now;
            console.log('Time left (ms):', timeLeftMs);
            
            if (timeLeftMs > 0) {
                // Convert to hours and minutes
                const hoursLeft = Math.floor(timeLeftMs / (60 * 60 * 1000));
                const minutesLeft = Math.floor((timeLeftMs % (60 * 60 * 1000)) / (60 * 1000));
                
                console.log('Hours left:', hoursLeft);
                console.log('Minutes left:', minutesLeft);
                
                // Update time left display
                const timeLeftElement = document.getElementById('timeLeftDisplay');
                if (timeLeftElement) {
                    timeLeftElement.textContent = `${hoursLeft} hr ${minutesLeft} min`;
                }
                
                // Update timer display
                const timerElement = document.getElementById('timerDisplay');
                if (timerElement) {
                    timerElement.textContent = `${hoursLeft}:${minutesLeft.toString().padStart(2, '0')}`;
                }
                
                // Start the countdown timer
                startCountdown(endTime);
            } else {
                console.log('Parking has expired');
                // Clear stored data if parking expired
                clearParkingData();
                // Parking has expired
                showExpiredParkingUI();
            }
            
            // Update total cost - ensure rate is a number
            const totalCostElement = document.getElementById('totalCostDisplay');
            if (totalCostElement) {
                // Convert rate to number if it's not already
                const rate = typeof latestPayment.rate === 'number' 
                    ? latestPayment.rate 
                    : parseFloat(String(latestPayment.rate)) || 0;
                
                // Calculate total cost (rate * hours)
                const totalCost = rate * latestPayment.hours;
                
                totalCostElement.textContent = `$${totalCost.toFixed(2)}`;
            }
            
            // Enable stop parking button
            const stopParkingBtn = document.getElementById('stopParkingBtn');
            if (stopParkingBtn) {
                stopParkingBtn.disabled = false;
                stopParkingBtn.classList.remove('opacity-50');
            }
            
            // Enable extend time button
            const extendTimeBtn = document.getElementById('extendTimeBtn');
            if (extendTimeBtn) {
                extendTimeBtn.disabled = false;
                extendTimeBtn.classList.remove('opacity-50');
            }
            
        } else {
            console.log('No payment data found or error fetching data');
            // Clear stored data if no payments found
            clearParkingData();
            showNoActiveParkingUI();
        }
    } catch (error) {
        console.error('Error fetching payment data:', error);
        showNoActiveParkingUI();
    }
});

// Helper function to clear all parking related data from localStorage
function clearParkingData() {
    localStorage.removeItem('parkingEndTime');
    localStorage.removeItem('currentPaymentId');
    localStorage.setItem('parkingStopped', 'true');
}

// Helper function to show UI for no active parking
function showNoActiveParkingUI() {
    // Clear any existing timer interval
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
        window.timerInterval = null;
    }
    
    const titleElement = document.querySelector('h1.text-5xl.font-bold');
    if (titleElement) {
        titleElement.textContent = 'No Active Parking';
    }
    
    const statusElement = document.querySelector('.text-green-500.mt-3.text-2xl');
    if (statusElement) {
        statusElement.textContent = 'Inactive';
        statusElement.classList.remove('text-green-500');
        statusElement.classList.remove('text-red-500');
        statusElement.classList.add('text-gray-500');
    }
    
    // Disable buttons when no active parking
    const stopParkingBtn = document.getElementById('stopParkingBtn');
    if (stopParkingBtn) {
        stopParkingBtn.disabled = true;
        stopParkingBtn.classList.add('opacity-50');
    }
    
    const extendTimeBtn = document.getElementById('extendTimeBtn');
    if (extendTimeBtn) {
        extendTimeBtn.disabled = true;
        extendTimeBtn.classList.add('opacity-50');
    }
    
    // Reset displays
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = '0:00';
    }
    
    const timeLeftDisplay = document.getElementById('timeLeftDisplay');
    if (timeLeftDisplay) {
        timeLeftDisplay.textContent = 'No active parking';
    }
    
    const totalCostDisplay = document.getElementById('totalCostDisplay');
    if (totalCostDisplay) {
        totalCostDisplay.textContent = '$0.00';
    }
}

// Helper function to show UI for expired parking
function showExpiredParkingUI() {
    // Clear any existing timer interval
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
        window.timerInterval = null;
    }
    
    const statusElement = document.querySelector('.text-green-500.mt-3.text-2xl');
    if (statusElement) {
        statusElement.textContent = 'Expired';
        statusElement.classList.remove('text-green-500');
        statusElement.classList.add('text-red-500');
    }
    
    const timeLeftDisplay = document.getElementById('timeLeftDisplay');
    if (timeLeftDisplay) {
        timeLeftDisplay.textContent = 'Expired';
    }
    
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = '0:00';
    }
}

// Function to start countdown timer
function startCountdown(endTime) {
    // Clear any existing timer interval
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
        window.timerInterval = null;
    }
    
    // Clear the parkingStopped flag since we're starting a timer
    localStorage.removeItem('parkingStopped');
    
    // Update timer every second
    window.timerInterval = setInterval(() => {
        const now = new Date();
        const timeLeftMs = endTime - now;
        
        if (timeLeftMs <= 0) {
            // Parking has expired
            clearInterval(window.timerInterval);
            window.timerInterval = null;
            clearParkingData();
            showExpiredParkingUI();
            return;
        }
        
        // Calculate hours and minutes left
        const hoursLeft = Math.floor(timeLeftMs / (60 * 60 * 1000));
        const minutesLeft = Math.floor((timeLeftMs % (60 * 60 * 1000)) / (60 * 1000));
        const secondsLeft = Math.floor((timeLeftMs % (60 * 1000)) / 1000);
        
        // Update timer display
        const timerElement = document.getElementById('timerDisplay');
        if (timerElement) {
            if (hoursLeft > 0) {
                timerElement.textContent = `${hoursLeft}:${minutesLeft.toString().padStart(2, '0')}`;
            } else {
                timerElement.textContent = `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`;
            }
        }
        
        // Update time left display
        const timeLeftElement = document.getElementById('timeLeftDisplay');
        if (timeLeftElement) {
            if (hoursLeft > 0) {
                timeLeftElement.textContent = `${hoursLeft} hr ${minutesLeft} min`;
            } else {
                timeLeftElement.textContent = `${minutesLeft} min ${secondsLeft} sec`;
            }
        }
    }, 1000);
}

// Set up event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Handle stop parking button
    const stopParkingBtn = document.getElementById('stopParkingBtn');
    if (stopParkingBtn) {
        stopParkingBtn.addEventListener('click', handleStopParking);
    }
    
    // Handle extend time button
    const extendTimeBtn = document.getElementById('extendTimeBtn');
    if (extendTimeBtn) {
        extendTimeBtn.addEventListener('click', function() {
            const modal = document.getElementById('extendTimeModal');
            if (modal) {
                modal.classList.remove('hidden');
            }
        });
    }
    
    // Handle modal cancel button
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    if (modalCancelBtn) {
        modalCancelBtn.addEventListener('click', function() {
            const modal = document.getElementById('extendTimeModal');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    }
    
    // Handle time increment buttons in modal
    const timeButtons = document.querySelectorAll('.modal-add-time-btn');
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const minutes = parseInt(this.dataset.time);
            const currentTime = parseInt(document.getElementById('modalManualTimeDisplay').textContent);
            document.getElementById('modalManualTimeDisplay').textContent = currentTime + minutes;
            updateModalCost();
        });
    });
    
    // Handle manual increment/decrement
    const modalIncrementTimeBtn = document.getElementById('modalIncrementTimeBtn');
    if (modalIncrementTimeBtn) {
        modalIncrementTimeBtn.addEventListener('click', function() {
            const currentTime = parseInt(document.getElementById('modalManualTimeDisplay').textContent);
            document.getElementById('modalManualTimeDisplay').textContent = currentTime + 5;
            updateModalCost();
        });
    }
    
    const modalDecrementTimeBtn = document.getElementById('modalDecrementTimeBtn');
    if (modalDecrementTimeBtn) {
        modalDecrementTimeBtn.addEventListener('click', function() {
            const currentTime = parseInt(document.getElementById('modalManualTimeDisplay').textContent);
            if (currentTime >= 5) {
                document.getElementById('modalManualTimeDisplay').textContent = currentTime - 5;
                updateModalCost();
            }
        });
    }
    
    // Handle confirm button in modal
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');
    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', handleExtendTime);
    }
});

// Handle stop parking
async function handleStopParking() {
    // Get payment ID from window or localStorage
    const paymentId = window.currentPaymentId || localStorage.getItem('currentPaymentId');
    
    if (!paymentId) {
        alert('No active parking to stop');
        return;
    }
    
    if (confirm('Are you sure you want to stop parking? This will end your current session.')) {
        try {
            const response = await fetch(`/api/payment/stop/${paymentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Clear stored data on successful stop
                clearParkingData();
                
                // Update UI immediately
                showNoActiveParkingUI();
                
                // Notify user
                alert(`Parking stopped. Final cost: $${result.actual_cost}`);
                
                // Redirect to map page after a short delay
                setTimeout(() => {
                    window.location.href = 'map.html';
                }, 1000);
            } else {
                alert('Failed to stop parking: ' + result.message);
            }
        } catch (error) {
            console.error('Error stopping parking:', error);
            alert('Failed to stop parking. Please try again.');
        }
    }
}

// Update modal cost based on time
function updateModalCost() {
    const minutes = parseInt(document.getElementById('modalManualTimeDisplay').textContent);
    const rateText = document.getElementById('totalCostDisplay').textContent;
    
    // Get the total cost from the display
    const totalCost = parseFloat(rateText.replace(/[^0-9.]/g, ''));
    
    // Get the active payment to determine hourly rate
    const paymentId = window.currentPaymentId || localStorage.getItem('currentPaymentId');
    
    // Calculate hourly rate based on total cost and hours
    let hourlyRate = 0;
    const payments = window.latestPayments;
    
    if (payments && payments.length > 0) {
        for (const payment of payments) {
            if (payment.payment_id == paymentId) {
                // Convert rate to number if it's not already
                hourlyRate = typeof payment.rate === 'number' 
                    ? payment.rate 
                    : parseFloat(String(payment.rate)) || 0;
                break;
            }
        }
    }
    
    // Fallback: if we couldn't find the payment or rate
    if (hourlyRate === 0) {
        // Try to estimate hourly rate from total cost
        const hoursDisplay = document.getElementById('timeLeftDisplay').textContent;
        const hoursMatch = hoursDisplay.match(/(\d+)\s*hr/);
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 1;
        
        if (hours > 0) {
            hourlyRate = totalCost / hours;
        } else {
            // Just use a default rate of $2.50 as last resort
            hourlyRate = 2.50;
        }
    }
    
    const additionalCost = (hourlyRate * minutes / 60).toFixed(2);
    document.getElementById('modalTimeToAdd').textContent = `${minutes} min`;
    document.getElementById('modalAdditionalCost').textContent = `$${additionalCost}`;
}

// Handle extend time
async function handleExtendTime() {
    const minutes = parseInt(document.getElementById('modalManualTimeDisplay').textContent);
    if (minutes <= 0) return;
    
    try {
        // Get the current payment data
        const userId = 1; // Default user ID
        const response = await fetch(`/api/payment/history/${userId}`);
        const data = await response.json();
        
        if (data.success && data.payments && data.payments.length > 0) {
            // Find the most recent payment with hours > 0
            let latestPayment = null;
            for (const payment of data.payments) {
                if (payment.hours > 0) {
                    latestPayment = payment;
                    break;
                }
            }
            
            if (!latestPayment) {
                alert('No active parking found');
                return;
            }
            
            // Ensure rate is a number
            const rate = typeof latestPayment.rate === 'number' 
                ? latestPayment.rate 
                : parseFloat(String(latestPayment.rate)) || 0;
            
            // Create a new payment with extended time
            const extendResponse = await fetch('/api/payment/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    vehicle_number: latestPayment.vehicle_number,
                    rate: rate,
                    street_number: latestPayment.street_number,
                    hours: 0,
                    minutes: minutes
                })
            });
            
            const extendResult = await extendResponse.json();
            
            if (extendResult.success) {
                // Remove the parkingStopped flag since we're extending the time
                localStorage.removeItem('parkingStopped');
                
                // Reload the page to show updated time
                window.location.reload();
            } else {
                alert('Failed to extend time: ' + extendResult.message);
            }
        }
    } catch (error) {
        console.error('Error extending time:', error);
        alert('Failed to extend time. Please try again.');
    }
    
    // Hide the modal
    document.getElementById('extendTimeModal').classList.add('hidden');
} 