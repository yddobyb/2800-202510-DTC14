function togglePassword() {
    const inp = document.getElementById('password');
    const icon = document.getElementById('toggleViewIcon');

    if (inp.type === 'password') {
        inp.type = 'text';
        icon.src = 'public/asset/hidden.png';
    } else {
        inp.type = 'password';
        icon.src = 'public/asset/view.png';
    }
}