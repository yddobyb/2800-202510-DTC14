document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.nav-item');

    function deactivateTab(tab) {
        const type = tab.dataset.type;
        const img = tab.querySelector('img');
        const span = tab.querySelector('span');

        if (img) img.src = `./asset/gray${type}.png`;
        if (span) span.classList.replace('text-[#2553E9]', 'text-[#6E6E6E]');
    }

    function activateTab(tab) {
        const type = tab.dataset.type;
        const img = tab.querySelector('img');
        const span = tab.querySelector('span');

        if (img) img.src = `./asset/blue${type}.png`;
        if (span) span.classList.replace('text-[#6E6E6E]', 'text-[#2553E9]');
    }


    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    tabs.forEach(tab => {
        const href = tab.getAttribute('href');
        if (href && href.toLowerCase().endsWith(currentPage)) {
            activateTab(tab);
        } else {
            deactivateTab(tab);
        }
    });


    tabs.forEach(tab => {
        tab.addEventListener('click', e => {
            const href = tab.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                tabs.forEach(deactivateTab);
                activateTab(tab);
                window.location.href = href;
            }
        });
    });
});