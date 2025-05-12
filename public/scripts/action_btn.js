document.addEventListener('DOMContentLoaded', () => {
    const alertBtn = document.getElementById('heatmap-btn');

    alertBtn.addEventListener('click', () => {
        alertBtn.classList.toggle('border-transparent');
        alertBtn.classList.toggle('border-[#2553E9]');
    });
});

let currentMarker = null;
let watchId = null;
document.getElementById('locate-btn').addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('Geolocation not supported');
        return;
    }
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = navigator.geolocation.watchPosition(
        ({ coords }) => {
            const lngLat = [coords.longitude, coords.latitude];
            if (!currentMarker) {
                const dot = document.createElement('div');
                Object.assign(dot.style, {
                    width: '12px', height: '12px',
                    backgroundColor: '#2553E9',
                    borderRadius: '50%',
                    boxShadow: '0 0 6px rgba(0,0,0,0.3)'
                });
                currentMarker = new mapboxgl.Marker({ element: dot })
                    .setLngLat(lngLat)
                    .addTo(map);
            } else {
                currentMarker.setLngLat(lngLat);
            }
            map.flyTo({ center: lngLat, zoom: 15 });
        },
        (err) => { console.error(err); alert(err.message); },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
});