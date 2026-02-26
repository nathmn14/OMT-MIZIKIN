// ============================================
// PAGES PUBLIQUES (Home, Details, Checkout, Success)
// ============================================

function PageHome() {
    return `
        ${Navbar()}
        <div class="min-h-screen">
            <!-- Hero Section -->
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-16 lg:py-20">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 class="hero-title font-bold mb-3 sm:mb-4">Decouvrez des evenements exceptionnels</h2>
                    <p class="hero-subtitle text-blue-100 mb-6 sm:mb-8">Reservez vos billets en quelques clics</p>
                </div>
            </div>
            
            <!-- Events Grid -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <h3 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">Evenements a venir</h3>
                ${OMT_STATE.events.length === 0 ? `
                    <div class="bg-white rounded-xl shadow p-6 text-slate-500">Aucun evenement disponible pour le moment.</div>
                ` : `
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        ${OMT_STATE.events.map(event => EventCard(event)).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
}

function PageEventDetail(eventId) {
    const event = getEventById(eventId);
    if (!event) return '<p>Evenement introuvable</p>';

    return `
        ${Navbar()}
        <div class="max-w-5xl mx-auto px-4 py-6 sm:py-12">
            <button onclick="Router.navigate('home')" class="text-blue-600 mb-4 sm:mb-6 flex items-center gap-2 hover:text-blue-700 text-sm sm:text-base">
                <- Retour aux evenements
            </button>
            
            <div class="bg-white rounded-xl shadow-xl overflow-hidden">
                <img src="${event.image}" alt="${event.titre}" class="w-full h-48 sm:h-64 lg:h-96 object-cover">
                <div class="p-4 sm:p-6 lg:p-8">
                    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">${event.titre}</h1>
                    <p class="text-slate-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">${event.description}</p>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 text-slate-700">
                        <div class="flex items-center gap-2">
                            <span class="text-xl sm:text-2xl"> </span>
                            <div>
                                <p class="font-semibold text-sm sm:text-base">Date</p>
                                <p class="text-sm sm:text-base">${formatDate(event.date)}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xl sm:text-2xl"> </span>
                            <div>
                                <p class="font-semibold text-sm sm:text-base">Lieu</p>
                                <p class="text-sm sm:text-base">${event.lieu}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="border-t pt-4 sm:pt-6">
                        <h3 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Choisissez votre billet</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            ${event.categories && event.categories.length > 0 ?
            event.categories.map(cat => `
                                    <div class="border-2 border-slate-200 rounded-lg p-4 sm:p-6 hover:border-blue-600 transition flex flex-col justify-between h-full">
                                        <div>
                                            <h4 class="text-lg sm:text-xl font-bold mb-2">${cat.nom}</h4>
                                            <p class="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">${formatPrice(cat.prix, cat.currency || event.currency || '$')}</p>
                                            <p class="text-sm text-slate-500 mb-4">${cat.stock} places disponibles</p>
                                        </div>
                                        <button onclick="selectTicket(${event.id}, '${cat.nom}', ${cat.prix}, ${cat.id})" 
                                                class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base">
                                            Reserver
                                        </button>
                                    </div>
                                `).join('')
            : `
                                <div class="border-2 border-slate-200 rounded-lg p-4 sm:p-6 hover:border-blue-600 transition">
                                    <h4 class="text-lg sm:text-xl font-bold mb-2">Billet Standard</h4>
                                    <p class="text-2xl sm:text-3xl font-bold text-blue-600 mb-3 sm:mb-4">${formatPrice(event.prix_standard, event.currency || '$')}</p>
                                    <button onclick="selectTicket(${event.id}, 'standard', ${event.prix_standard})" 
                                            class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base">
                                        Reserver
                                    </button>
                                </div>
                                <div class="border-2 border-purple-300 rounded-lg p-4 sm:p-6 hover:border-purple-600 transition bg-purple-50">
                                    <h4 class="text-lg sm:text-xl font-bold mb-2">Billet VIP</h4>
                                    <p class="text-2xl sm:text-3xl font-bold text-purple-600 mb-3 sm:mb-4">${formatPrice(event.prix_vip, event.currency || '$')}</p>
                                    <button onclick="selectTicket(${event.id}, 'vip', ${event.prix_vip})" 
                                            class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium text-sm sm:text-base">
                                        Reserver
                                    </button>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function PageCheckout(data) {
    const event = getEventById(data.eventId);
    const quantity = data.quantity || 1;
    const totalPrice = data.prix * quantity;
    const category = data.categoryId ? event.categories.find(c => c.id === data.categoryId) : null;
    const maxStock = category ? category.stock : event.billets_restants;

    return `
        ${Navbar(false)}
        <div class="max-w-3xl mx-auto px-4 py-6 sm:py-12">
            <button onclick="Router.navigate('event-detail', {eventId: ${data.eventId}})" class="text-blue-600 mb-4 sm:mb-6 flex items-center gap-2 hover:text-blue-700 text-sm sm:text-base">
                <- Retour a l'evenement
            </button>
            <h1 class="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Finaliser votre reservation</h1>
            
            <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
                <h3 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Recapitulatif</h3>
                <div class="border-b pb-3 sm:pb-4 mb-3 sm:mb-4">
                    <p class="font-semibold text-sm sm:text-base">${event.titre}</p>
                    <p class="text-slate-600 text-xs sm:text-sm">${formatDate(event.date)} - ${event.lieu}</p>
                    <p class="text-base sm:text-lg font-bold text-blue-600 mt-2">Billet ${data.type.toUpperCase()} - ${formatPrice(data.prix, category ? category.currency : (event.currency || '$'))}</p>
                </div>
                
                <div class="mb-3 sm:mb-4">
                    <label class="block text-slate-700 font-medium mb-2 text-sm sm:text-base">Nombre de billets</label>
                    <div class="flex items-center gap-3">
                        <button type="button" onclick="updateQuantity(${data.eventId}, '${data.type}', ${data.prix}, -1, ${data.categoryId || 'null'})" 
                                class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold w-10 h-10 rounded-lg transition text-lg">
                            -
                        </button>
                        <input type="number" id="ticket-quantity" value="${quantity}" min="1" max="${maxStock}" readonly
                               class="w-20 text-center border-2 border-slate-200 rounded-lg py-2 font-bold text-lg">
                        <button type="button" onclick="updateQuantity(${data.eventId}, '${data.type}', ${data.prix}, 1, ${data.categoryId || 'null'})" 
                                class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold w-10 h-10 rounded-lg transition text-lg">
                            +
                        </button>
                        <span class="text-slate-600 text-xs sm:text-sm ml-2">(${maxStock} places disponibles)</span>
                    </div>
                </div>
                
                <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 sm:p-4">
                    <div class="flex justify-between items-center mb-2 pb-2 border-b border-blue-200">
                        <span class="text-blue-900 font-bold text-sm sm:text-base">Devise de paiement :</span>
                        <select id="pay-currency" onchange="changePayCurrency(${data.eventId}, ${data.prix}, ${data.categoryId || 'null'})" 
                                class="bg-white border-2 border-blue-300 rounded px-2 py-1 text-xs font-bold text-blue-600">
                            <option value="$" ${category?.currency === '$' || (!category && event.currency === '$') ? 'selected' : ''}>Dollar ($)</option>
                            <option value="FC" ${category?.currency === 'FC' || (!category && event.currency === 'FC') ? 'selected' : ''}>Franc Congolais (FC)</option>
                        </select>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-slate-700 font-medium text-sm sm:text-base">Prix unitaire:</span>
                        <span class="text-slate-900 font-semibold text-sm sm:text-base" id="display-unit-price">${formatPrice(data.prix, category ? category.currency : (event.currency || '$'))}</span>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-slate-700 font-medium text-sm sm:text-base">Quantite:</span>
                        <span class="text-slate-900 font-semibold text-sm sm:text-base" id="display-quantity">${quantity}</span>
                    </div>
                    <div class="flex justify-between items-center mt-3 pt-3 border-t-2 border-blue-300">
                        <span class="text-blue-900 font-bold text-base sm:text-lg">Total a payer:</span>
                        <span class="text-blue-600 font-bold text-xl sm:text-2xl" id="total-price">${formatPrice(totalPrice, category ? category.currency : (event.currency || '$'))}</span>
                    </div>
                </div>
            </div>
            
            <form onsubmit="processCheckout(event, ${data.eventId}, '${data.type}', ${data.prix}, ${data.categoryId || 'null'}); return false;" class="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                <h3 class="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Vos informations</h3>
                
                <div class="mb-4">
                    <label class="block text-slate-700 font-medium mb-2 text-sm sm:text-base">Nom complet</label>
                    <input type="text" id="nom" required class="w-full border-2 border-slate-200 rounded-lg px-3 sm:px-4 py-3 focus:border-blue-600 outline-none text-sm sm:text-base">
                </div>
                
                <div class="mb-4">
                    <label class="block text-slate-700 font-medium mb-2 text-sm sm:text-base">Email</label>
                    <input type="email" id="email" required class="w-full border-2 border-slate-200 rounded-lg px-3 sm:px-4 py-3 focus:border-blue-600 outline-none text-sm sm:text-base">
                </div>
                
                <div class="mb-4 sm:mb-6">
                    <label class="block text-slate-700 font-medium mb-2 text-sm sm:text-base">Numero de telephone</label>
                    <input type="tel" id="tel" required placeholder="Ex: +229 01..." class="w-full border-2 border-slate-200 rounded-lg px-3 sm:px-4 py-3 focus:border-blue-600 outline-none text-sm sm:text-base">
                </div>
                
                <div class="mb-4 sm:mb-6">
                    <label class="block text-slate-700 font-medium mb-2 text-sm sm:text-base">Mode de paiement</label>
                    <select class="w-full border-2 border-slate-200 rounded-lg px-3 sm:px-4 py-3 focus:border-blue-600 outline-none text-sm sm:text-base">
                        <option>Mobile Money</option>
                        <option>Carte bancaire</option>
                        <option>PayPal</option>
                        <option>Virement</option>
                    </select>
                </div>
                
                <button type="submit" id="btn-pay" class="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition font-bold text-base sm:text-lg">
                    Confirmer et Payer <span id="submit-total">${formatPrice(totalPrice, category ? category.currency : (event.currency || '$'))}</span>
                </button>
            </form>

            <div id="checkout-result" class="mt-6"></div>
        </div>
    `;
}

// La fonction PageSuccess est désormais fusionnée avec PageTicketSuccess pour éviter les doublons

// LOGIQUE PUBLIQUE
function selectTicket(eventId, type, prix, categoryId = null) {
    Router.navigate('checkout', { eventId, type, prix, categoryId });
}

function updateQuantity(eventId, type, prix, change, categoryId = null) {
    const quantityInput = document.getElementById('ticket-quantity');
    const displayQuantity = document.getElementById('display-quantity');
    const totalPriceElement = document.getElementById('total-price');
    const submitTotal = document.getElementById('submit-total');
    const payCurrency = document.getElementById('pay-currency')?.value || '$';

    let currentQuantity = parseInt(quantityInput.value) || 1;
    let newQuantity = currentQuantity + change;

    const event = getEventById(eventId);
    const category = categoryId ? event.categories.find(c => c.id === categoryId) : null;
    const maxStock = category ? category.stock : event.billets_restants;
    const sourceCurrency = category ? category.currency : (event.currency || '$');

    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > maxStock) {
        newQuantity = maxStock;
        if (change > 0) {
            showToast(`Desole, il ne reste que ${maxStock} places disponibles pour cette categorie.`, "error");
        }
    }

    quantityInput.value = newQuantity;
    displayQuantity.textContent = newQuantity;

    const totalPrice = prix * newQuantity;
    totalPriceElement.textContent = formatPrice(totalPrice, sourceCurrency, payCurrency);
    submitTotal.textContent = formatPrice(totalPrice, sourceCurrency, payCurrency);

    Router.currentData = { eventId, type, prix, quantity: newQuantity, categoryId };
}

function changePayCurrency(eventId, prix, categoryId = null) {
    const quantity = parseInt(document.getElementById('ticket-quantity')?.value) || 1;
    const payCurrency = document.getElementById('pay-currency').value;
    const totalPriceElement = document.getElementById('total-price');
    const submitTotal = document.getElementById('submit-total');
    const unitPriceElement = document.getElementById('display-unit-price');

    const event = getEventById(eventId);
    const category = categoryId ? event.categories.find(c => c.id === categoryId) : null;
    const sourceCurrency = category ? category.currency : (event.currency || '$');

    const totalPrice = prix * quantity;

    unitPriceElement.textContent = formatPrice(prix, sourceCurrency, payCurrency);
    totalPriceElement.textContent = formatPrice(totalPrice, sourceCurrency, payCurrency);
    submitTotal.textContent = formatPrice(totalPrice, sourceCurrency, payCurrency);
}

async function processCheckout(e, eventId, type, prix, categoryId) {
    e.preventDefault();

    const nom = document.getElementById('nom').value;
    const email = document.getElementById('email').value;
    const quantity = parseInt(document.getElementById('ticket-quantity').value) || 1;
    const payCurrency = document.getElementById('pay-currency')?.value || '$';
    const btn = document.getElementById('btn-pay');

    const event = getEventById(eventId);
    const category = categoryId ? event.categories.find(c => c.id === categoryId) : null;
    const sourceCurrency = category ? category.currency : (event.currency || '$');

    // Calcul du prix payé (converti)
    const rate = 2200;
    let pricePaid = prix;
    if (sourceCurrency === "$" && payCurrency === "FC") pricePaid = prix * rate;
    else if (sourceCurrency === "FC" && payCurrency === "$") pricePaid = prix / rate;

    btn.disabled = true;
    btn.textContent = "Paiement...";

    try {
        const tickets = await apiCheckout({
            event_id: eventId,
            category_id: categoryId,
            ticket_type: type,
            price: prix, // Prix original
            quantity,
            participant_name: nom,
            participant_email: email,
            payment_currency: payCurrency,
            price_paid: Math.round(pricePaid)
        });

        showToast("Paiement reussi", "success");
        Router.navigate('ticket-success', { eventId, quantity: tickets.length });
    } catch (err) {
        showToast(err.message || "Erreur lors du paiement", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Confirmer et Payer";
    }
}

function PageTicketSuccess(data) {
    const tickets = OMT_STATE.lastPurchase || [];
    const event = data?.eventId ? getEventById(data.eventId) : (tickets[0] ? getEventById(tickets[0].event_id) : null);

    // Utiliser price_paid pour le total affiché
    const totalAmount = tickets.reduce((sum, t) => sum + (t.price_paid || t.prix), 0);
    const payCurrency = tickets[0]?.payment_currency || '$';

    return `
        ${Navbar(false)}
        <div class="max-w-4xl mx-auto px-4 py-6 sm:py-12 text-center">
            <div class="bg-white rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8">
                <h1 class="text-2xl sm:text-3xl font-bold text-green-600 mb-3 sm:mb-4">Paiement confirme</h1>
                <p class="text-sm sm:text-base text-slate-600 mb-2">Votre achat est valide. Vos billets sont ci-dessous.</p>
                <p class="text-lg sm:text-xl font-bold text-blue-600 mb-6 sm:mb-8">${tickets.length} billet${tickets.length > 1 ? 's' : ''} - Total: ${formatPrice(totalAmount, payCurrency)}</p>

                ${tickets.length > 1 ? `
                    <button onclick="downloadAllTickets()" class="mb-8 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 mx-auto">
                        📥 Télécharger tous les billets (${tickets.length})
                    </button>
                ` : ''}

                <div class="grid grid-cols-1 ${tickets.length > 1 ? 'md:grid-cols-2' : ''} gap-4 mb-6 sm:mb-8">
                    ${tickets.map(t => `
                        <div class="border-2 border-dashed border-slate-300 rounded-xl p-4 sm:p-6">
                            <h3 class="text-base sm:text-lg font-bold mb-3">${event ? event.titre : 'Evenement'}</h3>
                            <div class="flex justify-center mb-3">
                                <div id="qr-${t.id}" class="qr-box"></div>
                            </div>
                            <p class="font-mono text-xs text-slate-600 mb-2">Code: ${t.qr_code_data}</p>
                            <p class="text-xs sm:text-sm text-slate-700"><strong>Participant:</strong> ${t.participant_name}</p>
                            <p class="text-xs sm:text-sm text-slate-700"><strong>Type:</strong> ${t.type.toUpperCase()}</p>
                            <p class="text-xs sm:text-sm text-slate-700"><strong>Prix paye:</strong> ${formatPrice(t.price_paid || t.prix, t.payment_currency || '$')}</p>
                            <div class="mt-4 flex gap-2 justify-center">
                                <button class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold" onclick="downloadQr('${t.id}', '${t.qr_code_data}')">
                                    Telecharger QR
                                </button>
                                <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold" onclick="downloadTicket('${t.id}')">
                                    Telecharger billet
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                    <p class="text-sm text-slate-700">
                        Gardez cette page ouverte ou telechargez vos billets.
                    </p>
                </div>

                <button onclick="Router.navigate('home')" class="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base">
                    Retour a l'accueil
                </button>
            </div>
        </div>
    `;
}

function renderQrCodes() {
    const tickets = OMT_STATE.lastPurchase || [];
    if (tickets.length === 0) return;

    if (typeof QRCode === "undefined") {
        tickets.forEach(t => {
            const el = document.getElementById(`qr-${t.id}`);
            if (el) el.innerHTML = `<div class="text-xs text-slate-600 font-mono">${t.qr_code_data}</div>`;
        });
        return;
    }

    // On utilise un petit délai pour laisser au navigateur le temps de souffler entre chaque QR Code si beaucoup
    tickets.forEach((t, index) => {
        const el = document.getElementById(`qr-${t.id}`);
        if (!el) return;

        el.innerHTML = ""; // Clear
        try {
            new QRCode(el, {
                text: t.qr_code_data,
                width: 120,
                height: 120,
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (err) {
            console.error(`Erreur QR Code pour billet ${t.id}:`, err);
            el.innerHTML = `<div class="text-[10px] break-all">${t.qr_code_data}</div>`;
        }
    });
}

function downloadQr(ticketId, code) {
    const container = document.getElementById(`qr-${ticketId}`);
    if (!container) return;
    const img = container.querySelector("img") || container.querySelector("canvas");
    if (!img) return;

    let dataUrl;
    if (img.tagName.toLowerCase() === "canvas") {
        dataUrl = img.toDataURL("image/png");
    } else {
        dataUrl = img.src;
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `OMT-QR-${code}.png`;
    a.click();
}

function downloadTicket(ticketId) {
    const card = document.getElementById(`qr-${ticketId}`)?.closest(".border-2");
    if (!card) return;

    const printWindow = window.open("", "_blank", "width=600,height=800");
    if (!printWindow) return;

    const styles = `
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #f8fafc;
            }
            .ticket {
                border: 2px dashed #cbd5e1;
                border-radius: 20px;
                padding: 40px;
                background: white;
                width: 100%;
                max-width: 450px;
                box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 15px; text-align: center; color: #1e293b; }
            .qr { display: flex; justify-content: center; margin: 25px 0; }
            .qr img, .qr canvas { width: 200px !important; height: 200px !important; }
            .info-line { font-size: 14px; color: #334155; margin: 8px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
            .mono { font-family: monospace; font-size: 13px; color: #64748b; text-align: center; margin-top: 15px; }
            @media print {
                body { background: white; }
                .ticket { border: 2px solid #000; box-shadow: none; }
            }
        </style>
    `;
    const qrImg = card.querySelector("img") || card.querySelector("canvas");
    const qrHtml = qrImg ? `<div class="qr">${qrImg.outerHTML}</div>` : "";

    printWindow.document.write(`
        <html><head><title>Billet OMT</title>${styles}</head>
        <body>
            <div class="ticket">
                <div class="title">${card.querySelector("h3") ? card.querySelector("h3").innerText : 'Billet OMT'}</div>
                ${qrHtml}
                <div class="info-content">
                    ${[...card.querySelectorAll("p")].filter(p => !p.classList.contains('font-mono')).map(p => `<div class="info-line">${p.innerText}</div>`).join("")}
                </div>
                ${card.querySelector(".font-mono") ? `<div class="mono">${card.querySelector(".font-mono").innerText}</div>` : ""}
            </div>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

function downloadAllTickets() {
    const tickets = OMT_STATE.lastPurchase || [];
    if (tickets.length === 0) return;

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;

    const styles = `
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
            .page-wrapper {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 40px;
                box-sizing: border-box;
                page-break-after: always;
            }
            .ticket {
                border: 2px dashed #cbd5e1;
                border-radius: 20px;
                padding: 40px;
                background: white;
                width: 100%;
                max-width: 500px;
                box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            }
            .title { font-size: 28px; font-weight: bold; margin-bottom: 15px; color: #1e293b; text-align: center; }
            .mono { font-family: monospace; font-size: 14px; color: #64748b; text-align: center; margin-bottom: 25px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .info-item { font-size: 15px; color: #334155; font-weight: bold; }
            .info-label { color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
            .qr { display: flex; justify-content: center; margin: 25px 0; }
            .qr img, .qr canvas { width: 220px !important; height: 220px !important; }
            @media print {
                body { background: white; }
                .page-wrapper { padding: 0; }
                .ticket { border: 2px solid #000; box-shadow: none; page-break-after: always; }
            }
        </style>
    `;

    let html = `<html><head><title>Mes Billets OMT</title>${styles}</head><body>`;

    tickets.forEach(t => {
        const card = document.getElementById(`qr-${t.id}`)?.closest(".border-2");
        const qrImg = card ? (card.querySelector("img") || card.querySelector("canvas")) : null;
        const qrHtml = qrImg ? `<div class="qr">${qrImg.outerHTML}</div>` : "";
        const event = getEventById(t.event_id);

        html += `
            <div class="page-wrapper">
                <div class="ticket">
                    <div class="title">${event ? event.titre : 'OMT Event'}</div>
                    ${qrHtml}
                    <div class="mono">REF: ${t.qr_code_data}</div>
                    <div class="info-grid">
                        <div>
                            <div class="info-label">Participant</div>
                            <div class="info-item">${t.participant_name}</div>
                        </div>
                        <div>
                            <div class="info-label">Type de billet</div>
                            <div class="info-item">${t.type.toUpperCase()}</div>
                        </div>
                        <div>
                            <div class="info-label">Prix Paye</div>
                            <div class="info-item">${formatPrice(t.price_paid || t.prix, t.payment_currency || '$')}</div>
                        </div>
                        <div>
                            <div class="info-label">Statut</div>
                            <div class="info-item">VALIDE</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
    }, 500);
}
