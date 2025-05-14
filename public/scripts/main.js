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
