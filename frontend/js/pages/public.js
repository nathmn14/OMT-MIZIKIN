// ============================================
// PAGES PUBLIQUES (Home, Details, Checkout, Success)
// ============================================

function PageHome() {
    const user = OMT_STATE.currentUser;
    let dashboardRoute = null;
    if (user) {
        if (user.role === 'organisateur') dashboardRoute = 'dashboard-orga';
        else if (user.role === 'verificateur') dashboardRoute = 'dashboard-verif';
        else if (user.role === 'admin') dashboardRoute = 'dashboard-admin';
    }

    return `
        ${Navbar()}
        <div class="min-h-screen">
            <!-- Hero Section -->
            <section class="mizikin-hero py-12 sm:py-16 lg:py-20">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <div class="mizikin-kicker mb-4">MIZIKIN EXPERIENCE</div>
                            <h2 class="hero-title font-bold mb-4 sm:mb-5">La billetterie qui fait vibrer la musique, l'art et la ville.</h2>
                            <p class="hero-subtitle mb-6 sm:mb-8" data-typewriter="Explorez les scenes, reservez vite, gerez vos evenements et faites rayonner votre festival avec une interface plus intense, plus claire, plus vivante." data-type-speed="14" data-type-delay="220">Explorez les scenes, reservez vite, gerez vos evenements et faites rayonner votre festival avec une interface plus intense, plus claire, plus vivante.</p>
                            <div class="flex flex-wrap gap-3" data-stack-mobile>
                                <button onclick="window.scrollTo({ top: document.body.scrollHeight * 0.22, behavior: 'smooth' })" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">Voir les evenements</button>
                                ${user
            ? `
                                        ${dashboardRoute ? `<button onclick="Router.navigate('${dashboardRoute}')" class="bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-bold">Mon espace</button>` : ''}
                                        <button onclick="logout()" class="bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-bold">Se deconnecter</button>
                                    `
            : `
                                        <button onclick="Router.navigate('login')" class="bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-bold">Se connecter</button>
                                        <button onclick="Router.navigate('register')" class="bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-bold">Rejoindre MIZIKIN</button>
                                    `}
                            </div>
                        </div>
                        <div class="mizikin-panel">
                            ${MizikinBrand()}
                            <div class="grid grid-cols-2 gap-4 mt-8">
                                <div class="mizikin-stat">
                                    <span>Scenes</span>
                                    <strong>${OMT_STATE.events.length}</strong>
                                </div>
                                <div class="mizikin-stat">
                                    <span>Billetterie</span>
                                    <strong>Live</strong>
                                </div>
                                <div class="mizikin-stat">
                                    <span>Ambiance</span>
                                    <strong>Urbain</strong>
                                </div>
                                <div class="mizikin-stat">
                                    <span>Controle</span>
                                    <strong>Temps reel</strong>
                                </div>
                            </div>
                            <div class="mt-6 grid gap-3">
                                ${user
            ? `
                                        <button onclick="logout()" class="bg-slate-100 text-slate-700 px-4 py-3 rounded-lg font-bold">Quitter la session</button>
                                    `
            : `
                                        <button onclick="Router.navigate('login')" class="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold">Acces rapide connexion</button>
                                    `}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Events Grid -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <div class="mizikin-kicker mb-2">PROGRAMMATION</div>
                        <h3 class="text-2xl sm:text-3xl font-bold text-slate-900">Evenements a venir</h3>
                    </div>
                    <p class="text-slate-600 max-w-xl">Une selection pensee pour les concerts, showcases, experiences VIP et rendez-vous culturels de la communaute MIZIKIN.</p>
                </div>
                ${OMT_STATE.events.length === 0 ? `
                    <div class="mizikin-card rounded-xl p-6 text-slate-500">Aucun evenement disponible pour le moment.</div>
                ` : `
                    <div class="mizikin-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
            
            <div class="mizikin-card rounded-xl shadow-xl overflow-hidden">
                <div class="relative">
                    <img src="${event.image}" alt="${event.titre}" class="w-full h-48 sm:h-64 lg:h-96 object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                    <div class="absolute left-6 bottom-6">
                        <span class="mizikin-pill">MIZIKIN LIVE</span>
                    </div>
                </div>
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
                                    <div class="mizikin-ticket-option border-2 border-slate-200 rounded-lg p-4 sm:p-6 hover:border-blue-600 transition flex flex-col justify-between h-full">
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
                                <div class="mizikin-ticket-option border-2 border-slate-200 rounded-lg p-4 sm:p-6 hover:border-blue-600 transition">
                                    <h4 class="text-lg sm:text-xl font-bold mb-2">Billet Standard</h4>
                                    <p class="text-2xl sm:text-3xl font-bold text-blue-600 mb-3 sm:mb-4">${formatPrice(event.prix_standard, event.currency || '$')}</p>
                                    <button onclick="selectTicket(${event.id}, 'standard', ${event.prix_standard})" 
                                            class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base">
                                        Reserver
                                    </button>
                                </div>
                                <div class="mizikin-ticket-option border-2 border-purple-300 rounded-lg p-4 sm:p-6 hover:border-purple-600 transition bg-purple-50">
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
                    <div class="flex items-center gap-3" data-stack-mobile>
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

        saveLastPurchaseForEvent(eventId, tickets);
        showToast("Paiement reussi", "success");
        Router.navigate('ticket-success', { eventId, quantity: tickets.length });
    } catch (err) {
        showToast(err.message || "Erreur lors du paiement", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Confirmer et Payer";
    }
}

function escapeTicketHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getAbsoluteAssetUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
    if (typeof window !== "undefined" && window.location?.origin) {
        const normalized = path.startsWith('/') ? path : `/${path.replace(/^\.?\//, '')}`;
        return `${window.location.origin}${normalized}`;
    }
    return path;
}

function getTicketPresentationMeta(ticket) {
    const baseId = Number(ticket?.id || 0);
    const type = String(ticket?.type || 'STANDARD').toUpperCase();
    const sections = type.includes('VIP')
        ? ['VIP LOUNGE', 'GOLD RING', 'PREMIUM DECK']
        : ['FLOOR EAST', 'FLOOR WEST', 'TRIBUNE A', 'TRIBUNE B'];
    const section = sections[baseId % sections.length];
    const seat = `${String.fromCharCode(65 + (baseId % 6))}-${(baseId % 48) + 1}`;
    const serial = `MZK-${String(baseId).padStart(5, '0')}`;
    const isVip = type.includes('VIP');
    return {
        section,
        seat,
        serial,
        bandLabel: type,
        tierClass: isVip ? 'is-vip' : 'is-standard',
        tierLabel: isVip ? 'VIP ACCESS' : 'STANDARD ACCESS'
    };
}

function buildTicketVisual(ticket, event, qrId = null) {
    const safeTitle = escapeTicketHtml(event?.titre || 'Evenement MIZIKIN');
    const safeImage = escapeTicketHtml(getAbsoluteAssetUrl(event?.image || 'assets/mizikin-logo.svg'));
    const safeParticipant = escapeTicketHtml(ticket.participant_name || '');
    const safeCode = escapeTicketHtml(ticket.qr_code_data || '');
    const safeType = escapeTicketHtml((ticket.type || '').toUpperCase());
    const safeLocation = escapeTicketHtml(event?.lieu || 'Lieu a confirmer');
    const safeDate = escapeTicketHtml(event?.date ? formatDate(event.date) : 'Date a confirmer');
    const safePrice = escapeTicketHtml(formatPrice(ticket.price_paid || ticket.prix, ticket.payment_currency || '$'));
    const meta = getTicketPresentationMeta(ticket);
    const safeSection = escapeTicketHtml(meta.section);
    const safeSeat = escapeTicketHtml(meta.seat);
    const safeSerial = escapeTicketHtml(meta.serial);
    const safeBandLabel = escapeTicketHtml(meta.bandLabel);
    const safeTierLabel = escapeTicketHtml(meta.tierLabel);
    const logoUrl = escapeTicketHtml(getAbsoluteAssetUrl('assets/mizikin-logo.svg'));
    const qrBlock = qrId
        ? `<div id="${escapeTicketHtml(qrId)}" class="mizikin-ticket-qr-box qr-box"></div>`
        : `<div class="mizikin-ticket-code">${safeCode}</div>`;

    return `
        <article class="mizikin-ticket-card ${meta.tierClass}" data-ticket-card="${ticket.id}">
            <div class="mizikin-ticket-watermark">MIZIKIN</div>
            <div class="mizikin-ticket-sideband">${safeBandLabel}</div>
            <div class="mizikin-ticket-holo"></div>
            <div class="mizikin-ticket-poster">
                <img src="${safeImage}" alt="${safeTitle}" class="mizikin-ticket-poster-img">
                <div class="mizikin-ticket-overlay"></div>
                <div class="mizikin-ticket-brand">
                    <img src="${logoUrl}" alt="Logo MIZIKIN" class="mizikin-ticket-logo">
                    <span>MIZIKIN PASS</span>
                </div>
                <div class="mizikin-ticket-headline">
                    <div class="mizikin-ticket-kicker">${safeTierLabel}</div>
                    <h3>${safeTitle}</h3>
                </div>
            </div>
            <div class="mizikin-ticket-body">
                <div class="mizikin-ticket-main">
                    <div class="mizikin-ticket-chip">
                        <span>${safeType}</span>
                        <strong>VALIDE</strong>
                    </div>
                    <div class="mizikin-ticket-grid">
                        <div>
                            <span>Participant</span>
                            <strong>${safeParticipant}</strong>
                        </div>
                        <div>
                            <span>Montant</span>
                            <strong>${safePrice}</strong>
                        </div>
                        <div>
                            <span>Date</span>
                            <strong>${safeDate}</strong>
                        </div>
                        <div>
                            <span>Lieu</span>
                            <strong>${safeLocation}</strong>
                        </div>
                        <div>
                            <span>Zone</span>
                            <strong>${safeSection}</strong>
                        </div>
                        <div>
                            <span>Place</span>
                            <strong>${safeSeat}</strong>
                        </div>
                    </div>
                    <div class="mizikin-ticket-serial">SERIAL ${safeSerial}</div>
                </div>
                <div class="mizikin-ticket-stub">
                    ${qrBlock}
                    <div class="mizikin-ticket-ref">REF ${safeCode}</div>
                </div>
            </div>
        </article>
    `;
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
                        <div class="mizikin-ticket-shell">
                            ${buildTicketVisual(t, getEventById(t.event_id) || event, `qr-${t.id}`)}
                            <div class="mt-4 flex gap-2 justify-center flex-wrap">
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
    a.download = `MIZIKIN-QR-${code}.png`;
    a.click();
}

async function waitForTicketAssets(card) {
    const images = [...card.querySelectorAll("img")];
    await Promise.all(images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
        });
    }));

    await new Promise((resolve) => window.setTimeout(resolve, 80));
}

function loadCanvasImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Image load failed: ${src}`));
        img.src = src;
    });
}

function roundedRectPath(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function drawCoverImage(ctx, img, x, y, w, h) {
    const scale = Math.max(w / img.width, h / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const dx = x + (w - drawW) / 2;
    const dy = y + (h - drawH) / 2;
    ctx.drawImage(img, dx, dy, drawW, drawH);
}

function drawCanvasText(ctx, text, x, y, options = {}) {
    const {
        font = "400 24px sans-serif",
        color = "#18212a",
        align = "left",
        baseline = "alphabetic",
        maxWidth,
        letterSpacing = 0,
    } = options;

    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    if (!letterSpacing || align !== "left") {
        if (maxWidth) ctx.fillText(text, x, y, maxWidth);
        else ctx.fillText(text, x, y);
        ctx.restore();
        return;
    }

    let cursor = x;
    for (const char of text) {
        ctx.fillText(char, cursor, y);
        cursor += ctx.measureText(char).width + letterSpacing;
    }
    ctx.restore();
}

function drawCanvasWrappedText(ctx, text, x, y, maxWidth, lineHeight, options = {}) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    ctx.save();
    ctx.font = options.font || "400 24px sans-serif";

    let current = "";
    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width <= maxWidth || !current) {
            current = test;
        } else {
            lines.push(current);
            current = word;
        }
    }
    if (current) lines.push(current);
    ctx.restore();

    lines.forEach((line, index) => {
        drawCanvasText(ctx, line, x, y + (index * lineHeight), { ...options, maxWidth });
    });

    return lines.length;
}

function getQrImageDataUrl(ticketId, fallbackCode) {
    const qrNode = document.querySelector(`#qr-${ticketId} canvas, #qr-${ticketId} img`);
    if (!qrNode) return null;
    if (qrNode.tagName.toLowerCase() === "canvas") {
        return qrNode.toDataURL("image/png");
    }
    return qrNode.src || null;
}

async function renderTicketToCanvas(ticket, event) {
    const meta = getTicketPresentationMeta(ticket);
    const logoSrc = getAbsoluteAssetUrl('assets/mizikin-logo.svg');
    const posterSrc = getAbsoluteAssetUrl(event?.image || 'assets/mizikin-logo.svg');
    const qrSrc = getQrImageDataUrl(ticket.id, ticket.qr_code_data);

    const [logoImg, posterImg, qrImg] = await Promise.all([
        loadCanvasImage(logoSrc),
        loadCanvasImage(posterSrc).catch(() => loadCanvasImage(logoSrc)),
        qrSrc ? loadCanvasImage(qrSrc).catch(() => null) : Promise.resolve(null),
    ]);

    const width = 1080;
    const height = 760;
    const radius = 42;
    const posterHeight = 280;
    const sideBandWidth = 48;
    const stubWidth = 280;
    const padding = 44;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const vip = meta.tierClass === "is-vip";
    const bgTop = vip ? "#fff4df" : "#fff5df";
    const bgBottom = vip ? "#ffe3c3" : "#fff0cc";
    const chipA = vip ? "#f3c64e" : "#f26645";
    const chipB = vip ? "#d9a11f" : "#d94d2f";
    const chipText = vip ? "#2a1f02" : "#fff7e8";
    const stubBg = vip ? "#f7e0a0" : "#f8e6bb";

    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, bgTop);
    bgGradient.addColorStop(1, bgBottom);

    ctx.clearRect(0, 0, width, height);
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 18;
    ctx.fillStyle = bgGradient;
    roundedRectPath(ctx, 0, 0, width, height, radius);
    ctx.fill();
    ctx.shadowColor = "transparent";

    ctx.save();
    roundedRectPath(ctx, 0, 0, width, height, radius);
    ctx.clip();

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, posterHeight);
    ctx.clip();
    drawCoverImage(ctx, posterImg, 0, 0, width, posterHeight);
    const overlay = ctx.createLinearGradient(0, 0, 0, posterHeight);
    overlay.addColorStop(0, "rgba(8,19,27,0.06)");
    overlay.addColorStop(1, "rgba(8,19,27,0.82)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, posterHeight);
    ctx.restore();

    ctx.fillStyle = chipA;
    ctx.fillRect(width - sideBandWidth, 0, sideBandWidth, height);
    ctx.save();
    ctx.translate(width - 16, height / 2);
    ctx.rotate(Math.PI / 2);
    drawCanvasText(ctx, meta.bandLabel, 0, 0, {
        font: "800 22px Sora, sans-serif",
        color: chipText,
        align: "center",
        baseline: "middle",
        letterSpacing: 2,
    });
    ctx.restore();

    ctx.save();
    ctx.translate(width - 118, height - 120);
    ctx.rotate(-Math.PI / 2);
    drawCanvasText(ctx, "MIZIKIN", 0, 0, {
        font: "800 78px Sora, sans-serif",
        color: "rgba(242,102,69,0.08)",
        align: "center",
        baseline: "middle",
        letterSpacing: 6,
    });
    ctx.restore();

    const holoX = width - sideBandWidth - 118;
    const holoY = posterHeight - 34;
    const holoGradient = ctx.createLinearGradient(holoX, holoY, holoX + 86, holoY + 86);
    holoGradient.addColorStop(0, "rgba(255,255,255,0.55)");
    holoGradient.addColorStop(0.3, vip ? "rgba(243,198,78,0.42)" : "rgba(243,198,78,0.35)");
    holoGradient.addColorStop(0.6, "rgba(242,102,69,0.18)");
    holoGradient.addColorStop(1, "rgba(102,205,255,0.22)");
    ctx.fillStyle = holoGradient;
    roundedRectPath(ctx, holoX, holoY, 86, 86, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    roundedRectPath(ctx, holoX, holoY, 86, 86, 18);
    ctx.stroke();

    ctx.drawImage(logoImg, 34, 28, 72, 72);
    drawCanvasText(ctx, "MIZIKIN PASS", 126, 72, {
        font: "700 24px Space Grotesk, sans-serif",
        color: "#fff7e8",
        baseline: "middle",
        letterSpacing: 2,
    });

    drawCanvasText(ctx, meta.tierLabel, 42, posterHeight - 92, {
        font: "700 18px Space Grotesk, sans-serif",
        color: "#fff7e8",
        letterSpacing: 4,
    });
    drawCanvasWrappedText(ctx, event?.titre || "Evenement MIZIKIN", 42, posterHeight - 44, width - sideBandWidth - 90, 52, {
        font: "800 44px Sora, sans-serif",
        color: "#fff7e8",
    });

    const bodyY = posterHeight;
    const bodyHeight = height - posterHeight;
    const stubX = width - sideBandWidth - stubWidth;
    const stubCutR = 22;

    ctx.fillStyle = stubBg;
    ctx.fillRect(stubX, bodyY, stubWidth, bodyHeight);
    ctx.strokeStyle = "rgba(24,33,42,0.18)";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(stubX, bodyY);
    ctx.lineTo(stubX, height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#10202b";
    ctx.beginPath();
    ctx.arc(stubX, bodyY, stubCutR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(stubX, height, stubCutR, 0, Math.PI * 2);
    ctx.fill();

    const chipGradient = ctx.createLinearGradient(padding, bodyY + 30, padding + 280, bodyY + 80);
    chipGradient.addColorStop(0, chipA);
    chipGradient.addColorStop(1, chipB);
    ctx.fillStyle = chipGradient;
    roundedRectPath(ctx, padding, bodyY + 34, 260, 52, 26);
    ctx.fill();
    drawCanvasText(ctx, `${ticket.type || ""}`.toUpperCase(), padding + 24, bodyY + 66, {
        font: "800 18px Space Grotesk, sans-serif",
        color: chipText,
        baseline: "middle",
    });
    drawCanvasText(ctx, "VALIDE", padding + 160, bodyY + 66, {
        font: "800 18px Space Grotesk, sans-serif",
        color: chipText,
        baseline: "middle",
    });

    const info = [
        ["Participant", ticket.participant_name || ""],
        ["Montant", formatPrice(ticket.price_paid || ticket.prix, ticket.payment_currency || '$')],
        ["Date", event?.date ? formatDate(event.date) : "Date a confirmer"],
        ["Lieu", event?.lieu || "Lieu a confirmer"],
        ["Zone", meta.section],
        ["Place", meta.seat],
    ];
    const colWidth = (stubX - (padding * 2) - 24) / 2;
    const rowStartY = bodyY + 126;
    info.forEach(([label, value], index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const blockX = padding + (col * (colWidth + 24));
        const blockY = rowStartY + (row * 104);
        drawCanvasText(ctx, label.toUpperCase(), blockX, blockY, {
            font: "700 14px Space Grotesk, sans-serif",
            color: "#7b848c",
            letterSpacing: 2,
        });
        drawCanvasWrappedText(ctx, value, blockX, blockY + 30, colWidth, 28, {
            font: "700 24px Space Grotesk, sans-serif",
            color: "#18212a",
        });
    });

    ctx.strokeStyle = "rgba(24,33,42,0.16)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(padding, height - 96);
    ctx.lineTo(stubX - 28, height - 96);
    ctx.stroke();
    ctx.setLineDash([]);
    drawCanvasText(ctx, `SERIAL ${meta.serial}`, padding, height - 58, {
        font: "400 20px monospace",
        color: "#5c6670",
        letterSpacing: 1.5,
    });

    const qrSize = 176;
    const qrX = stubX + 54;
    const qrY = bodyY + 86;
    ctx.fillStyle = "#ffffff";
    roundedRectPath(ctx, qrX, qrY, qrSize, qrSize, 20);
    ctx.fill();
    if (qrImg) {
        ctx.drawImage(qrImg, qrX + 12, qrY + 12, qrSize - 24, qrSize - 24);
    } else {
        drawCanvasWrappedText(ctx, ticket.qr_code_data || "", qrX + 16, qrY + 74, qrSize - 32, 22, {
            font: "400 18px monospace",
            color: "#18212a",
        });
    }
    drawCanvasText(ctx, `REF ${ticket.qr_code_data}`, stubX + 34, bodyY + 306, {
        font: "400 20px monospace",
        color: "#5c6670",
        letterSpacing: 1.2,
    });

    ctx.restore();
    return canvas;
}

async function downloadTicket(ticketId) {
    const ticket = (OMT_STATE.lastPurchase || []).find((item) => String(item.id) === String(ticketId));
    if (!ticket) return;
    const meta = getTicketPresentationMeta(ticket);
    const event = getEventById(ticket.event_id);

    try {
        const canvas = await renderTicketToCanvas(ticket, event);
        const dataUrl = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${meta.serial.toLowerCase()}-${meta.bandLabel.toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (err) {
        showToast("Impossible de telecharger le billet en image", "error");
    }
}

function downloadAllTickets() {
    const tickets = OMT_STATE.lastPurchase || [];
    if (tickets.length === 0) return;

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;

    const styles = `
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #08131b; }
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
                border-radius: 24px;
                overflow: hidden;
                background: #fff5df;
                width: 100%;
                max-width: 540px;
                box-shadow: 0 24px 48px rgba(0,0,0,0.28);
                color: #18212a;
            }
            .hero {
                position: relative;
                height: 210px;
                overflow: hidden;
            }
            .hero img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }
            .hero::after {
                content: "";
                position: absolute;
                inset: 0;
                background: linear-gradient(180deg, rgba(8,19,27,0.05), rgba(8,19,27,0.82));
            }
            .brand {
                position: absolute;
                top: 16px;
                left: 16px;
                z-index: 2;
                display: flex;
                align-items: center;
                gap: 10px;
                color: #fff7e8;
                font-weight: 700;
                letter-spacing: 0.08em;
                font-size: 11px;
                text-transform: uppercase;
            }
            .brand img {
                width: 34px;
                height: 34px;
                border-radius: 50%;
            }
            .headline {
                position: absolute;
                left: 20px;
                right: 20px;
                bottom: 18px;
                z-index: 2;
                color: #fff7e8;
            }
            .headline .kicker {
                font-size: 10px;
                opacity: 0.85;
                text-transform: uppercase;
                letter-spacing: 0.18em;
                margin-bottom: 6px;
            }
            .headline .title {
                font-size: 28px;
                font-weight: 800;
                line-height: 1.05;
            }
            .body {
                display: grid;
                grid-template-columns: 1.65fr 0.95fr;
            }
            .main {
                padding: 24px;
            }
            .chip {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                border-radius: 999px;
                background: #f26645;
                color: #fff7e8;
                padding: 8px 14px;
                font-size: 11px;
                font-weight: 800;
                margin-bottom: 18px;
            }
            .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            .label {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.12em;
                color: #7b848c;
                margin-bottom: 6px;
            }
            .value {
                font-size: 14px;
                font-weight: 700;
                color: #18212a;
                line-height: 1.3;
            }
            .stub {
                position: relative;
                padding: 24px 18px;
                background: #f8e6bb;
                border-left: 2px dashed rgba(24, 33, 42, 0.2);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 14px;
            }
            .stub::before, .stub::after {
                content: "";
                position: absolute;
                left: -12px;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #08131b;
            }
            .stub::before { top: -12px; }
            .stub::after { bottom: -12px; }
            .qr {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 164px;
                height: 164px;
                background: white;
                border-radius: 18px;
                padding: 10px;
            }
            .qr img, .qr canvas { width: 100% !important; height: 100% !important; }
            .qr.fallback {
                font-family: monospace;
                font-size: 12px;
                text-align: center;
                color: #18212a;
                word-break: break-all;
            }
            .ref {
                font-family: monospace;
                font-size: 12px;
                color: #5c6670;
                text-align: center;
            }
            @media print {
                body { background: white; }
                .page-wrapper { padding: 0; }
                .ticket { box-shadow: none; page-break-after: always; }
            }
        </style>
    `;

    let html = `<html><head><title>Mes Billets MIZIKIN</title>${styles}</head><body>`;

    tickets.forEach(t => {
        const event = getEventById(t.event_id);
        const qrContainer = document.getElementById(`qr-${t.id}`);
        const qrImg = qrContainer ? (qrContainer.querySelector("img") || qrContainer.querySelector("canvas")) : null;
        const qrHtml = qrImg
            ? `<div class="qr">${qrImg.outerHTML}</div>`
            : `<div class="qr fallback">${escapeTicketHtml(t.qr_code_data)}</div>`;
        const meta = getTicketPresentationMeta(t);
        const logoUrl = escapeTicketHtml(getAbsoluteAssetUrl('assets/mizikin-logo.svg'));
        const eventImageUrl = escapeTicketHtml(getAbsoluteAssetUrl(event?.image || 'assets/mizikin-logo.svg'));

        html += `
            <div class="page-wrapper">
                <div class="ticket ${meta.tierClass}">
                    <div class="watermark">MIZIKIN</div>
                    <div class="sideband">${escapeTicketHtml(meta.bandLabel)}</div>
                    <div class="holo"></div>
                    <div class="hero">
                        <img src="${eventImageUrl}" alt="${escapeTicketHtml(event?.titre || 'MIZIKIN Event')}">
                        <div class="brand">
                            <img src="${logoUrl}" alt="MIZIKIN">
                            <span>MIZIKIN PASS</span>
                        </div>
                        <div class="headline">
                            <div class="kicker">${escapeTicketHtml(meta.tierLabel)}</div>
                            <div class="title">${escapeTicketHtml(event?.titre || 'MIZIKIN Event')}</div>
                        </div>
                    </div>
                    <div class="body">
                        <div class="main">
                            <div class="chip"><span>${escapeTicketHtml((t.type || '').toUpperCase())}</span><strong>VALIDE</strong></div>
                            <div class="grid">
                                <div><div class="label">Participant</div><div class="value">${escapeTicketHtml(t.participant_name)}</div></div>
                                <div><div class="label">Montant</div><div class="value">${escapeTicketHtml(formatPrice(t.price_paid || t.prix, t.payment_currency || '$'))}</div></div>
                                <div><div class="label">Date</div><div class="value">${escapeTicketHtml(event?.date ? formatDate(event.date) : 'Date a confirmer')}</div></div>
                                <div><div class="label">Lieu</div><div class="value">${escapeTicketHtml(event?.lieu || 'Lieu a confirmer')}</div></div>
                                <div><div class="label">Zone</div><div class="value">${escapeTicketHtml(meta.section)}</div></div>
                                <div><div class="label">Place</div><div class="value">${escapeTicketHtml(meta.seat)}</div></div>
                            </div>
                            <div class="serial">SERIAL ${escapeTicketHtml(meta.serial)}</div>
                        </div>
                        <div class="stub">
                            ${qrHtml}
                            <div class="ref">REF ${escapeTicketHtml(t.qr_code_data)}</div>
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
