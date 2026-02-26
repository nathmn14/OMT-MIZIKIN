// ============================================
// CLIENT STATE + API
// ============================================

const DEFAULT_API_BASE = "http://127.0.0.1:8000/api";
const API_BASE = localStorage.getItem("omt_api_base") || DEFAULT_API_BASE;

const OMT_STATE = {
    apiBase: API_BASE,
    events: [],
    tickets: [],
    scans: [],
    scanQueue: [],
    currentUser: null,
    accessToken: null,
    refreshToken: null,
    lastPurchase: null,
    loading: {
        events: false,
        tickets: false,
        users: false
    }
};

function saveTokens(access, refresh) {
    OMT_STATE.accessToken = access;
    OMT_STATE.refreshToken = refresh;
    if (access) localStorage.setItem("omt_access", access);
    if (refresh) localStorage.setItem("omt_refresh", refresh);
}

function loadTokens() {
    OMT_STATE.accessToken = localStorage.getItem("omt_access");
    OMT_STATE.refreshToken = localStorage.getItem("omt_refresh");
}

loadTokens();

function loadScanQueue() {
    try {
        const raw = localStorage.getItem("omt_scan_queue");
        OMT_STATE.scanQueue = raw ? JSON.parse(raw) : [];
    } catch (e) {
        OMT_STATE.scanQueue = [];
    }
}

function saveScanQueue() {
    localStorage.setItem("omt_scan_queue", JSON.stringify(OMT_STATE.scanQueue));
}

loadScanQueue();

function setApiBase(url) {
    OMT_STATE.apiBase = url;
    localStorage.setItem("omt_api_base", url);
}

function normalizeEvent(e) {
    return {
        id: e.id,
        titre: e.title,
        description: e.description || "",
        date: e.date,
        time: e.time || "",
        lieu: e.location,
        image: e.image_url || "",
        billets_restants: e.tickets_remaining ?? 0,
        prix_standard: e.price_standard ?? 0,
        prix_vip: e.price_vip ?? 0,
        categories: (e.categories || []).map(c => ({
            id: c.id,
            nom: c.name,
            prix: c.price,
            stock: c.stock
        }))
    };
}

function normalizeTicket(t) {
    return {
        id: t.id,
        event_id: t.event_id,
        category_id: t.category_id || null,
        type: t.type,
        prix: t.price,
        participant_name: t.participant_name,
        participant_email: t.participant_email || null,
        status: t.status,
        qr_code_data: t.qr_code_data
    };
}

async function apiFetch(path, options = {}, retry = true) {
    const headers = options.headers || {};
    if (OMT_STATE.accessToken) {
        headers["Authorization"] = `Bearer ${OMT_STATE.accessToken}`;
    }
    if (!headers["Content-Type"] && options.body) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${OMT_STATE.apiBase}${path}`, {
        ...options,
        headers
    });

    if (res.status === 401 && OMT_STATE.refreshToken && retry) {
        const refreshed = await apiRefreshToken();
        if (refreshed) {
            return apiFetch(path, options, false);
        }
    }

    if (!res.ok) {
        let detail = "Erreur API";
        try {
            const data = await res.json();
            detail = data.detail || detail;
        } catch (e) { }
        throw new Error(detail);
    }

    if (res.status === 204) return null;
    return res.json();
}

async function apiRefreshToken() {
    if (!OMT_STATE.refreshToken) return false;
    try {
        const data = await fetch(`${OMT_STATE.apiBase}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: OMT_STATE.refreshToken })
        }).then(r => r.ok ? r.json() : null);

        if (data && data.access_token) {
            saveTokens(data.access_token, data.refresh_token);
            return true;
        }
    } catch (e) { }
    return false;
}

async function apiLogin(email, password) {
    const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
    saveTokens(data.access_token, data.refresh_token);
    return data;
}

async function apiRegister(payload) {
    return apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

async function apiMe() {
    const data = await apiFetch("/auth/me", { method: "GET" });
    OMT_STATE.currentUser = data;
    return data;
}

async function apiListEvents(organizerId = null) {
    OMT_STATE.loading.events = true;
    const q = organizerId ? `?organizer_id=${organizerId}` : "";
    const data = await apiFetch(`/events${q}`, { method: "GET" });
    OMT_STATE.events = data.map(normalizeEvent);
    OMT_STATE.loading.events = false;
    return OMT_STATE.events;
}

async function apiGetEvent(eventId) {
    const data = await apiFetch(`/events/${eventId}`, { method: "GET" });
    return normalizeEvent(data);
}

async function apiCreateEvent(payload) {
    const data = await apiFetch("/events", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    const event = normalizeEvent(data);
    OMT_STATE.events.unshift(event);
    return event;
}

async function apiDeleteEvent(eventId) {
    return apiFetch(`/events/${eventId}`, { method: "DELETE" });
}

async function apiUpdateEvent(eventId, payload) {
    const data = await apiFetch(`/events/${eventId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
    const event = normalizeEvent(data);
    const idx = OMT_STATE.events.findIndex(e => e.id === event.id);
    if (idx !== -1) OMT_STATE.events[idx] = event;
    return event;
}

async function apiCheckout(payload) {
    const data = await apiFetch("/tickets/checkout", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    const tickets = data.map(normalizeTicket);
    OMT_STATE.lastPurchase = tickets;
    localStorage.setItem("omt_last_purchase", JSON.stringify(tickets));
    OMT_STATE.tickets = [...tickets, ...OMT_STATE.tickets];
    return tickets;
}

async function apiLookupTicket(code) {
    const data = await apiFetch(`/tickets/lookup?code=${encodeURIComponent(code)}`, { method: "GET" });
    return normalizeTicket(data);
}

async function apiVerifyTicket(code) {
    const data = await apiFetch("/tickets/verify", {
        method: "POST",
        body: JSON.stringify({ qr_code_data: code })
    });
    return normalizeTicket(data);
}

async function apiListTickets(eventId = null) {
    OMT_STATE.loading.tickets = true;
    const q = eventId ? `?event_id=${eventId}` : "";
    const data = await apiFetch(`/tickets${q}`, { method: "GET" });
    OMT_STATE.tickets = data.map(normalizeTicket);
    OMT_STATE.loading.tickets = false;
    return OMT_STATE.tickets;
}

async function apiListPendingUsers() {
    OMT_STATE.loading.users = true;
    const data = await apiFetch("/admin/users/pending", { method: "GET" });
    OMT_STATE.loading.users = false;
    return data;
}

async function apiListAllUsers() {
    OMT_STATE.loading.users = true;
    const data = await apiFetch("/admin/users", { method: "GET" });
    OMT_STATE.loading.users = false;
    return data;
}

async function apiApproveUser(userId) {
    return apiFetch(`/admin/users/${userId}/approve`, { method: "POST" });
}

async function apiRejectUser(userId) {
    return apiFetch(`/admin/users/${userId}/reject`, { method: "DELETE" });
}

async function apiDeleteUser(userId) {
    return apiFetch(`/admin/users/${userId}`, { method: "DELETE" });
}

async function apiToggleUserApproval(userId) {
    return apiFetch(`/admin/users/${userId}/toggle-approval`, { method: "POST" });
}

async function apiUpdateUserRole(userId, role) {
    return apiFetch(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role })
    });
}

async function apiResetUserPassword(userId, newPassword) {
    return apiFetch(`/admin/users/${userId}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ new_password: newPassword })
    });
}

// --- API VÉRIFICATEURS ---

async function apiListVerifiers() {
    return apiFetch("/users/verifiers", { method: "GET" });
}

async function apiListEventVerifiers(eventId) {
    return apiFetch(`/events/${eventId}/verifiers`, { method: "GET" });
}

async function apiAddVerifier(eventId, userId) {
    return apiFetch(`/events/${eventId}/verifiers/${userId}`, { method: "POST" });
}

async function apiRemoveVerifier(eventId, userId) {
    return apiFetch(`/events/${eventId}/verifiers/${userId}`, { method: "DELETE" });
}

async function apiListAssignedEvents() {
    const data = await apiFetch("/events/assigned/me", { method: "GET" });
    return data.map(normalizeEvent);
}

function getEventById(id) {
    return OMT_STATE.events.find(e => e.id === id) || null;
}

function loadLastPurchase() {
    try {
        const raw = localStorage.getItem("omt_last_purchase");
        if (raw) {
            OMT_STATE.lastPurchase = JSON.parse(raw);
        }
    } catch (e) { }
}

loadLastPurchase();

function isOnline() {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function enqueueScan(code) {
    const entry = {
        code,
        created_at: new Date().toISOString(),
        status: "pending"
    };
    OMT_STATE.scanQueue.push(entry);
    saveScanQueue();
    return entry;
}

async function flushScanQueue() {
    if (!isOnline() || OMT_STATE.scanQueue.length === 0) return { sent: 0, failed: 0, sentCodes: [], failedCodes: [] };

    let sent = 0;
    let failed = 0;
    const remaining = [];
    const sentCodes = [];
    const failedCodes = [];

    for (const item of OMT_STATE.scanQueue) {
        try {
            await apiVerifyTicket(item.code);
            sent += 1;
            sentCodes.push(item.code);
        } catch (e) {
            failed += 1;
            failedCodes.push(item.code);
            remaining.push(item);
        }
    }

    OMT_STATE.scanQueue = remaining;
    saveScanQueue();
    return { sent, failed, sentCodes, failedCodes };
}

if (typeof window !== "undefined") {
    window.addEventListener("online", async () => {
        const result = await flushScanQueue();
        if (result.sent > 0) {
            showToast(`${result.sent} scan(s) synchronise(s)`, "success");
        }
    });
}
