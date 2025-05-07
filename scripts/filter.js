const icon = document.getElementById('filter-icon');
const panel = document.getElementById('filter-panel');
icon.addEventListener('click', () => panel.classList.toggle('hidden'));
document.addEventListener('click', e => {
    if (!panel.contains(e.target) && !icon.contains(e.target)) {
        panel.classList.add('hidden');
    }
});

const slider = document.getElementById('feeSlider');
const bubble = document.getElementById('sliderBubble');
var thumb = -625;
var bubble_offset = 0;

function update() {
    const min = +slider.min,
        max = +slider.max,
        val = +slider.value;

    bubble.textContent = `$${val}`;

    const trackW = slider.clientWidth;
    const bubW = bubble.offsetWidth;
    const movable = trackW - thumb;
    const stepPx = movable / (max - min);
    const moved = (val - min) * stepPx;
    const thumbCenter = moved + thumb / 2;
    const leftPx = thumbCenter - (bubW / 2) + bubble_offset;
    bubble.style.left = `${leftPx}px`;
}

slider.addEventListener('input', () => {
    thumb = 16;
    if (slider.value == 10) {
        bubble_offset = 24.5;
    } else {
        bubble_offset = 20.5;
    }
    update();
});
update();

const weekdayBtn = document.getElementById('weekdayBtn');
const weekdayMenu = document.getElementById('weekdayMenu');
weekdayBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    weekdayMenu.classList.toggle('hidden');
});
weekdayMenu.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', function () {
        weekdayBtn.childNodes[0].textContent = this.textContent + ' ';
        weekdayMenu.classList.add('hidden');
    });
});

const hourBtn = document.getElementById('hourBtn');
const hourMenu = document.getElementById('hourMenu');
hourBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    hourMenu.classList.toggle('hidden');
});
hourMenu.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', function () {
        hourBtn.childNodes[0].textContent = this.textContent + ' ';
        hourMenu.classList.add('hidden');
    });
});

document.addEventListener('click', function () {
    weekdayMenu.classList.add('hidden');
    hourMenu.classList.add('hidden');
});