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
    let activeDialog = null;

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

    window.showAppConfirm = function showAppConfirm(message, options = {}) {
        if (activeDialog) {
            return Promise.resolve(false);
        }

        const title = options.title || 'Please confirm';
        const confirmLabel = options.confirmLabel || 'Confirm';
        const cancelLabel = options.cancelLabel || 'Cancel';
        const tone = options.tone || 'info';

        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'app-confirm-overlay';

            const dialog = document.createElement('section');
            dialog.className = `app-confirm-dialog app-confirm-dialog--${tone}`;
            dialog.setAttribute('role', 'dialog');
            dialog.setAttribute('aria-modal', 'true');
            dialog.setAttribute('aria-labelledby', 'app-confirm-title');

            dialog.innerHTML = `
                <div class="app-confirm-dialog__badge" aria-hidden="true">${tone === 'danger' ? '!' : '?'}</div>
                <div class="app-confirm-dialog__body">
                    <h3 class="app-confirm-dialog__title" id="app-confirm-title">${title}</h3>
                    <p class="app-confirm-dialog__message"></p>
                </div>
                <div class="app-confirm-dialog__actions">
                    <button class="app-confirm-dialog__btn app-confirm-dialog__btn--ghost" type="button" data-action="cancel">${cancelLabel}</button>
                    <button class="app-confirm-dialog__btn app-confirm-dialog__btn--primary" type="button" data-action="confirm">${confirmLabel}</button>
                </div>
            `;

            dialog.querySelector('.app-confirm-dialog__message').textContent = message;
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            activeDialog = overlay;

            const onKeyDown = (event) => {
                if (event.key === 'Escape') {
                    close(false);
                    return;
                }

                if (event.key === 'Enter') {
                    close(true);
                }
            };

            const close = (confirmed) => {
                if (!activeDialog) {
                    return;
                }

                document.removeEventListener('keydown', onKeyDown);
                activeDialog = null;
                overlay.classList.add('is-closing');
                window.setTimeout(() => {
                    overlay.remove();
                    resolve(confirmed);
                }, 180);
            };

            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) {
                    close(false);
                }
            });

            dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => close(false));
            dialog.querySelector('[data-action="confirm"]').addEventListener('click', () => close(true));

            document.addEventListener('keydown', onKeyDown);
            requestAnimationFrame(() => overlay.classList.add('is-visible'));
            dialog.querySelector('[data-action="confirm"]').focus();
        });
    };
})();