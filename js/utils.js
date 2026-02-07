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
    return 'OMT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
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
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.querySelector('.mobile-menu-btn');
    if (menu && btn) {
        menu.classList.remove('active');
        btn.classList.remove('active');
    }
}
