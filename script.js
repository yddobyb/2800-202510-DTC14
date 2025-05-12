document.addEventListener('DOMContentLoaded', function () {
    // Duration/Park Until toggle
    const durationBtn = document.querySelector('[data-button="duration"]');
    const parkUntilBtn = document.querySelector('[data-button="park-until"]');

    if (durationBtn && parkUntilBtn) {
        durationBtn.addEventListener('click', () => {
            durationBtn.classList.add('bg-green-500', 'text-white');
            durationBtn.classList.remove('text-gray-600');
            parkUntilBtn.classList.remove('bg-blue-500', 'text-white');
            parkUntilBtn.classList.add('text-gray-600');
        });

        parkUntilBtn.addEventListener('click', () => {
            parkUntilBtn.classList.add('bg-blue-500', 'text-white');
            parkUntilBtn.classList.remove('text-gray-600');
            durationBtn.classList.remove('bg-green-500', 'text-white');
            durationBtn.classList.add('text-gray-600');
        });
    }

    // Time selection
    const hourInput = document.querySelector('[data-input="hour"]');
    const minuteInput = document.querySelector('[data-input="minute"]');

    if (hourInput && minuteInput) {
        // Update continue button state based on time selection
        const updateContinueButton = () => {
            const continueBtn = document.querySelector('[data-button="continue"]');
            const hour = parseInt(hourInput.textContent);
            const minute = parseInt(minuteInput.textContent);

            if (hour > 0 || minute > 0) {
                continueBtn.classList.remove('bg-gray-200', 'text-gray-500');
                continueBtn.classList.add('bg-[#2553E9]', 'text-white');
                continueBtn.disabled = false;
            } else {
                continueBtn.classList.add('bg-gray-200', 'text-gray-500');
                continueBtn.classList.remove('bg-[#2553E9]', 'text-white');
                continueBtn.disabled = true;
            }
        };

        // Initialize time selection
        updateContinueButton();

        // Add click handlers for time adjustment
        hourInput.addEventListener('click', () => {
            const currentHour = parseInt(hourInput.textContent);
            if (currentHour < 24) {
                hourInput.textContent = currentHour + 1;
            } else {
                hourInput.textContent = 0;
            }
            updateContinueButton();
        });

        minuteInput.addEventListener('click', () => {
            const currentMinute = parseInt(minuteInput.textContent);
            if (currentMinute < 45) {
                minuteInput.textContent = currentMinute + 15;
            } else {
                minuteInput.textContent = 0;
            }
            updateContinueButton();
        });
    }

    // Notification dropdown
    const notificationDropdown = document.querySelector('[data-dropdown="notification"]');
    if (notificationDropdown) {
        notificationDropdown.addEventListener('click', () => {
            // Toggle dropdown menu
            const dropdownMenu = document.querySelector('[data-dropdown-menu="notification"]');
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('hidden');
            }
        });

        // Handle notification selection
        const notificationOptions = document.querySelectorAll('[data-dropdown-menu="notification"] div');
        notificationOptions.forEach(option => {
            option.addEventListener('click', () => {
                const selectedText = option.textContent;
                notificationDropdown.querySelector('p').textContent = selectedText;
                document.querySelector('[data-dropdown-menu="notification"]').classList.add('hidden');
            });
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('[data-dropdown="notification"]')) {
            const dropdownMenu = document.querySelector('[data-dropdown-menu="notification"]');
            if (dropdownMenu && !dropdownMenu.classList.contains('hidden')) {
                dropdownMenu.classList.add('hidden');
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.querySelector('[data-dropdown="cards"]');
    const menu = document.querySelector('[data-dropdown-menu="cards"]');
    if (toggleBtn && menu) {
        toggleBtn.addEventListener('click', e => {
            e.stopPropagation();
            menu.classList.toggle('hidden');
        });
    }

    const addCardBtn = document.querySelector('[data-action="add-card"]');
    const newCardForm = document.querySelector('[data-form="new-card"]');
    if (addCardBtn && newCardForm) {
        addCardBtn.addEventListener('click', () => {
            newCardForm.classList.toggle('hidden');
        });
    }

    document.addEventListener('click', e => {
        if (!e.target.closest('[data-dropdown="cards"]') &&
            !e.target.closest('[data-dropdown-menu="cards"]')) {
            menu.classList.add('hidden');
            newCardForm.classList.add('hidden');
        }
    });

    newCardForm?.addEventListener('submit', e => {
        e.preventDefault();
        const cardNumber = newCardForm.querySelector('input[placeholder="Card Number"]').value;
        const last4 = cardNumber.slice(-4);
        const newCardDiv = document.createElement('div');
        newCardDiv.textContent = `•••• ${last4}`;
        newCardDiv.className = 'px-4 py-3 hover:bg-gray-50 cursor-pointer';
        menu.querySelector('.divide-y').appendChild(newCardDiv);

        newCardForm.classList.add('hidden');
        menu.classList.add('hidden');
    });
});
  