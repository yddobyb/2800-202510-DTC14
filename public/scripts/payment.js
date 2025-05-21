// 1) Pull everything from the URL
const params = new URLSearchParams(location.search);
const zone = params.get('zone') || '';
const rate = params.get('rate') || '$0.00';
const hours = parseInt(params.get('hours'), 10) || 0;
const minutes = parseInt(params.get('minutes'), 10) || 0;

// 2) Compute times & total
const start = new Date();
const end = new Date(start.getTime() + (hours * 60 + minutes) * 60000);
const rateNum = parseFloat(rate.replace(/[^0-9.]/g, '')) || 0;
const total = (rateNum * (hours + minutes / 60)).toFixed(2);


function fmt(dt) {
    let h = dt.getHours(), m = String(dt.getMinutes()).padStart(2, '0');
    const am = h < 12;
    h = (h % 12) || 12;
    return `${h}:${m} ${am ? 'AM' : 'PM'}`;
}

// 3) Update the Confirm‐page fields
document.querySelectorAll('.mt-2.space-y-1.text-gray-800 li').forEach(li => {
    const key = li.children[0].textContent.trim();
    const val = li.children[1];
    if (key === 'Location') val.textContent = zone;
    if (key === 'Start Time') val.textContent = fmt(start);
    if (key === 'End Time') val.textContent = fmt(end);
});
document.querySelectorAll('.mt-2.space-y-1.text-gray-800 li').forEach(li => {
    const key = li.children[0].textContent.trim();
    const val = li.children[1];
    if (key === 'Fee per hour') val.textContent = rate;
    if (key === 'Duration') val.textContent =
        `${hours > 0 ? hours + ' hour' : ''}` +
        `${minutes > 0 ? ` ${minutes} min` : ''}`.trim();
    if (key === 'Total Amount') val.textContent = '$' + total;
});

// 4) Wire the Pay button to pass all params to the success page
const payBtn = document.getElementById('confirm-pay-btn');
payBtn.textContent = 'Pay $' + total;
payBtn.addEventListener('click', async () => {
    try {
        // Get the vehicle number from the page
        const vehicleNumber = document.querySelector('li:nth-child(2) span:last-child').textContent.split(' ')[0];

        // Use hardcoded user ID (no authentication required)
        const userId = 1;

        // Send payment data to the server
        const response = await fetch('/api/payment/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                vehicle_number: vehicleNumber,
                rate: rate,
                street_number: zone,
                hours: hours,
                minutes: minutes
            })
        });

        const result = await response.json();

        if (result.success) {
            // Store payment ID for reference
            sessionStorage.setItem('last_payment_id', result.payment_id);

            // Redirect to success page
            const qs = new URLSearchParams({ zone, rate, hours, minutes, payment_id: result.payment_id }).toString();
            location.href = 'paymentsuccesspage.html?' + qs;
        } else {
            alert('Payment failed: ' + result.message);
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        alert('Payment failed. Please try again.');
    }
});