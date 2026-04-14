(function () {
    const DEFAULT_TITLES = {
        success: 'All set',
        error: 'Something went wrong',
        info: 'Heads up'
    };

    const DEFAULT_ICONS = {
        success: '+',
        error: '!',
        info: 'i'
    };

    let region = null;

    function ensureRegion() {
        if (region && document.body.contains(region)) {
            return region;
        }

        region = document.createElement('div');
        region.className = 'app-notification-region';
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        document.body.appendChild(region);
        return region;
    }

    function removeNotification(node, resolve) {
        if (!node || node.dataset.closing === 'true') {
            return;
        }

        node.dataset.closing = 'true';
        node.classList.remove('is-visible');
        node.classList.add('is-closing');

        window.setTimeout(() => {
            node.remove();
            resolve();
        }, 220);
    }

    window.showAppPopup = function showAppPopup(message, options = {}) {
        const type = options.type || 'info';
        const title = options.title || DEFAULT_TITLES[type] || DEFAULT_TITLES.info;
        const duration = options.duration ?? 3200;
        const icon = options.icon || DEFAULT_ICONS[type] || DEFAULT_ICONS.info;

        ensureRegion();

        return new Promise(resolve => {
            const notification = document.createElement('section');
            notification.className = `app-notification app-notification--${type}`;
            notification.setAttribute('role', type === 'error' ? 'alert' : 'status');

            notification.innerHTML = `
                <div class="app-notification__icon" aria-hidden="true">${icon}</div>
                <div class="app-notification__content">
                    <h3 class="app-notification__title">${title}</h3>
                    <p class="app-notification__message"></p>
                </div>
                <button class="app-notification__close" type="button" aria-label="Close notification">x</button>
            `;

            notification.querySelector('.app-notification__message').textContent = message;
            notification.querySelector('.app-notification__close')
                .addEventListener('click', () => removeNotification(notification, resolve));

            region.appendChild(notification);

            requestAnimationFrame(() => {
                notification.classList.add('is-visible');
            });

            if (duration > 0) {
                window.setTimeout(() => removeNotification(notification, resolve), duration);
            }
        });
    };
})();