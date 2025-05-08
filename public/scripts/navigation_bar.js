document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.nav-item');

    // 비활성화 함수
    function deactivateTab(tab) {
        const type = tab.dataset.type;
        tab.querySelector('img').src = `./asset/gray${type}.png`;
        const span = tab.querySelector('span');
        span.classList.replace('text-[#2553E9]', 'text-[#6E6E6E]');
    }

    // 활성화 함수
    function activateTab(tab) {
        const type = tab.dataset.type;
        tab.querySelector('img').src = `./asset/blue${type}.png`;
        const span = tab.querySelector('span');
        span.classList.replace('text-[#6E6E6E]', 'text-[#2553E9]');
    }

    // 1) 클릭 핸들러 바인딩
    tabs.forEach(tab => {
        tab.addEventListener('click', e => {
            e.preventDefault();               // anchor 기본 이동 막기
            const href = tab.getAttribute('href');

            // 모두 비활성화
            tabs.forEach(deactivateTab);

            // 클릭된 탭만 활성화
            activateTab(tab);

            // 실제 페이지 이동
            if (href && href !== '#') {
                window.location.href = href;
            }
        });
    });

    // 2) 로드 시 URL 기반 하이라이트
    const currentPage = window.location.pathname.split('/').pop();
    tabs.forEach(tab => {
        const href = tab.getAttribute('href');
        if (href && href.endsWith(currentPage)) {
            activateTab(tab);
        }
    });
});
