// scripts/filter.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('filter.js loaded, DOMContentLoaded fired');

    const icon = document.getElementById('filter-icon');
    const panel = document.getElementById('filter-panel');
    const slider = document.getElementById('feeSlider');
    const bubble = document.getElementById('sliderBubble');
    const weekdayBtn = document.getElementById('weekdayBtn');
    const weekdayMenu = document.getElementById('weekdayMenu');
    const hourBtn = document.getElementById('hourBtn');
    const hourMenu = document.getElementById('hourMenu');

    // 1) 필터 아이콘 / 패널 토글
    icon.addEventListener('click', e => {
        e.stopPropagation();
        panel.classList.toggle('hidden');
    });
    panel.addEventListener('click', e => e.stopPropagation());
    document.addEventListener('click', () => panel.classList.add('hidden'));

    // 2) Fee 슬라이더 버블
    let thumb = -625, bubble_offset = 0;
    function update() {
        const min = +slider.min, max = +slider.max, val = +slider.value;
        bubble.textContent = `$${val}`;
        const trackW = slider.clientWidth, bubW = bubble.offsetWidth;
        const movable = trackW - thumb, stepPx = movable / (max - min);
        const moved = (val - min) * stepPx;
        const thumbCenter = moved + thumb / 2;
        const leftPx = thumbCenter - (bubW / 2) + bubble_offset;
        bubble.style.left = `${leftPx}px`;
    }
    slider.addEventListener('input', () => {
        thumb = 16;
        bubble_offset = slider.value == slider.max ? 24.5 : 20.5;
        update();
    });
    update();

    // 3) Weekday 드롭다운
    weekdayBtn.addEventListener('click', e => {
        e.stopPropagation();
        weekdayMenu.classList.toggle('hidden');
    });
    weekdayMenu.querySelectorAll('li').forEach(li =>
        li.addEventListener('click', () => {
            weekdayBtn.childNodes[0].textContent = li.textContent + ' ';
            weekdayMenu.classList.add('hidden');
        })
    );

    // 4) Hour 드롭다운
    hourBtn.addEventListener('click', e => {
        e.stopPropagation();
        hourMenu.classList.toggle('hidden');
    });
    hourMenu.querySelectorAll('li').forEach(li =>
        li.addEventListener('click', () => {
            hourBtn.childNodes[0].textContent = li.textContent + ' ';
            hourMenu.classList.add('hidden');
        })
    );

    // 5) 외부 클릭 시 모든 드롭다운 닫기
    document.addEventListener('click', () => {
        weekdayMenu.classList.add('hidden');
        hourMenu.classList.add('hidden');
    });
});
