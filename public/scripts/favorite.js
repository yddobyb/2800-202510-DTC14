function getCurrentUserId() {
    return sessionStorage.getItem('userId');
}

async function loadFavorites() {
    const userId = getCurrentUserId();

    if (!userId) {
        // Redirect to login if no user is logged in
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`/api/favorites/${userId}`);
        const data = await res.json();
        const favoritesList = document.getElementById('favorites-list');

        if (!data.success || data.favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="py-8 text-center text-gray-500">
                    No favorites added yet
                </div>
            `;
            return;
        }

        favoritesList.innerHTML = data.favorites.map((fav) => `
            <div class="py-4 border-b flex justify-between items-center">
                <div>
                    <p class="font-semibold">${fav.nickname || fav.location_name}</p>
                    <p class="text-sm text-gray-600">Location: ${fav.location_name}</p>
                    <p class="text-sm text-gray-600">Rate: ${fav.rate}</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="location.href='paymentpage.html?zone=${encodeURIComponent(fav.location_name)}'" 
                            class="px-3 py-1 bg-green-500 text-white rounded text-xs">
                        Pay
                    </button>
                    <button onclick="editFavorite(${fav.id})" 
                            class="px-3 py-1 bg-yellow-700 text-white rounded text-xs">
                        Edit
                    </button>
                    <button onclick="removeFavorite(${fav.id})" 
                            class="px-3 py-1 bg-red-500 text-white rounded text-xs">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading favorites:', err);
    }
}

function editFavorite(id) {
    window.location.href = `edit_favorite.html?id=${id}`;
}

async function removeFavorite(id) {
    try {
        const res = await fetch(`/api/favorites/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            loadFavorites();
        }
    } catch (err) {
        console.error('Error deleting favorite:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadFavorites); 