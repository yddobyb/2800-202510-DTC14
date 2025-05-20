// Status page script to fetch and display payment data
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('Status page loaded, checking for active parking...');
        
        // Check if we have stored parking data
        const storedEndTime = localStorage.getItem('parkingEndTime');
        const storedPaymentId = localStorage.getItem('currentPaymentId');
        const parkingStopped = localStorage.getItem('parkingStopped');
        const parkingLocation = localStorage.getItem('parkingLocation');
        const parkingRate = localStorage.getItem('parkingRate');
        const parkingHours = localStorage.getItem('parkingHours');
        const parkingMinutes = localStorage.getItem('parkingMinutes');
        const parkingTotal = localStorage.getItem('parkingTotal');
        
        // If we previously stopped parking or no stored data, show inactive UI
        if (parkingStopped === 'true' || !storedEndTime) {
            console.log('No active parking found');
            showNoActiveParkingUI();
            return;
        }
        
        console.log('Active parking found with end time:', new Date(parseInt(storedEndTime)));
        
        // Update parking spot (street number)
        const parkingSpotElement = document.querySelector('.mt-16.px-10 div:nth-child(1) span:last-child');
        if (parkingSpotElement && parkingLocation) {
            parkingSpotElement.textContent = parkingLocation;
        }
        
        const endTime = new Date(parseInt(storedEndTime));
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
            return;
        }
        
        // Update total cost
        const totalCostElement = document.getElementById('totalCostDisplay');
        if (totalCostElement && parkingTotal) {
            totalCostElement.textContent = `$${parkingTotal}`;
        }
        
        // Enable stop parking button
        const stopParkingBtn = document.getElementById('stopParkingBtn');
        if (stopParkingBtn) {
            stopParkingBtn.disabled = false;
            stopParkingBtn.classList.remove('opacity-50');
            
            // Add click event listener
            stopParkingBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to stop parking? This will end your current session.')) {
                    handleStopParking();
                }
            });
        }
        
        // Enable extend time button
        const extendTimeBtn = document.getElementById('extendTimeBtn');
        if (extendTimeBtn) {
            extendTimeBtn.disabled = false;
            extendTimeBtn.classList.remove('opacity-50');
            
            // Add click event listener for extend time button
            extendTimeBtn.addEventListener('click', function() {
                // Show extend time modal
                const modal = document.getElementById('extendTimeModal');
                if (modal) {
                    modal.classList.remove('hidden');
                }
            });
        }
        
    } catch (error) {
        console.error('Error loading parking data:', error);
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

// Helper function to handle the Stop Parking button click
async function handleStopParking() {
    try {
        // Mark parking as stopped and clear active parking data
        localStorage.setItem('parkingStopped', 'true');
        
        // Update UI to show no active parking
        showNoActiveParkingUI();
        
        // Show confirmation message
        alert('Parking has been stopped.');
        
    } catch (error) {
        console.error('Error stopping parking:', error);
        alert('Failed to stop parking. Please try again.');
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

// Handle modal buttons
const modalCancelBtn = document.getElementById('modalCancelBtn');
if (modalCancelBtn) {
    modalCancelBtn.addEventListener('click', function() {
        const modal = document.getElementById('extendTimeModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    });
}

// Set up modal increment/decrement buttons for time adjustment
setupModalTimeControls();

// Function to set up modal time extension controls
function setupModalTimeControls() {
    // Get modal elements
    const addTimeButtons = document.querySelectorAll('.modal-add-time-btn');
    const incrementBtn = document.getElementById('modalIncrementTimeBtn');
    const decrementBtn = document.getElementById('modalDecrementTimeBtn');
    const timeDisplay = document.getElementById('modalManualTimeDisplay');
    const timeToAddDisplay = document.getElementById('modalTimeToAdd');
    const additionalCostDisplay = document.getElementById('modalAdditionalCost');
    
    // Set initial values
    let minutesToAdd = 0;
    let rate = parseFloat(localStorage.getItem('parkingRate')?.replace(/[^0-9.]/g, '') || '0');
    
    // Update displays function
    function updateDisplays() {
        // Format time display
        if (timeDisplay) timeDisplay.textContent = minutesToAdd;
        
        // Format time to add display
        if (timeToAddDisplay) {
            timeToAddDisplay.textContent = minutesToAdd < 60 
                ? `${minutesToAdd} min` 
                : `${Math.floor(minutesToAdd / 60)} hr ${minutesToAdd % 60} min`;
        }
        
        // Calculate and format cost
        if (additionalCostDisplay) {
            const cost = (rate * (minutesToAdd / 60)).toFixed(2);
            additionalCostDisplay.textContent = `$${cost}`;
        }
    }
    
    // Handle preset time buttons (5, 10, 15, 30 mins)
    if (addTimeButtons) {
        addTimeButtons.forEach(button => {
            button.addEventListener('click', function() {
                minutesToAdd = parseInt(this.getAttribute('data-time'), 10) || 0;
                updateDisplays();
            });
        });
    }
    
    // Handle increment button
    if (incrementBtn) {
        incrementBtn.addEventListener('click', function() {
            minutesToAdd += 5;
            updateDisplays();
        });
    }
    
    // Handle decrement button
    if (decrementBtn) {
        decrementBtn.addEventListener('click', function() {
            minutesToAdd = Math.max(0, minutesToAdd - 5);
            updateDisplays();
        });
    }
    
    // Handle confirm button
    const confirmBtn = document.getElementById('modalConfirmBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            if (minutesToAdd <= 0) {
                alert('Please select a time to add');
                return;
            }
            
            // Get current end time
            const currentEndTime = parseInt(localStorage.getItem('parkingEndTime'));
            if (!currentEndTime) {
                alert('No active parking session found');
                return;
            }
            
            // Add time to end time
            const newEndTime = currentEndTime + (minutesToAdd * 60 * 1000);
            localStorage.setItem('parkingEndTime', newEndTime);
            
            // Update total cost
            const currentTotal = parseFloat(localStorage.getItem('parkingTotal') || '0');
            const additionalCost = (rate * (minutesToAdd / 60));
            const newTotal = (currentTotal + additionalCost).toFixed(2);
            localStorage.setItem('parkingTotal', newTotal);
            
            // Update total cost display
            const totalCostDisplay = document.getElementById('totalCostDisplay');
            if (totalCostDisplay) {
                totalCostDisplay.textContent = `$${newTotal}`;
            }
            
            // Restart countdown timer with new end time
            startCountdown(new Date(newEndTime));
            
            // Close modal
            const modal = document.getElementById('extendTimeModal');
            if (modal) {
                modal.classList.add('hidden');
            }
            
            // Show success message
            alert(`Parking time extended by ${minutesToAdd} minutes`);
            
            // Reset minutes to add
            minutesToAdd = 0;
            updateDisplays();
        });
    }
} 