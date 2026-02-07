// ============================================
// PAGES VERIFICATEUR
// ============================================

function PageDashboardVerif() {
    ensurePendingScans();
    return `
        ${Navbar()}
        <div class="min-h-screen bg-slate-900 text-white">
            <div class="max-w-md mx-auto px-4 py-6 sm:py-12">
                <button onclick="Router.navigate('home')" class="text-slate-400 hover:text-white flex items-center gap-2 mb-4 font-medium text-sm sm:text-base">
                    <- Retour a l'accueil
                </button>
                <h1 class="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Scanner de Billets</h1>
                
                <div class="bg-slate-800 rounded-xl p-4 sm:p-6 mb-6">
                    <label class="block mb-2 font-medium text-sm sm:text-base">Scanner ou saisir le code</label>
                    <div class="flex gap-2">
                        <input type="text" id="manual-code" placeholder="Code du billet..." 
                               class="flex-1 bg-slate-700 border-2 border-slate-600 rounded-lg px-3 py-3 text-white focus:border-blue-500 outline-none">
                        <button onclick="lookupTicket()" class="bg-blue-600 px-4 rounded-lg hover:bg-blue-700 transition font-bold">
                            OK
                        </button>
                    </div>
                    <div class="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span id="net-status">${isOnline() ? "En ligne" : "Hors ligne"}</span>
                        <button id="btn-sync" class="text-blue-400 hover:text-blue-300" onclick="syncOfflineScans()">Synchroniser (${OMT_STATE.scanQueue.length})</button>
                    </div>
                </div>

                <!-- Scanner Section -->
                <div id="scanner-container" class="hidden mb-6 bg-slate-800 rounded-xl overflow-hidden shadow-lg p-3">
                    <div class="mb-3 flex flex-col gap-2">
                        <div class="flex items-center justify-between gap-3">
                            <label class="text-xs text-slate-300 font-semibold">Camera</label>
                            <select id="camera-select" class="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-xs outline-none" onchange="saveCameraPreference()">
                                <option value="">Auto (arriere si possible)</option>
                            </select>
                        </div>
                        <div class="flex items-center justify-between gap-3">
                            <button type="button" onclick="refreshCameras()" class="bg-slate-700 hover:bg-slate-600 border border-slate-600 px-3 py-2 rounded-lg text-xs font-bold transition">
                                Rafraichir cameras
                            </button>
                            <button type="button" onclick="triggerPhotoScan()" class="bg-slate-700 hover:bg-slate-600 border border-slate-600 px-3 py-2 rounded-lg text-xs font-bold transition">
                                Scanner via photo
                            </button>
                            <input id="qr-file" type="file" accept="image/*" capture="environment" class="hidden" onchange="scanFromFile(event)">
                        </div>
                        <p class="text-[11px] text-slate-400 leading-snug">
                            Astuce: sur mobile, la camera fonctionne sur HTTPS ou localhost. Sinon utilise "Scanner via photo".
                        </p>
                    </div>
                    <div class="relative bg-black rounded-lg overflow-hidden mb-3">
                        <div id="reader" class="w-full h-64"></div>
                        <div class="absolute inset-0 pointer-events-none border-2 border-blue-500 opacity-50 rounded-lg"></div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="stopScanner()" class="bg-red-600 hover:bg-red-700 py-2 rounded-lg text-sm font-bold transition">
                            Arreter
                        </button>
                        <button onclick="simulateScan()" class="bg-slate-700 hover:bg-slate-600 border border-slate-600 py-2 rounded-lg text-sm font-bold transition">
                            Simuler (Demo)
                        </button>
                    </div>
                </div>

                <button id="btn-start-scan" onclick="startScanner()" class="w-full bg-blue-600 py-4 rounded-xl hover:bg-blue-700 transition font-bold text-lg mb-6 shadow-lg shadow-blue-900/50 flex items-center justify-center gap-3">
                     <span class="text-2xl"> </span> Scanner un billet
                </button>

                <!-- Resultat -->
                <div id="ticket-details" class="hidden bg-slate-800 rounded-xl p-6 mb-6 border-l-4 border-blue-500 shadow-lg"></div>
                
                <!-- Historique -->
                <div class="bg-slate-800 rounded-xl p-4 sm:p-6">
                    <h3 class="font-bold mb-3 sm:mb-4 text-base sm:text-lg">Historique des validations</h3>
                    <div id="scan-history" class="space-y-2 max-h-64 overflow-y-auto">
                        ${OMT_STATE.scans.length === 0 ? '<p class="text-slate-400 text-xs sm:text-sm">Aucune validation effectuee</p>' :
            OMT_STATE.scans.slice().reverse().map(s => `
                                <div class="text-xs sm:text-sm p-3 bg-slate-700 rounded flex justify-between">
                                    <span class="font-mono">${s.code}</span>
                                    <span class="${s.pending ? 'text-yellow-400' : (s.valid ? 'text-green-400' : 'text-red-400')}">
                                        ${s.pending ? 'En attente' : (s.valid ? 'Valide' : 'Refuse')}
                                    </span>
                                </div>
                            `).join('')
        }
                    </div>
                </div>
            </div>
        </div>
    `;
}

// LOGIQUE VERIFICATEUR
function ensurePendingScans() {
    const existingPending = new Set(
        OMT_STATE.scans.filter(s => s.pending).map(s => s.code)
    );
    for (const item of OMT_STATE.scanQueue) {
        if (!existingPending.has(item.code)) {
            OMT_STATE.scans.push({ code: item.code, valid: false, pending: true, time: new Date(item.created_at) });
        }
    }
}

function updateScanHistory() {
    const historyDiv = document.getElementById('scan-history');
    if (!historyDiv) return;
    historyDiv.innerHTML = OMT_STATE.scans.slice().reverse().map(s => `
        <div class="text-xs sm:text-sm p-3 bg-slate-700 rounded flex justify-between">
            <span class="font-mono">${s.code}</span>
            <span class="${s.pending ? 'text-yellow-400' : (s.valid ? 'text-green-400' : 'text-red-400')}">
                ${s.pending ? 'En attente' : (s.valid ? 'Valide' : 'Refuse')}
            </span>
        </div>
    `).join('');
}

function updateSyncButton() {
    const btn = document.getElementById('btn-sync');
    if (btn) btn.textContent = `Synchroniser (${OMT_STATE.scanQueue.length})`;
}

async function lookupTicket(codeOverride = null) {
    const code = (codeOverride || document.getElementById('manual-code').value).trim();
    if (!code) return;

    const detailsDiv = document.getElementById('ticket-details');
    detailsDiv.classList.remove('hidden');
    detailsDiv.innerHTML = '<div class="text-slate-300">Recherche en cours...</div>';

    try {
        const ticket = await apiLookupTicket(code);
        let event = getEventById(ticket.event_id);
        if (!event) {
            try {
                event = await apiGetEvent(ticket.event_id);
                OMT_STATE.events.push(event);
            } catch (e) {
                event = null;
            }
        }
        event = event || { titre: "Evenement" };
        const statusClass = ticket.status === 'valid' ? 'text-green-400' : 'text-red-400';
        const statusText = ticket.status === 'valid' ? 'VALIDE' : 'DEJA UTILISE';

        detailsDiv.innerHTML = `
            <div class="mb-4">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-white">${event.titre}</h3>
                    <span class="px-3 py-1 rounded bg-slate-700 text-xs font-mono">${ticket.qr_code_data}</span>
                </div>
                
                <div class="space-y-3 text-sm">
                    <div class="flex justify-between border-b border-slate-700 pb-2">
                        <span class="text-slate-400">Participant</span>
                        <span class="font-semibold">${ticket.participant_name}</span>
                    </div>
                    <div class="flex justify-between border-b border-slate-700 pb-2">
                        <span class="text-slate-400">Categorie</span>
                        <span class="font-semibold text-blue-400">${ticket.type.toUpperCase()}</span>
                    </div>
                    <div class="flex justify-between border-b border-slate-700 pb-2">
                        <span class="text-slate-400">Prix</span>
                        <span>${ticket.prix}€</span>
                    </div>
                    <div class="flex justify-between items-center pt-1">
                        <span class="text-slate-400">Statut</span>
                        <span class="font-bold ${statusClass}">${statusText}</span>
                    </div>
                </div>
            </div>

            ${ticket.status === 'valid' ? `
                <button onclick="validateTicket('${ticket.qr_code_data}')" class="w-full bg-green-600 py-3 rounded-lg hover:bg-green-700 transition font-bold shadow-lg shadow-green-900/50">
                    Valider le billet
                </button>
            ` : `
                <div class="bg-red-900/50 text-red-200 p-3 rounded-lg text-center text-sm">
                    Ce billet a deja ete valide.
                </div>
            `}
        `;
    } catch (err) {
        detailsDiv.innerHTML = `
            <div class="text-center">
                <div class="text-4xl mb-2">X</div>
                <h3 class="text-xl font-bold text-red-500 mb-2">Billet introuvable</h3>
                <p class="text-slate-400">Le code ${code} n'existe pas.</p>
            </div>
        `;
    }
}

async function validateTicket(code) {
    if (!isOnline()) {
        enqueueScan(code);
        OMT_STATE.scans.push({ code, valid: false, pending: true, time: new Date() });
        updateScanHistory();
        updateSyncButton();
        showToast('Hors ligne: scan en attente de synchronisation', 'info');
        return;
    }

    try {
        const ticket = await apiVerifyTicket(code);
        const idx = OMT_STATE.tickets.findIndex(t => t.id === ticket.id);
        if (idx >= 0) OMT_STATE.tickets[idx] = ticket;
        OMT_STATE.scans.push({ code: ticket.qr_code_data, valid: true, time: new Date() });
        await lookupTicket(code);
        updateScanHistory();
        updateSyncButton();
        showToast('Billet valide avec succes', 'success');
    } catch (err) {
        OMT_STATE.scans.push({ code, valid: false, time: new Date() });
        updateScanHistory();
        updateSyncButton();
        showToast(err.message || 'Validation impossible', 'error');
    }
}

// Global variable for scanner
let html5QrCode = null;
let camerasLoaded = false;
let scannerBusy = false;

function isSecureForCamera() {
    try {
        return window.isSecureContext || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    } catch (e) {
        return false;
    }
}

function getSavedCameraId() {
    return localStorage.getItem("omt_camera_id") || "";
}

function saveCameraPreference() {
    const sel = document.getElementById("camera-select");
    if (!sel) return;
    localStorage.setItem("omt_camera_id", sel.value || "");
}

async function refreshCameras() {
    if (typeof Html5Qrcode === "undefined" || typeof Html5Qrcode.getCameras !== "function") return;

    const select = document.getElementById("camera-select");
    if (!select) return;

    try {
        const cams = await Html5Qrcode.getCameras();
        const saved = getSavedCameraId();

        // Keep first option, rebuild others.
        select.innerHTML = '<option value="">Auto (arriere si possible)</option>' + cams.map(c => `<option value="${c.id}">${c.label || c.id}</option>`).join("");
        if (saved) select.value = saved;
        camerasLoaded = true;
    } catch (err) {
        console.error("Failed to get cameras", err);
        showToast("Impossible de lister les cameras (permission requise)", "error");
    }
}

function pickBestCameraId(cameras) {
    const saved = getSavedCameraId();
    if (saved && cameras.some(c => c.id === saved)) return saved;

    // Prefer back/environment camera if label is available.
    const back = cameras.find(c => /back|rear|environment|arriere|arrière/i.test(c.label || ""));
    if (back) return back.id;

    return cameras[0]?.id || "";
}

function startScanner() {
    if (scannerBusy) return;
    if (!isSecureForCamera()) {
        showToast("La camera necessite HTTPS ou localhost. Utilise \"Scanner via photo\".", "error");
        return;
    }

    const scannerContainer = document.getElementById('scanner-container');
    const startBtn = document.getElementById('btn-start-scan');
    const detailsDiv = document.getElementById('ticket-details');

    if (detailsDiv) detailsDiv.classList.add('hidden');
    if (scannerContainer) scannerContainer.classList.remove('hidden');
    if (startBtn) startBtn.classList.add('hidden');

    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }

    const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    scannerBusy = true;
    (async () => {
        try {
            // Camera selection (best effort)
            let cameraConfig = { facingMode: "environment" };
            if (typeof Html5Qrcode !== "undefined" && typeof Html5Qrcode.getCameras === "function") {
                const cams = await Html5Qrcode.getCameras();
                if (cams && cams.length > 0) {
                    if (!camerasLoaded) setTimeout(refreshCameras, 0);
                    const select = document.getElementById("camera-select");
                    const selected = select ? select.value : "";
                    const camId = selected || pickBestCameraId(cams);
                    if (camId) cameraConfig = { deviceId: { exact: camId } };
                }
            }

            await html5QrCode.start(cameraConfig, config, (decodedText) => {
                const input = document.getElementById('manual-code');
                if (input) input.value = decodedText;
                stopScanner();
                lookupTicket(decodedText);
            }, () => { });
        } catch (err) {
            console.error("Error starting scanner", err);
            showToast("Impossible d'acceder a la camera. Autorise la permission ou utilise \"Scanner via photo\".", "error");
            stopScanner();
        } finally {
            scannerBusy = false;
        }
    })();
}

function stopScanner() {
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
        }).catch(err => {
            console.error("Failed to stop scanner", err);
        });
    }

    const scannerContainer = document.getElementById('scanner-container');
    const startBtn = document.getElementById('btn-start-scan');

    if (scannerContainer) scannerContainer.classList.add('hidden');
    if (startBtn) startBtn.classList.remove('hidden');
}

function triggerPhotoScan() {
    const input = document.getElementById("qr-file");
    if (input) input.click();
}

async function scanFromFile(evt) {
    const file = evt?.target?.files?.[0];
    if (!file) return;

    try {
        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("reader");
        }

        // Ensure scanner UI is visible so "reader" exists and is properly sized.
        const scannerContainer = document.getElementById('scanner-container');
        const startBtn = document.getElementById('btn-start-scan');
        if (scannerContainer) scannerContainer.classList.remove('hidden');
        if (startBtn) startBtn.classList.add('hidden');

        const decodedText = await html5QrCode.scanFile(file, true);
        const input = document.getElementById('manual-code');
        if (input) input.value = decodedText;
        showToast("QR detecte", "success");
        stopScanner();
        lookupTicket(decodedText);
    } catch (err) {
        console.error("scanFromFile failed", err);
        showToast("Impossible de lire le QR sur la photo", "error");
    } finally {
        // Reset file input so user can pick the same file again if needed.
        try { evt.target.value = ""; } catch (e) { }
    }
}

async function simulateScan() {
    stopScanner();

    const startBtn = document.getElementById('btn-start-scan');
    if (startBtn) startBtn.innerHTML = '<span class="animate-pulse">Scan en cours...</span>';

    try {
        await apiListTickets();
        const validTickets = OMT_STATE.tickets.filter(t => t.status === 'valid');
        if (validTickets.length === 0) throw new Error("Aucun billet disponible");
        const randomTicket = validTickets[Math.floor(Math.random() * validTickets.length)];
        document.getElementById('manual-code').value = randomTicket.qr_code_data;
        await lookupTicket(randomTicket.qr_code_data);
    } catch (err) {
        showToast(err.message || "Aucun billet pour la simulation", "error");
    } finally {
        if (startBtn) startBtn.innerHTML = '<span class="text-2xl"> </span> Scanner un billet';
    }
}

async function syncOfflineScans() {
    const status = document.getElementById('net-status');
    if (!isOnline()) {
        showToast('Toujours hors ligne', 'info');
        if (status) status.textContent = 'Hors ligne';
        return;
    }

    const result = await flushScanQueue();
    if (status) status.textContent = 'En ligne';
    updateSyncButton();

    if (result.sentCodes && result.sentCodes.length > 0) {
        OMT_STATE.scans = OMT_STATE.scans.map(s => {
            if (s.pending && result.sentCodes.includes(s.code)) {
                return { ...s, pending: false, valid: true };
            }
            return s;
        });
        updateScanHistory();
    }

    if (result.sent > 0) {
        showToast(`${result.sent} scan(s) synchronise(s)`, 'success');
    }
    if (result.failed > 0) {
        showToast(`${result.failed} scan(s) en echec`, 'error');
    }
}

if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
        const status = document.getElementById('net-status');
        if (status) status.textContent = 'En ligne';
        updateSyncButton();
    });
    window.addEventListener("offline", () => {
        const status = document.getElementById('net-status');
        if (status) status.textContent = 'Hors ligne';
        updateSyncButton();
    });
}
