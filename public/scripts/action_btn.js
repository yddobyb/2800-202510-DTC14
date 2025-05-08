document.addEventListener('DOMContentLoaded', () => {
    const alertBtn = document.getElementById('heatmap-btn');

    alertBtn.addEventListener('click', () => {
        alertBtn.classList.toggle('border-transparent');
        alertBtn.classList.toggle('border-[#2553E9]');
    });
});

// Current Location Button Handler
document.getElementById('locate-btn').addEventListener('click', () => {
    console.log('Locate button clicked');
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { longitude, latitude } = position.coords;
            console.log('Current position:', longitude, latitude);
            // Create blue dot
            const dot = document.createElement('div');
            Object.assign(dot.style, {
                width: '12px',
                height: '12px',
                backgroundColor: '#2553E9',
                borderRadius: '50%',
                boxShadow: '0 0 6px rgba(0,0,0,0.3)'
            });
            new mapboxgl.Marker({ element: dot })
                .setLngLat([longitude, latitude])
                .addTo(map);
            map.flyTo({ center: [longitude, latitude], zoom: 15 });
        },
        (err) => { console.error('Geolocation error:', err); alert(err.message); }
    );
});