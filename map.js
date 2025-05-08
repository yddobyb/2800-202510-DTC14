mapboxgl.accessToken = 'pk.eyJ1IjoiZ21raWQ2ODQxIiwiYSI6ImNtYTNnM3Z0YTJ2eDkyanBzMHE0OGplam8ifQ.8MqZ0jzjVMA1J_tCCwKW-g';

const VANCOUVER_CENTER = [-123.1207, 49.2827];
const DEFAULT_ZOOM = 13;

let map;
let userLocationMarker;
let parkingMarkers = [];
let isMapLoaded = false;
let activeFilters = {
    motorcycle: false,
    disability: false,
    maxPrice: 20
};
let loadingIndicator;

function initMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: VANCOUVER_CENTER,
        zoom: DEFAULT_ZOOM
    });
    
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    
    map.on('load', () => {
        isMapLoaded = true;
        addMapLayers();
        createLoadingIndicator();
        fetchAndDisplayParkingMeters();
    });
    
    setupEventListeners();
}

function createLoadingIndicator() {
    loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator hidden';
    loadingIndicator.innerHTML = `
        <div class="p-4 bg-white rounded-lg shadow-md flex items-center space-x-3">
            <svg class="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-700 font-medium">Loading parking meters...</span>
        </div>
    `;
    loadingIndicator.style.position = 'absolute';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.zIndex = '20';
    document.body.appendChild(loadingIndicator);
}

function showLoading() {
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }
}

function hideLoading() {
    if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
    }
}

function addMapLayers() {
    if (!isMapLoaded) return;
    
    map.addSource('vancouver-boundaries', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [-123.224, 49.200],
                    [-123.020, 49.200],
                    [-123.020, 49.320],
                    [-123.224, 49.320],
                    [-123.224, 49.200]
                ]]
            }
        }
    });
    
    map.addLayer({
        id: 'vancouver-boundaries-fill',
        type: 'fill',
        source: 'vancouver-boundaries',
        layout: {},
        paint: {
            'fill-color': '#427ef5',
            'fill-opacity': 0.05
        }
    });
    
    map.addLayer({
        id: 'vancouver-boundaries-line',
        type: 'line',
        source: 'vancouver-boundaries',
        layout: {},
        paint: {
            'line-color': '#427ef5',
            'line-width': 2
        }
    });
}

async function fetchAndDisplayParkingMeters() {
    showLoading();
    try {
        const meters = await fetchParkingMeters({ limit: 100 }); // Reduced limit to make API call more likely to succeed
        const parsedMeters = parseParkingData(meters);
        
        if (parsedMeters && parsedMeters.length > 0) {
            console.log(`Successfully fetched ${parsedMeters.length} parking meters`);
            displayParkingMeters(parsedMeters);
        } else {
            console.warn('No parking meters returned from the API');
            alert('Could not load parking meters. Using sample data instead.');
            // This will use the mock data since the API failed
            const mockMeters = await fetchParkingMeters({ limit: 50 });
            displayParkingMeters(parseParkingData(mockMeters));
        }
    } catch (error) {
        console.error('Error fetching parking meters:', error);
        alert('Failed to load parking meters. Using sample data instead.');
        // This will use the mock data since the API failed
        const mockMeters = await fetchParkingMeters({ limit: 50 });
        displayParkingMeters(parseParkingData(mockMeters));
    } finally {
        hideLoading();
    }
}

function displayParkingMeters(parkingData) {
    clearMarkers();
    
    if (!parkingData || parkingData.length === 0) {
        console.log('No parking meters to display');
        return;
    }
    
    let filteredData = parkingData;
    
    if (activeFilters.motorcycle) {
        filteredData = filterParkingByType(filteredData, 'motorcycle');
    }
    
    if (activeFilters.disability) {
        filteredData = filterParkingByType(filteredData, 'disability');
    }
    
    if (activeFilters.maxPrice) {
        filteredData = filterParkingByPrice(filteredData, `$${activeFilters.maxPrice}`);
    }
    
    filteredData.forEach(meter => {
        if (!meter.coordinates || !Array.isArray(meter.coordinates) || meter.coordinates.length !== 2) {
            return;
        }
        
        const el = document.createElement('div');
        el.className = 'parking-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = getMarkerColor(meter);
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 0 1px rgba(0, 0, 0, 0.1)';
        el.style.cursor = 'pointer';
        
        const marker = new mapboxgl.Marker(el)
            .setLngLat(meter.coordinates)
            .setPopup(createPopup(meter))
            .addTo(map);
        
        parkingMarkers.push(marker);
    });
    
    if (parkingMarkers.length === 0) {
        alert('No parking meters match your current filters.');
    }
}

function getMarkerColor(meter) {
    if (meter.meterType.toLowerCase().includes('motorcycle')) {
        return '#ff9800'; // Orange for motorcycle parking
    } else if (meter.meterType.toLowerCase().includes('disability')) {
        return '#2196f3'; // Blue for disability parking
    } else {
        // Determine color based on weekday rate
        const rate = parseFloat(meter.rates.weekdayDay.replace('$', '')) || 0;
        if (rate === 0) return '#4caf50'; // Free parking (green)
        if (rate < 2) return '#8bc34a'; // Cheap (light green)
        if (rate < 5) return '#ffc107'; // Medium (yellow)
        if (rate < 10) return '#ff9800'; // Expensive (orange)
        return '#f44336'; // Very expensive (red)
    }
}

function createPopup(meter) {
    const weekdayRate = meter.rates.weekdayDay || 'N/A';
    const weekendRate = meter.rates.saturdayDay || 'N/A';
    const creditCard = meter.acceptsCreditCard ? 'Yes' : 'No';
    
    const content = `
        <div class="text-left">
            <h3 class="font-bold text-lg mb-1">Parking Meter #${meter.id}</h3>
            <p class="text-sm text-gray-600 mb-1">${meter.location || 'Vancouver'}</p>
            <div class="border-t border-gray-200 my-2"></div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-2">
                <div class="font-semibold">Weekday Rate:</div>
                <div>${weekdayRate}</div>
                <div class="font-semibold">Weekend Rate:</div>
                <div>${weekendRate}</div>
                <div class="font-semibold">Credit Card:</div>
                <div>${creditCard}</div>
                <div class="font-semibold">Type:</div>
                <div>${meter.meterType || 'Standard'}</div>
            </div>
            <button class="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors mt-2">
                Begin Parking
            </button>
        </div>
    `;
    
    return new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        maxWidth: '300px'
    }).setHTML(content);
}

function clearMarkers() {
    parkingMarkers.forEach(marker => marker.remove());
    parkingMarkers = [];
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                
                if (!userLocationMarker) {
                    const el = document.createElement('div');
                    el.className = 'user-location-marker';
                    el.style.width = '18px';
                    el.style.height = '18px';
                    el.style.borderRadius = '50%';
                    el.style.backgroundColor = '#4285F4';
                    el.style.border = '2px solid white';
                    el.style.boxShadow = '0 0 0 2px rgba(66, 133, 244, 0.3)';
                    
                    userLocationMarker = new mapboxgl.Marker(el)
                        .setLngLat([longitude, latitude])
                        .addTo(map);
                } else {
                    userLocationMarker.setLngLat([longitude, latitude]);
                }
                
                map.flyTo({
                    center: [longitude, latitude],
                    zoom: 15
                });
                
                searchNearbyParking(latitude, longitude);
            },
            error => {
                console.error('Error getting location:', error);
                alert('Unable to get your location. Please check your browser settings.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

async function searchNearbyParking(lat, lng) {
    showLoading();
    try {
        const nearbyParking = await searchParkingByLocation(lat, lng, 500);
        if (nearbyParking && nearbyParking.length > 0) {
            displayParkingMeters(nearbyParking);
        } else {
            alert('No parking meters found nearby. Try increasing search radius.');
        }
    } catch (error) {
        console.error('Error searching nearby parking:', error);
    } finally {
        hideLoading();
    }
}

function setupEventListeners() {
    const locateUserBtn = document.getElementById('locateUserBtn');
    if (locateUserBtn) {
        locateUserBtn.addEventListener('click', getCurrentLocation);
    }
    
    const motorcycleFilterBtn = document.getElementById('motorcycleFilterBtn');
    if (motorcycleFilterBtn) {
        motorcycleFilterBtn.addEventListener('click', () => {
            toggleFilter('motorcycle');
            motorcycleFilterBtn.classList.toggle('bg-blue-100');
            motorcycleFilterBtn.classList.toggle('text-blue-700');
            fetchAndDisplayParkingMeters();
        });
    }
    
    const disabilityFilterBtn = document.getElementById('disabilityFilterBtn');
    if (disabilityFilterBtn) {
        disabilityFilterBtn.addEventListener('click', () => {
            toggleFilter('disability');
            disabilityFilterBtn.classList.toggle('bg-blue-100');
            disabilityFilterBtn.classList.toggle('text-blue-700');
            fetchAndDisplayParkingMeters();
        });
    }
    
    const feeRangeSlider = document.getElementById('feeRangeSlider');
    if (feeRangeSlider) {
        feeRangeSlider.addEventListener('change', (e) => {
            activeFilters.maxPrice = parseInt(e.target.value, 10);
            fetchAndDisplayParkingMeters();
        });
    }
}

function toggleFilter(filterName) {
    activeFilters[filterName] = !activeFilters[filterName];
}

document.addEventListener('DOMContentLoaded', initMap); 