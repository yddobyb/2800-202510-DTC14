mapboxgl.accessToken = 'pk.eyJ1IjoiZ21raWQ2ODQxIiwiYSI6ImNtYTNnM3Z0YTJ2eDkyanBzMHE0OGplam8ifQ.8MqZ0jzjVMA1J_tCCwKW-g';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-123.1207, 49.2827],
    zoom: 13
});
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// Store all markers for easy removal
let currentMarkers = [];

// Fetch and render meter pins
async function fetchMeters() {
    const res = await fetch('/api/meters');
    if (!res.ok) throw new Error('Failed to fetch /api/meters');
    return (await res.json()).meters;
}

// Display regular parking meters on the map
async function displayMeterPins() {
    try {
        // Clear current markers only if they exist
        clearAllMarkers();

        const meters = await fetchMeters();
        meters.forEach(({ coords, street, rate }) => {
            const marker = new mapboxgl.Marker()
                .setLngLat(coords)
                .setPopup(new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`
                        <div class="flex flex-col space-y-1">
                          <span class="font-semibold">${street}</span>
                          <span>Fee: ${rate}</span>
                          <div class="flex space-x-2 pt-1">
                            <button class="px-3 py-1 bg-red-500 text-white rounded">Fav</button>
                            <button
                              class="px-3 py-1 bg-green-500 text-white rounded"
                              onclick="
                                location.href = 
                                  'paymentpage.html'
                                  + '?zone=${encodeURIComponent(street)}'
                                  + '&rate=${encodeURIComponent(rate)}'
                              "
                            >
                              Pay
                            </button>
                          </div>
                                        </div>
                        `)
                )
                .addTo(map);

            // Add marker to current markers array
            currentMarkers.push(marker);
        });

    } catch (err) {
        console.error(err);
    }
}

// Clear all markers from the map
function clearAllMarkers() {
    if (currentMarkers.length > 0) {
        currentMarkers.forEach(marker => marker.remove());
        currentMarkers = [];
    }
}

// Fetch and display motorcycle parking data
async function displayMotorcycleParking() {
    try {
        clearAllMarkers();

        const response = await fetch('motorcycle-parking.json');
        if (!response.ok) throw new Error('Failed to fetch motorcycle parking data');
        const motorcycleData = await response.json();

        motorcycleData.forEach(spot => {
            if (spot.geo_point_2d && spot.geo_point_2d.lon && spot.geo_point_2d.lat) {
                const coords = [spot.geo_point_2d.lon, spot.geo_point_2d.lat];
                let rate = 'N/A';

                // Get rate info if available - prioritize weekday daytime rate
                if (spot.r_mf_9a_6p) {
                    rate = spot.r_mf_9a_6p;
                } else if (spot.rate_misc) {
                    rate = spot.rate_misc;
                } else if (spot.r_sa_9a_6p) {
                    rate = spot.r_sa_9a_6p;
                } else if (spot.r_mf_6p_10) {
                    rate = spot.r_mf_6p_10;
                }

                // Format rate to ensure it's valid
                if (rate === null || rate === undefined) {
                    rate = '$1.00'; // Default rate if none specified
                }

                // Create location string
                let location = spot.location || 'Motorcycle Parking';
                if (location === 'n/a') {
                    location = `Motorcycle Parking ${spot.geo_local_area || ''}`.trim();
                }

                // Create marker
                const marker = new mapboxgl.Marker({ color: '#FF8C00' }) // Orange color for motorcycle parking
                    .setLngLat(coords)
                    .setPopup(new mapboxgl.Popup({ offset: 25 })
                        .setHTML(`
                                <div class="flex flex-col space-y-1">
                                  <span class="font-semibold">${location}</span>
                                  <span>Type: ${spot.type || 'Motorcycle Parking'}</span>
                                  <span>Fee: ${rate}</span>
                                  <div class="flex space-x-2 pt-1">
                                    <button class="px-3 py-1 bg-red-500 text-white rounded">Fav</button>
                                    <button
                                      class="px-3 py-1 bg-green-500 text-white rounded"
                                      onclick="
                                        location.href = 
                                          'paymentpage.html'
                                          + '?zone=${encodeURIComponent(location)}'
                                          + '&rate=${encodeURIComponent(rate)}'
                                      "
                                    >
                                      Pay
                                    </button>
                                  </div>
                                </div>
                            `)
                    )
                    .addTo(map);

                currentMarkers.push(marker);
            }
        });
    } catch (err) {
        console.error('Error displaying motorcycle parking:', err);
    }
}

// Fetch and display disability parking data
async function displayDisabilityParking() {
    try {
        clearAllMarkers();

        const response = await fetch('disability-parking.json');
        if (!response.ok) throw new Error('Failed to fetch disability parking data');
        const disabilityData = await response.json();

        disabilityData.forEach(spot => {
            if (spot.geo_point_2d && spot.geo_point_2d.lon && spot.geo_point_2d.lat) {
                const coords = [spot.geo_point_2d.lon, spot.geo_point_2d.lat];

                // For disability parking, set a standard rate based on the location
                let rate = '$2.00'; // Default rate for disability parking

                // Get location, use a default if not provided
                let location = spot.location || 'Disability Parking';

                // Modify rate based on area if possible
                if (spot.geo_local_area) {
                    const area = spot.geo_local_area.toLowerCase();
                    if (area.includes('downtown')) {
                        rate = '$3.50';
                    } else if (area.includes('west end') || area.includes('kitsilano')) {
                        rate = '$2.50';
                    } else if (area.includes('hastings') || area.includes('commercial')) {
                        rate = '$1.50';
                    }
                }

                // Create marker
                const marker = new mapboxgl.Marker({ color: '#0074D9' }) // Blue color for disability parking
                    .setLngLat(coords)
                    .setPopup(new mapboxgl.Popup({ offset: 25 })
                        .setHTML(`
                                <div class="flex flex-col space-y-1">
                                  <span class="font-semibold">${location}</span>
                                  <span>Type: ${spot.description || 'Disability Zone'}</span>
                                  <span>Notes: ${spot.notes || 'No additional information'}</span>
                                  <span>Spaces: ${spot.spaces || 1}</span>
                                  <span>Fee: ${rate}</span>
                                  <div class="flex space-x-2 pt-1">
                                    <button class="px-3 py-1 bg-red-500 text-white rounded">Fav</button>
                                    <button
                                      class="px-3 py-1 bg-green-500 text-white rounded"
                                      onclick="
                                        location.href = 
                                          'paymentpage.html'
                                          + '?zone=${encodeURIComponent(location)}'
                                          + '&rate=${encodeURIComponent(rate)}'
                                      "
                                    >
                                      Pay
                                    </button>
                                  </div>
                                </div>
                            `)
                    )
                    .addTo(map);

                currentMarkers.push(marker);
            }
        });
    } catch (err) {
        console.error('Error displaying disability parking:', err);
    }
}

// Initialize map with regular meters
map.on('load', () => {
    displayMeterPins();

    // Add click event listeners to the toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(button => {
        button.addEventListener('click', function () {
            const type = this.getAttribute('data-type');

            // Remove active class from all buttons
            document.querySelectorAll('.toggle-btn').forEach(btn => {
                btn.classList.remove('border-[#2553E9]');

                // Reset text and icon color
                const textSpan = btn.querySelector('span');
                if (textSpan) textSpan.classList.remove('text-[#2553E9]');
                if (textSpan) textSpan.classList.add('text-[#6E6E6E]');
            });

            // If this button is already active (clicking the active filter again)
            if (this.classList.contains('active')) {
                this.classList.remove('active', 'border-[#2553E9]');
                displayMeterPins(); // Show regular meters
                return;
            }

            // Mark this button as active
            this.classList.add('active', 'border-[#2553E9]');

            // Change text color to blue for active button
            const textSpan = this.querySelector('span');
            if (textSpan) {
                textSpan.classList.remove('text-[#6E6E6E]');
                textSpan.classList.add('text-[#2553E9]');
            }

            // Display the corresponding parking type
            if (type === 'Motorcycle') {
                displayMotorcycleParking();
            } else if (type === 'Disability') {
                displayDisabilityParking();
            }
        });
    });
});

const $input = document.getElementById('search-input');
const $btn = document.getElementById('search-btn');
let searchMarker;

async function geocode(query) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
        + `?access_token=${mapboxgl.accessToken}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    return data.features[0] ?? null;
}

async function handleSearch() {
    const query = $input.value.trim();
    if (!query) return;

    const feature = await geocode(query);
    if (!feature) return alert('No location found');

    const [lng, lat] = feature.center;
    map.flyTo({ center: [lng, lat], zoom: 16 });

    if (searchMarker) searchMarker.remove();

    searchMarker = new mapboxgl.Marker({ color: '#2553E9' })
        .setLngLat([lng, lat])
        .setPopup(
            new mapboxgl.Popup({ offset: 25 })
                .setText(feature.place_name || query)
        )
        .addTo(map)
        .togglePopup();
}

$btn.addEventListener('click', handleSearch);
$input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(); });

// When map page loads, clear the parkingStopped flag
document.addEventListener('DOMContentLoaded', function () {
    localStorage.removeItem('parkingStopped');
});

const urlParams = new URLSearchParams(window.location.search);
const initialQuery = urlParams.get('query');
if (initialQuery) {
    $input.value = initialQuery;
    handleSearch();
}