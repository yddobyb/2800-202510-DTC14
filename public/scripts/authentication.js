function togglePassword() {
    const inp = document.getElementById('password');
    const icon = document.getElementById('toggleViewIcon');

    if (inp.type === 'password') {
        inp.type = 'text';
        icon.src = './asset/hidden.png';
    } else {
        inp.type = 'password';
        icon.src = './asset/view.png';
    }
}

// login
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'success') {
        document.getElementById('guest-links').style.display = 'none';
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'invalid') {
        alert('Invalid email or password.');
        document.getElementById('loginForm').reset();
        history.replaceState(null, '', 'login.html');
    }
});

// register
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'emailExists') {
        document.getElementById('error-msg').textContent = 'This email address is already registered.';
    }
});

//forgot password
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'notfound') {
        alert('The information you entered is incorrect or you are not registered.');
        history.replaceState(null, '', 'forgotpassword.html');
    }
    if (params.get('sent') === 'true') {
        alert('A password reset email has been sent. Please check your inbox.');
        history.replaceState(null, '', 'forgotpassword.html');
    }
});

//reset password
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token') || '';
    console.log('reset 토큰:', token);
    document.querySelector('[name=token]').value = token;

    if (params.get('error') === 'invalid') {
        alert('Invalid password reset link.');
    }
    if (params.get('error') === 'expired') {
        alert('Your reset link has expired.');
    }
    if (params.get('error') === 'validation') {
        alert('Passwords do not match.');
    }
    if (params.get('reset') === 'success') {
        alert('Your password has been updated.');
    }
    history.replaceState(null, '', 'reset_password.html' + (token ? `?token=${token}` : ''));
});