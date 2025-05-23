const params = new URLSearchParams(location.search);
const flow = params.get('flow') || '';
const email = params.get('email') || '';
const error = params.get('error');

document.getElementById('flowInput').value = flow;
document.getElementById('emailInput').value = email;

if (error === 'invalid') {
    alert('Invalid code. Please try again.');
} else if (error === 'expired') {
    alert('Code expired. Click "Resend Code" to get a new one.');
}

const inputs = document.querySelectorAll('.space-x-2 input');
inputs.forEach((el, i) => {
    el.addEventListener('input', () => {
        if (el.value.length === 1 && i < inputs.length - 1) {
            inputs[i + 1].focus();
        }
    });
});

document.getElementById('verifyForm').addEventListener('submit', e => {
    const code = Array.from(inputs).map(i => i.value).join('');
    document.getElementById('codeInput').value = code;
});

document.getElementById('resendLink').href =
    `/resend-code?flow=${encodeURIComponent(flow)}&email=${encodeURIComponent(email)}`; 