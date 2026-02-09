// ============================================
// ROUTING & NAVIGATION
// ============================================

function renderLoading(message = "Chargement...") {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="min-h-screen flex items-center justify-center">
            <div class="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4">
                <div class="spinner"></div>
                <div>
                    <div class="text-slate-800 font-bold">${message}</div>
                    <div class="text-slate-500 text-sm">Veuillez patienter</div>
                </div>
            </div>
        </div>
    `;
}

const Router = {
    currentData: null,
    currentPage: 'home',

    init: function () {
        try {
            const saved = sessionStorage.getItem('omt_route');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.page) {
                    this.navigate(parsed.page, parsed.data || null);
                    return;
                }
            }
        } catch (e) { }
        this.navigate('home');
    },

    navigate: async function (page, data = null) {
        const app = document.getElementById('app');
        window.scrollTo(0, 0);
        const prevPage = this.currentPage;
        this.currentData = data;
        this.currentPage = page;
        try {
            sessionStorage.setItem('omt_route', JSON.stringify({ page, data }));
        } catch (e) { }

        // Cleanup: stop camera if leaving verifier page
        if (prevPage === 'dashboard-verif' && page !== 'dashboard-verif') {
            try {
                if (typeof stopScanner === "function") stopScanner();
            } catch (e) { }
        }

        switch (page) {
            case 'home':
                renderLoading("Chargement des evenements...");
                await apiListEvents();
                app.innerHTML = PageHome();
                break;
            case 'event-detail':
                renderLoading("Chargement de l'evenement...");
                const eventDetail = await apiGetEvent(data.eventId);
                const existingIdx = OMT_STATE.events.findIndex(e => e.id === eventDetail.id);
                if (existingIdx >= 0) OMT_STATE.events[existingIdx] = eventDetail;
                else OMT_STATE.events.push(eventDetail);
                app.innerHTML = PageEventDetail(data.eventId);
                break;
            case 'checkout':
                renderLoading("Preparation du paiement...");
                if (!getEventById(data.eventId)) {
                    const ev = await apiGetEvent(data.eventId);
                    OMT_STATE.events.push(ev);
                }
                app.innerHTML = PageCheckout(data);
                break;
            case 'success':
            case 'ticket-success':
                app.innerHTML = PageTicketSuccess(data);
                setTimeout(() => {
                    if (typeof renderQrCodes === "function") renderQrCodes();
                }, 0);
                break;
            case 'login':
                app.innerHTML = PageLogin();
                break;
            case 'register':
                app.innerHTML = PageRegister();
                break;
            case 'dashboard-orga':
                renderLoading("Chargement du tableau de bord...");
                await apiListEvents();
                await apiListTickets();
                app.innerHTML = PageDashboardOrga();
                break;
            case 'create-event':
                app.innerHTML = PageCreateEvent();
                break;
            case 'manage-event':
                renderLoading("Chargement de l'evenement...");
                if (!getEventById(data.eventId)) {
                    const ev = await apiGetEvent(data.eventId);
                    OMT_STATE.events.push(ev);
                }
                await apiListTickets(data.eventId);
                app.innerHTML = PageManageEvent(data.eventId);
                break;
            case 'dashboard-verif':
                app.innerHTML = PageDashboardVerif();
                setTimeout(() => {
                    if (typeof refreshCameras === "function") refreshCameras();
                }, 0);
                break;
            case 'dashboard-admin':
                renderLoading("Chargement admin...");
                await apiListEvents();
                await apiListTickets();
                app.innerHTML = PageDashboardAdmin();
                if (typeof loadDashboardData === "function") loadDashboardData();
                break;
            case 'admin-users':
                renderLoading("Chargement des utilisateurs...");
                app.innerHTML = PageUsersAdmin();
                if (typeof loadUsersTable === "function") loadUsersTable();
                break;
            default:
                app.innerHTML = PageHome();
        }
    }
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    Router.init();
});
