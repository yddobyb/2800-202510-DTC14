document.addEventListener('DOMContentLoaded', () => {
    const timerDisplayCircle = document.getElementById('timerDisplay');
    const timeLeftDisplayDetail = document.getElementById('timeLeftDisplay');
    const totalCostDisplay = document.getElementById('totalCostDisplay'); 
    const stopParkingButton = document.getElementById('stopParkingBtn');
    const extendTimeButton = document.getElementById('extendTimeBtn');

    const extendTimeModal = document.getElementById('extendTimeModal');
    const modalTimeToAddDisplay = document.getElementById('modalTimeToAdd');
    const modalAdditionalCostDisplay = document.getElementById('modalAdditionalCost');
    const modalManualTimeDisplay = document.getElementById('modalManualTimeDisplay');
    const modalQuickAddButtons = document.querySelectorAll('.modal-add-time-btn');
    const modalIncrementTimeBtn = document.getElementById('modalIncrementTimeBtn');
    const modalDecrementTimeBtn = document.getElementById('modalDecrementTimeBtn');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');

    let totalSeconds = 23 * 60;
    let timerInterval = null; 
    let currentParkingCost = 5.80; 
    const costPerMinute = 0.10;

    let currentModalMinutesToAdd = 0;

    function formatTimeForCircle(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedMinutes = String(minutes).padStart(1, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    }

    function formatTimeForDetail(seconds) {
        if (seconds < 0) seconds = 0;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours} hr ${minutes} min`;
        }
        return `${minutes} min`;
    }

    function formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }

    function updateMainDisplay() {
        timerDisplayCircle.textContent = formatTimeForCircle(totalSeconds);
        timeLeftDisplayDetail.textContent = formatTimeForDetail(totalSeconds);
        totalCostDisplay.textContent = formatCurrency(currentParkingCost);

        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null; 
            timerDisplayCircle.textContent = "0:00";
            timeLeftDisplayDetail.textContent = "Expired";
     
            stopParkingButton.disabled = true;
            stopParkingButton.classList.add('opacity-50', 'cursor-not-allowed');


            if (!stopParkingButton.textContent.includes('STOPPED')) { 
                extendTimeButton.disabled = true;
                extendTimeButton.classList.add('opacity-50', 'cursor-not-allowed');
            }

        } else { 
            stopParkingButton.disabled = false;
            extendTimeButton.disabled = false;
            extendTimeButton.classList.remove('opacity-50', 'cursor-not-allowed');
            stopParkingButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = null;

        stopParkingButton.disabled = false;
        extendTimeButton.disabled = false;
        extendTimeButton.classList.remove('opacity-50', 'cursor-not-allowed');
        stopParkingButton.classList.remove('opacity-50', 'cursor-not-allowed');
        if (stopParkingButton.textContent === 'PARKING STOPPED') {
            stopParkingButton.textContent = 'STOP PARKING';
        }

        timerInterval = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds--;
                updateMainDisplay();
            } else {
              
                updateMainDisplay(); 
            }
        }, 1000);
        updateMainDisplay(); 
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        totalSeconds = 0;
        currentParkingCost = 0;

        updateMainDisplay(); 
        
        stopParkingButton.textContent = 'PARKING STOPPED';
        
        stopParkingButton.disabled = true; 
        stopParkingButton.classList.add('opacity-50', 'cursor-not-allowed');

        extendTimeButton.disabled = false;
        extendTimeButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    
    function updateModalDisplay() {
        modalTimeToAddDisplay.textContent = `${currentModalMinutesToAdd} min`;
        const additionalCost = currentModalMinutesToAdd * costPerMinute;
        modalAdditionalCostDisplay.textContent = formatCurrency(additionalCost);
        modalManualTimeDisplay.textContent = currentModalMinutesToAdd;
    }

    function openExtendModal() {
        currentModalMinutesToAdd = 0; 
        updateModalDisplay();
        extendTimeModal.classList.remove('hidden');
    }

    function closeExtendModal() {
        extendTimeModal.classList.add('hidden');
    }

    modalQuickAddButtons.forEach(button => {
        button.addEventListener('click', () => {
            const time = parseInt(button.dataset.time);
            currentModalMinutesToAdd += time;
            updateModalDisplay();
        });
    });

    modalIncrementTimeBtn.addEventListener('click', () => {
        currentModalMinutesToAdd += 1; 
        updateModalDisplay();
    });

    modalDecrementTimeBtn.addEventListener('click', () => {
        currentModalMinutesToAdd = Math.max(0, currentModalMinutesToAdd - 1); 
        updateModalDisplay();
    });

    modalConfirmBtn.addEventListener('click', () => {
        if (currentModalMinutesToAdd > 0) {
            const additionalCost = currentModalMinutesToAdd * costPerMinute;
            currentParkingCost += additionalCost;
            totalSeconds += currentModalMinutesToAdd * 60;

            closeExtendModal();
            
            startTimer(); 
            
        } else {
            alert("Please add some time to extend.");
        }
    });

    modalCancelBtn.addEventListener('click', closeExtendModal);
    
    

    stopParkingButton.addEventListener('click', stopTimer);
    extendTimeButton.addEventListener('click', openExtendModal);

    updateMainDisplay(); 
    startTimer(); 
}); 