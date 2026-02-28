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
    isHandlingPopState: false,
    routePaths: {
        'home': '/',
        'login': '/login',
        'register': '/register',
        'dashboard-admin': '/dashboard/admin',
        'admin-users': '/dashboard/admin/users',
        'dashboard-orga': '/dashboard/organizer',
        'create-event': '/dashboard/organizer/events/new',
        'dashboard-verif': '/dashboard/verifier',
    },

    buildPath: function (page, data = null) {
        if (page === 'event-detail' && data?.eventId) {
            return `/events/${data.eventId}`;
        }
        if (page === 'checkout' && data?.eventId) {
            return `/events/${data.eventId}/checkout`;
        }
        if ((page === 'success' || page === 'ticket-success') && data?.eventId) {
            return `/events/${data.eventId}/success`;
        }
        if (page === 'manage-event' && data?.eventId) {
            return `/dashboard/events/${data.eventId}`;
        }

        return this.routePaths[page] || '/';
    },

    parsePath: function (pathname) {
        const cleanPath = pathname || '/';

        if (cleanPath === '/' || cleanPath === '') return { page: 'home', data: null };
        if (cleanPath === '/login') return { page: 'login', data: null };
        if (cleanPath === '/register') return { page: 'register', data: null };
        if (cleanPath === '/dashboard/admin') return { page: 'dashboard-admin', data: null };
        if (cleanPath === '/dashboard/admin/users') return { page: 'admin-users', data: null };
        if (cleanPath === '/dashboard/organizer') return { page: 'dashboard-orga', data: null };
        if (cleanPath === '/dashboard/organizer/events/new') return { page: 'create-event', data: null };
        if (cleanPath === '/dashboard/verifier') return { page: 'dashboard-verif', data: null };

        let match = cleanPath.match(/^\/events\/(\d+)$/);
        if (match) return { page: 'event-detail', data: { eventId: Number(match[1]) } };

        match = cleanPath.match(/^\/events\/(\d+)\/checkout$/);
        if (match) return { page: 'checkout', data: { eventId: Number(match[1]) } };

        match = cleanPath.match(/^\/events\/(\d+)\/success$/);
        if (match) return { page: 'ticket-success', data: { eventId: Number(match[1]) } };

        match = cleanPath.match(/^\/dashboard\/events\/(\d+)$/);
        if (match) return { page: 'manage-event', data: { eventId: Number(match[1]) } };

        return null;
    },

    init: async function () {
        if (OMT_STATE.accessToken) {
            try {
                await apiMe();
            } catch (e) {
                saveTokens(null, null);
            }
        }

        let initialRoute = null;
        try {
            const pathRoute = this.parsePath(window.location.pathname);
            if (pathRoute) {
                initialRoute = pathRoute;
            } else {
                const state = window.history.state;
                if (state && state.page) {
                    initialRoute = { page: state.page, data: state.data || null };
                }
            }

            if (!initialRoute) {
                const saved = sessionStorage.getItem('omt_route');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed && parsed.page) {
                        initialRoute = { page: parsed.page, data: parsed.data || null };
                    }
                }
            }
        } catch (e) { }

        if (initialRoute) {
            this.navigate(initialRoute.page, initialRoute.data, { replace: true });
            return;
        }

        this.navigate('home', null, { replace: true });
    },

    navigate: async function (page, data = null, options = {}) {
        const app = document.getElementById('app');
        if (typeof closeMobileMenu === "function") {
            closeMobileMenu();
        }
        window.scrollTo(0, 0);
        const prevPage = this.currentPage;
        this.currentData = data;
        this.currentPage = page;
        const routeState = { page, data };
        try {
            sessionStorage.setItem('omt_route', JSON.stringify(routeState));
        } catch (e) { }

        if (!this.isHandlingPopState) {
            try {
                const nextPath = options.path || this.buildPath(page, data);
                if (options.replace) {
                    window.history.replaceState(routeState, "", nextPath);
                } else {
                    window.history.pushState(routeState, "", nextPath);
                }
            } catch (e) { }
        }

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
                app.classList.remove('loading');
                break;
            case 'event-detail':
                renderLoading("Chargement de l'evenement...");
                const eventDetail = await apiGetEvent(data.eventId);
                const existingIdx = OMT_STATE.events.findIndex(e => e.id === eventDetail.id);
                if (existingIdx >= 0) OMT_STATE.events[existingIdx] = eventDetail;
                else OMT_STATE.events.push(eventDetail);
                app.innerHTML = PageEventDetail(data.eventId);
                app.classList.remove('loading');
                break;
            case 'checkout':
                renderLoading("Preparation du paiement...");
                if (!data?.eventId) {
                    this.navigate('home', null, { replace: true });
                    return;
                }
                if (!getEventById(data.eventId)) {
                    const ev = await apiGetEvent(data.eventId);
                    OMT_STATE.events.push(ev);
                }
                if (data.prix == null || !data.type) {
                    this.navigate('event-detail', { eventId: data.eventId }, { replace: true });
                    return;
                }
                app.innerHTML = PageCheckout(data);
                app.classList.remove('loading');
                break;
            case 'success':
            case 'ticket-success':
                if (data?.eventId && !getEventById(data.eventId)) {
                    try {
                        const ev = await apiGetEvent(data.eventId);
                        OMT_STATE.events.push(ev);
                    } catch (e) { }
                }
                if (data?.eventId) {
                    const currentTickets = Array.isArray(OMT_STATE.lastPurchase) ? OMT_STATE.lastPurchase : [];
                    const matchingTickets = currentTickets.filter(t => t.event_id === data.eventId);
                    if (matchingTickets.length === 0) {
                        const persisted = loadLastPurchaseForEvent(data.eventId);
                        if (persisted && persisted.length > 0) {
                            OMT_STATE.lastPurchase = persisted;
                        }
                    }
                }
                app.innerHTML = PageTicketSuccess(data);
                app.classList.remove('loading');
                setTimeout(() => {
                    if (typeof renderQrCodes === "function") renderQrCodes();
                }, 0);
                break;
            case 'login':
                app.innerHTML = PageLogin();
                app.classList.remove('loading');
                break;
            case 'register':
                app.innerHTML = PageRegister();
                app.classList.remove('loading');
                break;
            case 'dashboard-orga':
                renderLoading("Chargement du tableau de bord...");
                if (!OMT_STATE.currentUser) {
                    try { await apiMe(); } catch (e) { Router.navigate('login'); return; }
                }
                await apiListEvents(OMT_STATE.currentUser.id);
                await apiListTickets();
                app.innerHTML = PageDashboardOrga();
                app.classList.remove('loading');
                break;
            case 'create-event':
                app.innerHTML = PageCreateEvent();
                app.classList.remove('loading');
                break;
            case 'manage-event':
                renderLoading("Chargement de l'evenement...");
                if (!getEventById(data.eventId)) {
                    const ev = await apiGetEvent(data.eventId);
                    OMT_STATE.events.push(ev);
                }
                await apiListTickets(data.eventId);
                app.innerHTML = PageManageEvent(data.eventId);
                app.classList.remove('loading');
                break;
            case 'dashboard-verif':
                app.innerHTML = PageDashboardVerif();
                app.classList.remove('loading');
                setTimeout(() => {
                    if (typeof refreshCameras === "function") refreshCameras();
                }, 0);
                break;
            case 'dashboard-admin':
                renderLoading("Chargement admin...");
                await apiListEvents();
                await apiListTickets();
                app.innerHTML = PageDashboardAdmin();
                app.classList.remove('loading');
                if (typeof loadDashboardData === "function") loadDashboardData();
                break;
            case 'admin-users':
                renderLoading("Chargement des utilisateurs...");
                app.innerHTML = PageUsersAdmin();
                app.classList.remove('loading');
                if (typeof loadUsersTable === "function") loadUsersTable();
                break;
            default:
                app.innerHTML = PageHome();
                app.classList.remove('loading');
        }

        if (typeof hydrateMizikinMotion === "function") {
            setTimeout(() => hydrateMizikinMotion(), 0);
        }
    }
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('popstate', async (event) => {
        const state = event.state;
        Router.isHandlingPopState = true;
        try {
            const pathRoute = Router.parsePath(window.location.pathname);
            if (pathRoute) {
                await Router.navigate(pathRoute.page, pathRoute.data || null, { replace: true, path: window.location.pathname });
            } else if (state && state.page) {
                await Router.navigate(state.page, state.data || null, { replace: true });
            } else {
                await Router.navigate('home', null, { replace: true });
            }
        } finally {
            Router.isHandlingPopState = false;
        }
    });

    Router.init();
});
