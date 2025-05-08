document.addEventListener('DOMContentLoaded', () => {
    const timerDisplayCircle = document.getElementById('timerDisplay');
    const timeLeftDisplayDetail = document.getElementById('timeLeftDisplay');
    
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
        }
    }

    function startTimer() {
        clearInterval(timerInterval); 
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

    startTimer();
}); 