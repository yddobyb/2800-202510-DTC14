mapboxgl.accessToken = 'pk.eyJ1IjoiZ21raWQ2ODQxIiwiYSI6ImNtYTNnM3Z0YTJ2eDkyanBzMHE0OGplam8ifQ.8MqZ0jzjVMA1J_tCCwKW-g';

const VANCOUVER_CENTER = [-123.1207, 49.2827];
const DEFAULT_ZOOM = 13;

let map;
let userLocationMarker;
let parkingMarkers = [];
let isMapLoaded = false;
let activeFilters = {};

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
    });
    
    setupEventListeners();
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
        });
    }
    
    const disabilityFilterBtn = document.getElementById('disabilityFilterBtn');
    if (disabilityFilterBtn) {
        disabilityFilterBtn.addEventListener('click', () => {
            toggleFilter('disability');
            disabilityFilterBtn.classList.toggle('bg-blue-100');
            disabilityFilterBtn.classList.toggle('text-blue-700');
        });
    }
}

function toggleFilter(filterName) {
    activeFilters[filterName] = !activeFilters[filterName];
}

document.addEventListener('DOMContentLoaded', initMap); 