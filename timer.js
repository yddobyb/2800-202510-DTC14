document.addEventListener('DOMContentLoaded', () => {
    const timerDisplayCircle = document.getElementById('timerDisplay');
    const timeLeftDisplayDetail = document.getElementById('timeLeftDisplay');
    const stopParkingButton = document.getElementById('stopParkingBtn');
    const extendTimeButton = document.getElementById('extendTimeBtn');
    
    let totalSeconds = 23 * 60; 
    let timerInterval;

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

    function updateDisplay() {
        timerDisplayCircle.textContent = formatTimeForCircle(totalSeconds);
        timeLeftDisplayDetail.textContent = formatTimeForDetail(totalSeconds);

        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            timerDisplayCircle.textContent = "0:00";
            timeLeftDisplayDetail.textContent = "Expired";
            if(stopParkingButton) stopParkingButton.disabled = true;
            if(extendTimeButton) extendTimeButton.disabled = true;
            if(extendTimeButton) extendTimeButton.classList.add('opacity-50', 'cursor-not-allowed');
            if(stopParkingButton) stopParkingButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    function startTimer() {
        clearInterval(timerInterval); 
        if(stopParkingButton) stopParkingButton.disabled = false;
        if(extendTimeButton) extendTimeButton.disabled = false;
        if(extendTimeButton) extendTimeButton.classList.remove('opacity-50', 'cursor-not-allowed');
        if(stopParkingButton) stopParkingButton.classList.remove('opacity-50', 'cursor-not-allowed');

        timerInterval = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds--;
                updateDisplay();
            } else {
                updateDisplay(); 
            }
        }, 1000);
        updateDisplay(); 
    }

    function stopTimer() {
        clearInterval(timerInterval);
        if(stopParkingButton) {
            stopParkingButton.textContent = 'PARKING STOPPED';
            stopParkingButton.disabled = true;
            stopParkingButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
        if(extendTimeButton) {
            extendTimeButton.disabled = true; 
            extendTimeButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    function extendTimer() {
        const minutesToAdd = prompt("How many minutes would you like to add?", "10");
        if (minutesToAdd !== null && !isNaN(minutesToAdd) && parseInt(minutesToAdd) > 0) {
            totalSeconds += parseInt(minutesToAdd) * 60;
            updateDisplay();
        } else if (minutesToAdd !== null) {
            alert("Please enter a valid number of minutes.");
        }
    }

    if(stopParkingButton) stopParkingButton.addEventListener('click', stopTimer);
    if(extendTimeButton) extendTimeButton.addEventListener('click', extendTimer);

    startTimer();
}); 