const $input = document.getElementById('search-input');
const $btn = document.getElementById('search-btn');

function handleSearch() {
    const query = $input.value.trim();
    if (!query) return;
    window.location.href = `./map.html?query=${encodeURIComponent(query)}`;
}

$btn.addEventListener('click', handleSearch);
$input.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSearch();
});
