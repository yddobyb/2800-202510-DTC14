
const $input = document.getElementById('search-input');
const $btn = document.getElementById('search-btn');

async function fetchFunFact(place) {
    const res = await fetch(`/api/funfact?place=${encodeURIComponent(place)}`);
    if (!res.ok) throw new Error('Fun-fact API error');
    const data = await res.json();
    return data.fact || 'No fun fact found.';
}


function showModal(place, fact) {
    const modal = document.createElement('div');
    modal.innerHTML = `
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
        <h2 class="text-xl font-bold mb-4 text-center">${place}</h2>
        <p class="text-gray-700 mb-6">${fact}</p>
        <button id="modal-ok"
                class="w-full bg-[#2553E9] text-white py-2 rounded-lg font-semibold">
          Explore on Map
        </button>
      </div>
    </div>`;
    document.body.appendChild(modal);
    document.getElementById('modal-ok').addEventListener('click', () => {
        modal.remove();
        window.location.href = `./map.html?query=${encodeURIComponent(place)}`;
    });
}

async function handleSearch() {
    const query = $input.value.trim();
    if (!query) return;
    try {
        const fact = await fetchFunFact(query);
        showModal(query, fact);
    } catch (e) {
        alert(e.message);
    }
}


$btn.addEventListener('click', handleSearch);
$input.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSearch();
});
