(() => {
    const mobileQuery = window.matchMedia('(max-width: 991.98px)');
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');

    if (!sidebar || !toggle || !overlay) {
        return;
    }

    const setSidebarOpen = (isOpen) => {
        sidebar.classList.toggle('show', isOpen);
        overlay.classList.toggle('show', isOpen);
        document.body.classList.toggle('sidebar-open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        sidebar.setAttribute('aria-hidden', String(mobileQuery.matches && !isOpen));
        overlay.setAttribute('aria-hidden', String(!isOpen));

        if (isOpen) {
            sidebar.querySelector('input, a, button')?.focus();
        } else {
            toggle.focus();
        }
    };

    const getPath = (href) => {
        try {
            return new URL(href, window.location.origin).pathname.replace(/\/+$/, '') || '/';
        } catch {
            return '';
        }
    };

    const markActiveLinks = () => {
        const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
        const links = [...sidebar.querySelectorAll('.sidebar-link, .sidebar-sublink')];
        const activeLink = links.find((link) => {
            const path = getPath(link.getAttribute('href') || '');
            return path === currentPath || (path !== '/' && currentPath.startsWith(`${path}/`));
        });

        if (!activeLink) {
            return;
        }

        activeLink.classList.add('active');
        activeLink.setAttribute('aria-current', 'page');
        const submenu = activeLink.closest('.sidebar-submenu');
        const submenuToggle = submenu?.previousElementSibling;
        if (submenu && submenuToggle instanceof HTMLElement) {
            submenu.classList.add('show');
            submenuToggle.classList.add('has-active-child');
            submenuToggle.setAttribute('aria-expanded', 'true');
        }
    };

    toggle.addEventListener('click', () => setSidebarOpen(true));
    overlay.addEventListener('click', () => setSidebarOpen(false));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sidebar.classList.contains('show')) {
            setSidebarOpen(false);
        }

        if (event.key === 'Tab' && sidebar.classList.contains('show') && mobileQuery.matches) {
            const focusable = [...sidebar.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')];
            if (!focusable.length) {
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });
    mobileQuery.addEventListener('change', ({ matches }) => {
        if (!matches) {
            setSidebarOpen(false);
        } else {
            sidebar.setAttribute('aria-hidden', 'true');
        }
    });

    sidebar.setAttribute('aria-hidden', String(mobileQuery.matches));
    markActiveLinks();

    document.getElementById('mapTouchGuard')?.addEventListener('click', (event) => {
        event.currentTarget.classList.add('is-unlocked');
    });

    const searchInput = sidebar.querySelector('.sidebar-search-input');
    document.addEventListener('keydown', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement) || /INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.isContentEditable) {
            return;
        }

        if ((event.key === '/' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) && searchInput) {
            event.preventDefault();
            if (mobileQuery.matches && !sidebar.classList.contains('show')) {
                setSidebarOpen(true);
            }
            searchInput.focus();
        }
    });

    document.querySelectorAll('a[href^="http"]').forEach((link) => {
        if (link instanceof HTMLAnchorElement && link.origin !== window.location.origin) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
    });
})();
