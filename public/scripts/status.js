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
                    
                    // Reset the minutes display when opening the modal
                    const timeDisplay = document.getElementById('modalManualTimeDisplay');
                    if (timeDisplay) timeDisplay.textContent = '0';
                    
                    const timeToAddDisplay = document.getElementById('modalTimeToAdd');
                    if (timeToAddDisplay) timeToAddDisplay.textContent = '0 min';
                    
                    const additionalCostDisplay = document.getElementById('modalAdditionalCost');
                    if (additionalCostDisplay) additionalCostDisplay.textContent = '$0.00';
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
        
        // Handle modal confirm button
        const modalConfirmBtn = document.getElementById('modalConfirmBtn');
        if (modalConfirmBtn) {
            modalConfirmBtn.addEventListener('click', handleExtendTime);
        }
        
        // Set up modal increment/decrement buttons for time adjustment
        setupModalTimeControls();
        
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

// Create a variable to store minutesToAdd that can be accessed across functions
let globalMinutesToAdd = 0;

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
    globalMinutesToAdd = 0;
    let rate = parseFloat(localStorage.getItem('parkingRate')?.replace(/[^0-9.]/g, '') || '0');
    
    // Update displays function
    function updateDisplays() {
        // Format time display
        if (timeDisplay) timeDisplay.textContent = globalMinutesToAdd;
        
        // Format time to add display
        if (timeToAddDisplay) {
            timeToAddDisplay.textContent = globalMinutesToAdd < 60 
                ? `${globalMinutesToAdd} min` 
                : `${Math.floor(globalMinutesToAdd / 60)} hr ${globalMinutesToAdd % 60} min`;
        }
        
        // Calculate and format cost
        if (additionalCostDisplay) {
            const cost = (rate * (globalMinutesToAdd / 60)).toFixed(2);
            additionalCostDisplay.textContent = `$${cost}`;
        }
    }
    
    // Handle preset time buttons (5, 10, 15, 30 mins)
    if (addTimeButtons) {
        addTimeButtons.forEach(button => {
            button.addEventListener('click', function() {
                globalMinutesToAdd = parseInt(this.getAttribute('data-time'), 10) || 0;
                updateDisplays();
            });
        });
    }
    
    // Handle increment button
    if (incrementBtn) {
        incrementBtn.addEventListener('click', function() {
            globalMinutesToAdd += 5;
            updateDisplays();
        });
    }
    
    // Handle decrement button
    if (decrementBtn) {
        decrementBtn.addEventListener('click', function() {
            globalMinutesToAdd = Math.max(0, globalMinutesToAdd - 5);
            updateDisplays();
        });
    }
    
    // The confirm button handler is now in the main DOMContentLoaded event listener
    // to avoid duplicate event listeners
}

// Handle extend time
async function handleExtendTime() {
    if (globalMinutesToAdd <= 0) {
        alert('Please select a time to add');
        return;
    }
    
    try {
        // Get current end time
        const currentEndTime = parseInt(localStorage.getItem('parkingEndTime'));
        if (!currentEndTime) {
            alert('No active parking session found');
            return;
        }
        
        // Add time to end time
        const newEndTime = currentEndTime + (globalMinutesToAdd * 60 * 1000);
        localStorage.setItem('parkingEndTime', newEndTime);
        
        // Get rate from localStorage
        const rate = parseFloat(localStorage.getItem('parkingRate')?.replace(/[^0-9.]/g, '') || '2.50');
        
        // Update total cost
        const currentTotal = parseFloat(localStorage.getItem('parkingTotal') || '0');
        const additionalCost = (rate * (globalMinutesToAdd / 60));
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
        alert(`Parking time extended by ${globalMinutesToAdd} minutes`);
        
        // Reset minutes to add
        globalMinutesToAdd = 0;
        
        // You might also want to try to update the server, but we'll use local storage first
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
                
                if (latestPayment) {
                    // Create a new payment with extended time
                    await fetch('/api/payment/save', {
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
                            minutes: globalMinutesToAdd
                        })
                    });
                }
            }
        } catch (serverError) {
            console.error('Error updating server:', serverError);
            // Continue with local storage changes even if server update fails
        }
        
    } catch (error) {
        console.error('Error extending time:', error);
        alert('Failed to extend time. Please try again.');
    }
} 

async function checkForNotifications() {
    try {
        const storedEndTime = localStorage.getItem('parkingEndTime');
        const parkingLocation = localStorage.getItem('parkingLocation');
        const vehicleNumber = localStorage.getItem('vehicleNumber');
        const parkingStopped = localStorage.getItem('parkingStopped');

        // Only check if we have active parking
        if (parkingStopped === 'true' || !storedEndTime) {
            return;
        }

        const endTime = parseInt(storedEndTime);
        const now = Date.now();

        // Only check if parking hasn't expired
        if (endTime > now) {
            const response = await fetch('/api/notifications/check-parking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    endTime: endTime,
                    location: parkingLocation,
                    vehicleNumber: vehicleNumber
                })
            });

            const result = await response.json();

            if (result.shouldNotify) {
                console.log('Parking notification sent:', result.message);
            }
        }
    } catch (error) {
        console.error('Notification check failed:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function () {

    checkForNotifications();

    // Check for notifications every x amount of time if parking is active
    setInterval(() => {
        const parkingStopped = localStorage.getItem('parkingStopped');
        const storedEndTime = localStorage.getItem('parkingEndTime');

        if (parkingStopped !== 'true' && storedEndTime) {
            checkForNotifications();
        }
    }, 5 * 60 * 1000); // 5 minutes
});