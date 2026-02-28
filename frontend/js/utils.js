// ============================================
// FONCTIONS UTILITAIRES
// ============================================
function formatDate(dateStr) {
    if (!dateStr) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('fr-FR', options);
}

function formatCurrency(value) {
    if (typeof value !== 'number') return value;
    return `${value}€`;
}

function generateQRCode() {
    return 'MIZ-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hide");
        setTimeout(() => toast.remove(), 250);
    }, 2800);
}

// ============================================
// MENU MOBILE (Globally accessible)
// ============================================
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.querySelector('.mobile-menu-btn');
    if (menu && btn) {
        menu.classList.toggle('active');
        btn.classList.toggle('active');
        btn.setAttribute('aria-expanded', menu.classList.contains('active') ? 'true' : 'false');
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.querySelector('.mobile-menu-btn');
    if (menu && btn) {
        menu.classList.remove('active');
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
    }
}

let _responsiveBindingsReady = false;

function ensureResponsiveBindings() {
    if (_responsiveBindingsReady) return;
    _responsiveBindingsReady = true;

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 640) {
            closeMobileMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMobileMenu();
        }
    });

    document.addEventListener('click', (event) => {
        const menu = document.getElementById('mobile-menu');
        const btn = document.querySelector('.mobile-menu-btn');
        if (!menu || !btn || !menu.classList.contains('active')) return;
        if (menu.contains(event.target) || btn.contains(event.target)) return;
        closeMobileMenu();
    });
}

function hydrateTypewriters() {
    const nodes = document.querySelectorAll('[data-typewriter]');
    nodes.forEach((node) => {
        if (node.dataset.typed === '1') return;
        const fullText = node.dataset.typewriter || node.textContent || '';
        const speed = Number(node.dataset.typeSpeed || 24);
        const pause = Number(node.dataset.typePause || 10600);
        node.dataset.typed = '1';
        node.textContent = '';
        node.classList.add('type-caret');

        const runCycle = () => {
            let index = 0;
            const tick = () => {
                node.textContent = fullText.slice(0, index);
                index += 1;
                if (index <= fullText.length) {
                    window.setTimeout(tick, speed);
                } else {
                    window.setTimeout(() => {
                        node.textContent = '';
                        runCycle();
                    }, pause);
                }
            };

            tick();
        };

        window.setTimeout(runCycle, Number(node.dataset.typeDelay || 120));
    });
}

function hydrateReveals() {
    const nodes = document.querySelectorAll('[data-reveal]');
    nodes.forEach((node, index) => {
        if (node.dataset.revealed === '1') return;
        node.dataset.revealed = '1';
        node.style.setProperty('--reveal-delay', `${index * 70}ms`);
        node.classList.add('mizikin-reveal');
    });
}

function hydrateMizikinMotion() {
    ensureResponsiveBindings();
    hydrateReveals();
    hydrateTypewriters();
}
