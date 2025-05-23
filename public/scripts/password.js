document.querySelectorAll('.toggle-btn').forEach(button => {
    button.addEventListener('click', () => {
        const input = button.parentElement.querySelector('.toggle-password');
        const icon = button.querySelector('img');

        if (input.type === 'password') {
            input.type = 'text';
            icon.src = 'asset/eye.png';
        } else {
            input.type = 'password';
            icon.src = 'asset/hidden.png';
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('password-form');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const submitButton = document.getElementById('submit-button');
    const csrfToken = document.getElementById('csrf-token');
    const statusMessage = document.getElementById('status-message');
    const passwordMatchFeedback = document.getElementById('password-match-feedback');

    fetch('/password/csrf-token')
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

    confirmPasswordInput.addEventListener('input', function () {
        if (!confirmPasswordInput.value) {
            passwordMatchFeedback.classList.add('hidden');
            return;
        }

        passwordMatchFeedback.classList.remove('hidden');

        if (newPasswordInput.value === confirmPasswordInput.value) {
            passwordMatchFeedback.textContent = 'Passwords match';
            passwordMatchFeedback.classList.remove('text-red-500');
            passwordMatchFeedback.classList.add('text-green-500');
        } else {
            passwordMatchFeedback.textContent = 'Passwords do not match';
            passwordMatchFeedback.classList.remove('text-green-500');
            passwordMatchFeedback.classList.add('text-red-500');
        }
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (newPasswordInput.value !== confirmPasswordInput.value) {
            showStatus('Passwords do not match', 'error');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPasswordInput.value)) {
            showStatus('Password must be at least 8 characters and include uppercase, lowercase, number and special character', 'error');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Updating...';

        const formData = new FormData(form);

        fetch('/password/update', {
            method: 'POST',
            body: new URLSearchParams(formData),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(response => {
                const contentType = response.headers.get('content-type');

                if (!response.ok) {
                    if (contentType && contentType.includes('application/json')) {
                        return response.json().then(data => {
                            throw new Error(data.error || 'An error occurred');
                        });
                    } else {
                        return response.text().then(text => {
                            console.error('Error response:', text);
                            throw new Error(text || 'An error occurred');
                        });
                    }
                }

                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    return { message: 'Password updated successfully' };
                }
            })
            .then(data => {
                showStatus(data.message || 'Password updated successfully!', 'success');
                form.reset();

                // Redirect
                setTimeout(() => {
                    window.location.href = '/main.html?password_updated=true';
                }, 2000);
            })
            .catch(error => {
                console.error('Error:', error);
                showStatus(error.message || 'Failed to update password', 'error');
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