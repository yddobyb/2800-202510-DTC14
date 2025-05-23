document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('email-form');
    const emailInput = document.getElementById('new-email');
    const submitButton = document.getElementById('submit-button');
    const csrfToken = document.getElementById('csrf-token');

    let statusMessage = document.getElementById('status-message');

    fetch('/email/csrf-token')
        .then(response => {
            if (!response.ok) {
                console.warn('CSRF endpoint not available yet:', response.status);
                return { csrfToken: '' };
            }
            return response.json();
        })
        .then(data => {
            if (data && data.csrfToken) {
                csrfToken.value = data.csrfToken;
            }
        })
        .catch(error => {
            console.error('Error fetching CSRF token:', error);
        });

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            showStatus('Please enter a valid email address', 'error');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        const formData = new FormData(form);

        fetch('/email/update', {
            method: 'POST',
            body: new URLSearchParams(formData),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(response => {
                if (response.status === 404) {
                    throw new Error('Server endpoint not found. Please check the server configuration.');
                }

                const contentType = response.headers.get('content-type');

                if (!response.ok) {
                    if (contentType && contentType.includes('application/json')) {
                        return response.json().then(data => {
                            throw new Error(data.error || 'An error occurred');
                        });
                    } else {
                        return response.text().then(text => {
                            throw new Error(text || 'An error occurred');
                        });
                    }
                }

                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    return { message: 'Email verification code sent successfully' };
                }
            })
            .then(data => {
                showStatus(data.message || 'Verification code sent to your new email', 'success');

                if (data.redirect) {
                    setTimeout(() => {
                        window.location.href = data.redirect;
                    }, 2000);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showStatus(error.message || 'Failed to send verification code', 'error');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Update';
            });
    });

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.classList.remove('hidden');

        if (type === 'success') {
            statusMessage.className = 'mb-4 py-2 px-4 rounded-lg text-center bg-green-100 text-green-800';
        } else {
            statusMessage.className = 'mb-4 py-2 px-4 rounded-lg text-center bg-red-100 text-red-800';
        }

        setTimeout(function () {
            statusMessage.classList.add('hidden');
        }, 5000);
    }
}); 