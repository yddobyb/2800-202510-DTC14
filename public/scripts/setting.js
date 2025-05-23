function handleLogout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

async function populateUsername() {
    try {
        const res = await fetch('/api/session-user');
        if (!res.ok) throw new Error('User not logged in');
        const data = await res.json();
        console.log(data);
        console.log(data.username);
        document.getElementById('user-name').textContent = data.username;
    } catch (err) {
        console.error(err);
        document.getElementById('user-name').textContent = 'Guest';
    }
}

populateUsername(); 