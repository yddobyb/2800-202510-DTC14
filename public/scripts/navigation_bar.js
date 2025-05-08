document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.nav-item');

    function deactivateTab(tab) {
        const type = tab.dataset.type;
        tab.querySelector('img').src = `./asset/gray${type}.png`;
        const span = tab.querySelector('span');
        span.classList.replace('text-[#2553E9]', 'text-[#6E6E6E]');
    }

    function activateTab(tab) {
        const type = tab.dataset.type;
        tab.querySelector('img').src = `./asset/blue${type}.png`;
        const span = tab.querySelector('span');
        span.classList.replace('text-[#6E6E6E]', 'text-[#2553E9]');
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', e => {
            e.preventDefault();
            const href = tab.getAttribute('href');

            tabs.forEach(deactivateTab);

            activateTab(tab);

            if (href && href !== '#') {
                window.location.href = href;
            }
        });
    });

    const currentPage = window.location.pathname.split('/').pop();
    tabs.forEach(tab => {
        const href = tab.getAttribute('href');
        if (href && href.endsWith(currentPage)) {
            activateTab(tab);
        }
    });
});
