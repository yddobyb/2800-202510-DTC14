// helper to format a Date as "h:mm AM/PM"
function fmt(dt) {
    let h = dt.getHours();
    const m = String(dt.getMinutes()).padStart(2, '0');
    const am = h < 12;
    h = h % 12 || 12;
    return `${h}:${m} ${am ? 'AM' : 'PM'}`;
}

// parse query params
const params = new URLSearchParams(window.location.search);
const zone = params.get('zone') || '';
const hours = parseInt(params.get('hours'), 10) || 0;
const minutes = parseInt(params.get('minutes'), 10) || 0;
const rateStr = params.get('rate') || '$0.00';

// compute times
const start = new Date();
const end = new Date(start.getTime() + (hours * 60 + minutes) * 60000);
const total = (parseFloat(rateStr.replace(/[^0-9.]/g, '')) * (hours + minutes / 60)).toFixed(2);

// set fields
const paymentId = params.get('payment_id') || sessionStorage.getItem('last_payment_id') || 'N/A';

// Store parking info in localStorage for the status page
localStorage.setItem('parkingEndTime', end.getTime());
localStorage.setItem('currentPaymentId', paymentId);
localStorage.setItem('parkingStopped', 'false'); // Mark parking as active
localStorage.setItem('parkingStartTime', start.getTime());
localStorage.setItem('parkingLocation', zone);
localStorage.setItem('parkingRate', rateStr);
localStorage.setItem('parkingHours', hours);
localStorage.setItem('parkingMinutes', minutes);
localStorage.setItem('parkingTotal', total);

document.getElementById('success-payment-id').textContent = paymentId;
document.getElementById('success-zone').textContent = zone;
document.getElementById('success-start').textContent = fmt(start);
document.getElementById('success-end').textContent = fmt(end);
document.getElementById('success-duration').textContent =
    `${hours} hour${hours !== 1 ? 's' : ''}` + (minutes ? ` ${minutes} min` : '');
document.getElementById('success-total').textContent = `$${total}`;

// button handlers
document.getElementById('view-status').addEventListener('click', () => {
    window.location.href = 'status.html';
});
document.getElementById('done-btn').addEventListener('click', () => {
    window.location.href = 'map.html';
}); 