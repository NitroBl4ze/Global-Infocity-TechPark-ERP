(() => {
    const STORAGE_KEY = 'infocity_sidebar_collapsed';

    function initSidebar() {
        const layout = document.querySelector('.admin-layout');
        const sidebar = document.getElementById('appSidebar');
        const toggle = document.getElementById('sidebarToggle');
        if (!layout || !sidebar || !toggle) return;

        const desktopQuery = window.matchMedia('(min-width: 961px)');

        function setCollapsed(collapsed, persist = false) {
            const shouldCollapse = Boolean(collapsed && desktopQuery.matches);
            sidebar.classList.toggle('is-collapsed', shouldCollapse);
            layout.classList.toggle('sidebar-collapsed', shouldCollapse);
            toggle.setAttribute('aria-expanded', String(!shouldCollapse));
            toggle.setAttribute('aria-label', shouldCollapse ? 'Expand navigation' : 'Collapse navigation');
            toggle.title = shouldCollapse ? 'Expand navigation' : 'Collapse navigation';
            toggle.innerHTML = `<span aria-hidden="true">${shouldCollapse ? '›' : '‹'}</span>`;
            if (persist) {
                localStorage.setItem(STORAGE_KEY, shouldCollapse ? '1' : '0');
            }
        }

        setCollapsed(localStorage.getItem(STORAGE_KEY) === '1');
        toggle.addEventListener('click', () => {
            const collapsed = !sidebar.classList.contains('is-collapsed');
            setCollapsed(collapsed, true);
        });

        desktopQuery.addEventListener?.('change', () => {
            setCollapsed(localStorage.getItem(STORAGE_KEY) === '1');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSidebar, { once: true });
    } else {
        initSidebar();
    }
})();
