const toggle = document.getElementById("toggleNotification");
const remindSection = document.getElementById("remindSection");
const timeButtons = document.querySelectorAll(".time-btn");

document.addEventListener("DOMContentLoaded", loadUserPreferences);

toggle.addEventListener("change", () => {
    if (toggle.checked) {
        remindSection.classList.remove("hidden");
        saveNotificationSetting(true);
    } else {
        remindSection.classList.add("hidden");
        saveNotificationSetting(false);
    }
});

timeButtons.forEach(button => {
    button.addEventListener("click", function () {
        timeButtons.forEach(btn => btn.classList.remove("selected"));

        this.classList.add("selected");

        const time = this.getAttribute("data-time");
        saveTimePreference(time);
    });
});

function saveTimePreference(time) {
    fetch('/api/preferences/notifications', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationTime: time })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save preference');
            }
            return response.json();
        })
        .then(data => {
            console.log('Preference saved:', data);
        })
        .catch(error => {
            console.error('Error saving preference:', error);
        });
}

function saveNotificationSetting(enabled) {
    fetch('/api/preferences/notifications-enabled', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: enabled })
    })
        .catch(error => {
            console.error('Error saving notification setting:', error);
        });
}

function loadUserPreferences() {
    fetch('/api/preferences')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load preferences');
            }
            return response.json();
        })
        .then(data => {
            if (data.notificationsEnabled) {
                toggle.checked = true;
                remindSection.classList.remove("hidden");
            }

            if (data.notificationTime) {
                const timeButton = document.querySelector(`.time-btn[data-time="${data.notificationTime}"]`);
                if (timeButton) {
                    timeButton.classList.add("selected");
                }
            }
        })
        .catch(error => {
            console.error('Error loading preferences:', error);
        });
} 