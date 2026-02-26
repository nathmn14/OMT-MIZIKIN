// ============================================
// PAGES ORGANISATEUR
// ============================================

let ticketCategories = [];
let uploadedImageUrl = null;

function PageDashboardOrga() {
    const myEvents = OMT_STATE.events;
    const totalVentes = OMT_STATE.tickets.length;
    // On convertit tout en $ pour le total global afin d'avoir une mesure cohérente
    const totalRevenuUSD = OMT_STATE.tickets.reduce((sum, t) => {
        const p = t.price_paid || t.prix || 0;
        const curr = t.payment_currency || '$';
        return sum + (curr === 'FC' ? p / 2200 : p);
    }, 0);
    const validTickets = OMT_STATE.tickets.filter(t => t.status === 'valid').length;

    return `
        ${Navbar()}
        <div class="max-w-7xl mx-auto px-4 py-6 sm:py-12">
            <button onclick="Router.navigate('home')" class="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 font-medium text-sm sm:text-base">
                <- Retour a l'accueil
            </button>
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <h1 class="text-2xl sm:text-3xl font-bold">Tableau de bord Organisateur</h1>
                <button onclick="Router.navigate('create-event')" class="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                    <span>+</span> Creer un evenement
                </button>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div class="stat-card text-white rounded-xl p-4 sm:p-6 shadow-xl">
                    <p class="text-sm opacity-90 mb-1">Total Ventes</p>
                    <p class="stat-value font-bold">${totalVentes}</p>
                </div>
                <div class="stat-card-green text-white rounded-xl p-4 sm:p-6 shadow-xl">
                    <p class="text-sm opacity-90 mb-1">Revenu Total</p>
                    <p class="stat-value font-bold">${formatPrice(totalRevenuUSD, '$')}</p>
                </div>
                <div class="bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-xl p-4 sm:p-6 shadow-xl">
                    <p class="text-sm opacity-90 mb-1">Billets a Valider</p>
                    <p class="stat-value font-bold">${validTickets}</p>
                </div>
            </div>
            
            <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Mes evenements</h2>
            <div class="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                <div class="table-container">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-slate-50 text-slate-600 uppercase text-xs sm:text-sm">
                            <tr>
                                <th class="p-3 sm:p-4">Evenement</th>
                                <th class="p-3 sm:p-4">Date</th>
                                <th class="p-3 sm:p-4">Lieu</th>
                                <th class="p-3 sm:p-4 text-center">Ventes</th>
                                <th class="p-3 sm:p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm sm:text-base">
                            ${myEvents.map(e => {
        const sold = OMT_STATE.tickets.filter(t => t.event_id === e.id).length;
        return `
                                    <tr class="border-b last:border-0 hover:bg-slate-50 transition">
                                        <td class="p-3 sm:p-4 font-semibold text-slate-900">${e.titre}</td>
                                        <td class="p-3 sm:p-4 text-slate-600 whitespace-nowrap">${formatDate(e.date)}</td>
                                        <td class="p-3 sm:p-4 text-slate-600">${e.lieu}</td>
                                        <td class="p-3 sm:p-4 text-center font-mono bg-blue-50 text-blue-700 font-bold rounded-lg my-2 w-fit mx-auto px-2 py-1">
                                            ${sold}
                                        </td>
                                        <td class="p-3 sm:p-4 text-right">
                                            <div class="flex justify-end items-center gap-3">
                                                <button onclick="Router.navigate('manage-event', {eventId: ${e.id}})" 
                                                        class="text-blue-600 hover:text-blue-800 font-bold text-sm">Gérer</button>
                                                <button onclick="editEvent(${e.id})" 
                                                        class="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold text-xs hover:bg-blue-100 transition">
                                                    Modifier
                                                </button>
                                                <button onclick="deleteEventOrga(${e.id})" 
                                                        class="text-red-500 hover:text-red-700 transition" 
                                                        title="Supprimer l'événement">
                                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
    }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function PageCreateEvent() {
    ticketCategories = [];
    uploadedImageUrl = null;

    let title = '', date = '', time = '', location = '', desc = '', eventId = null;

    if (Router.currentData && Router.currentData.event) {
        const e = Router.currentData.event;
        eventId = e.id;
        title = e.titre || '';
        date = e.date || '';
        time = e.time || '';
        location = e.lieu || '';
        desc = e.description || '';
        ticketCategories = e.categories || [];
        uploadedImageUrl = e.image || null;
    } else {
        const draft = localStorage.getItem('event_draft');
        if (draft) {
            try {
                const d = JSON.parse(draft);
                title = d.title || '';
                date = d.date || '';
                time = d.time || '';
                location = d.location || '';
                desc = d.desc || '';
                ticketCategories = d.categories || [];
                uploadedImageUrl = d.image || null;
            } catch (e) { }
        }
    }

    if (ticketCategories.length === 0) {
        addCategory('Standard', 50, 100);
        addCategory('VIP', 120, 50);
    }

    return `
        ${Navbar()}
        <div class="min-h-screen bg-slate-50 py-8 lg:py-12 px-4 sm:px-6">
            <div class="max-w-4xl mx-auto">
                <div class="mb-8">
                    <button onclick="Router.navigate('dashboard-orga')" class="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 font-medium">
                        <- Retour au Dashboard
                    </button>
                    <h1 class="text-3xl font-extrabold text-slate-900">${eventId ? 'Modifier l\'événement' : 'Studio de Creation'}</h1>
                    <p class="text-slate-600 mt-2">${eventId ? 'Mettez à jour les détails de votre événement.' : 'Configurez votre evenement, vos billets et publiez en quelques clics.'}</p>
                </div>

                <div class="flex gap-8 flex-col lg:flex-row">
                    <aside class="hidden lg:block w-64 space-y-2 sticky top-24 h-fit">
                        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-600">
                            <span class="font-bold text-slate-800 block">1. Informations</span>
                            <span class="text-sm text-slate-500">Details de l'evenement</span>
                        </div>
                        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-transparent text-slate-600 opacity-60">
                            <span class="font-bold block">2. Billetterie</span>
                            <span class="text-sm">Categories & Prix</span>
                        </div>
                        <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-transparent text-slate-600 opacity-60">
                            <span class="font-bold block">3. Medias</span>
                            <span class="text-sm">Affiche & Visuels</span>
                        </div>
                    </aside>

                    <main class="flex-1">
                        <form onsubmit="publishEvent(event, ${eventId})" class="space-y-8" onchange="saveDraft()">
                            <div class="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                                <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <span class="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">1</span>
                                    Informations Generales
                                </h2>
                                
                                <div class="space-y-5">
                                    <div>
                                        <label class="block text-slate-700 font-semibold mb-2">Nom de l'evenement <span class="text-red-500">*</span></label>
                                        <input type="text" id="evt-title" value="${title}" required placeholder="Ex: Concert Jazz Night..." 
                                               class="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-500 outline-none text-lg">
                                    </div>
                                    
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label class="block text-slate-700 font-semibold mb-2">Date <span class="text-red-500">*</span></label>
                                            <input type="date" id="evt-date" value="${date}" required class="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-500 outline-none">
                                        </div>
                                        <div>
                                            <label class="block text-slate-700 font-semibold mb-2">Heure <span class="text-red-500">*</span></label>
                                            <input type="time" id="evt-time" value="${time}" required class="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-500 outline-none">
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block text-slate-700 font-semibold mb-2">Lieu <span class="text-red-500">*</span></label>
                                        <input type="text" id="evt-location" value="${location}" required placeholder="Ex: Palais des Congres, Paris" 
                                               class="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-500 outline-none">
                                    </div>

                                    <div>
                                        <label class="block text-slate-700 font-semibold mb-2">Description</label>
                                        <textarea id="evt-desc" rows="4" placeholder="Decrivez votre evenement..." 
                                                  class="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-500 outline-none resize-none">${desc}</textarea>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                                <div class="flex justify-between items-center mb-6">
                                    <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                        <span class="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">2</span>
                                        Billetterie
                                    </h2>
                                    <button type="button" onclick="addCategoryUI()" class="text-blue-600 font-bold hover:bg-blue-50 px-3 py-2 rounded transition text-sm">
                                        + Ajouter une categorie
                                    </button>
                                </div>

                                <div id="categories-container" class="space-y-4"></div>
                            </div>

                            <div class="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                                <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <span class="bg-green-100 text-green-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">3</span>
                                    Medias & Design
                                </h2>

                                <div>
                                    <label class="block text-slate-700 font-semibold mb-3">
                                        Affiche de l'evenement <span class="text-red-500">*</span>
                                    </label>
                                    
                                    <div id="dropzone" 
                                         onclick="document.getElementById('image-upload').click()"
                                         class="border-3 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                                        <div id="dropzone-content">
                                            <div class="text-6xl mb-4">IMG</div>
                                            <p class="text-slate-600 font-medium mb-2">Cliquez pour selectionner une image</p>
                                            <p class="text-sm text-slate-500">ou glissez-deposez votre fichier ici</p>
                                            <p class="text-xs text-slate-400 mt-2">PNG, JPG jusqu'a 5MB</p>
                                        </div>
                                        <div id="image-preview" class="hidden">
                                            <img id="preview-img" src="" alt="Preview" class="max-w-full max-h-64 mx-auto rounded-lg shadow-lg">
                                            <p class="mt-3 text-sm text-slate-600">Cliquez pour changer l'image</p>
                                        </div>
                                    </div>
                                    <input type="file" id="image-upload" accept="image/*" class="hidden" onchange="handleImageUpload(event)">
                                </div>
                            </div>

                            <div class="flex justify-end gap-4">
                                <button type="button" onclick="Router.navigate('dashboard-orga')" 
                                        class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-8 py-4 rounded-lg font-bold transition">
                                    Annuler
                                </button>
                                <button type="submit" id="publish-btn"
                                        class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-lg font-bold text-lg shadow-xl transition">
                                    ${eventId ? 'Mettre à jour' : 'Publier l\'evenement'}
                                </button>
                            </div>
                        </form>
                    </main>
                </div>
            </div>
            <script>
                setTimeout(renderCategories, 0);
                if (uploadedImageUrl) setTimeout(() => showImagePreview(uploadedImageUrl), 0);
            <\/script>
        </div>
    `;
}

function PageManageEvent(eventId) {
    const event = getEventById(eventId);
    if (!event) return PageDashboardOrga();

    const eventTickets = OMT_STATE.tickets.filter(t => t.event_id === eventId);
    const totalSold = eventTickets.length;
    const totalCheckIn = eventTickets.filter(t => t.status === 'used').length;
    const checkInRate = totalSold > 0 ? Math.round((totalCheckIn / totalSold) * 100) : 0;

    // Charger les vérificateurs après le rendu du DOM
    setTimeout(() => loadManageEventVerifiers(eventId), 100);

    return `
        ${Navbar()}
        <div class="max-w-7xl mx-auto px-4 py-8">
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <button onclick="Router.navigate('${OMT_STATE.currentUser?.role === 'admin' ? 'dashboard-admin' : 'dashboard-orga'}')" class="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-2 font-medium">
                        <- Retour au Tableau de bord
                    </button>
                    <h1 class="text-3xl font-bold text-slate-900">${event.titre}</h1>
                </div>
                <div class="flex gap-3">
                    <button onclick="editEvent(${event.id})" class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition">
                        Modifier l'événement
                    </button>
                    <button onclick="Router.navigate('dashboard-verif')" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                        Scanner des billets
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <p class="text-slate-500 text-sm font-medium uppercase">Billets Vendus</p>
                    <p class="text-3xl font-bold text-slate-900 mt-2">${totalSold}</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <p class="text-slate-500 text-sm font-medium uppercase">Participants Presents</p>
                    <p class="text-3xl font-bold text-green-600 mt-2">${totalCheckIn}</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <p class="text-slate-500 text-sm font-medium uppercase">Taux de Presence</p>
                    <p class="text-3xl font-bold text-blue-600 mt-2">${checkInRate}%</p>
                </div>
            </div>



            <!-- SECTION ÉQUIPE DE VALIDATION -->
            <div class="bg-white rounded-xl shadow-lg border border-slate-100 mt-8">
                <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-bold text-slate-800">Équipe de Validation</h2>
                        <p class="text-sm text-slate-500 mt-1">Vérificateurs autorisés à scanner les billets de cet événement.</p>
                    </div>
                    <button onclick="showAddVerifierModal(${eventId})" class="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 transition shadow-sm flex items-center gap-2 shrink-0">
                        + Ajouter
                    </button>
                </div>
                <div id="verifiers-list" class="p-6">
                    <p class="text-slate-400 italic text-sm">Chargement...</p>
                </div>
            </div>
            <br>
            <br>

            <!-- SECTION liste des participants -->

            <div class="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                <div class="p-6 border-b border-slate-100">
                    <h2 class="text-xl font-bold text-slate-800">Liste des Participants</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
                            <tr>
                                <th class="p-4">Participant</th>
                                <th class="p-4">Billet</th>
                                <th class="p-4">Ref Achat</th>
                                <th class="p-4 text-center">Statut</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm divide-y divide-slate-100">
                            ${eventTickets.length === 0 ? `
                                <tr><td class="p-6 text-slate-500" colspan="4">Aucun billet vendu pour le moment.</td></tr>
                            ` : eventTickets.map(t => `
                                <tr class="hover:bg-slate-50">
                                    <td class="p-4">
                                        <div class="font-semibold text-slate-900">${t.participant_name}</div>
                                        <div class="text-xs text-slate-500">${t.participant_email || 'email@masque.com'}</div>
                                    </td>
                                    <td class="p-4">
                                        <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">${t.type}</span>
                                    </td>
                                    <td class="p-4 font-mono text-slate-600">${t.qr_code_data}</td>
                                    <td class="p-4 text-center">
                                        ${t.status === 'used'
            ? '<span class="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Present</span>'
            : '<span class="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-bold">En attente</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            

        </div>
    `;
}

// LOGIQUE ORGANISATEUR
function addCategory(name = '', price = 0, stock = 100, currency = '$') {
    ticketCategories.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        nom: name,
        prix: price,
        stock: stock,
        currency: currency
    });
}

function addCategoryUI() {
    addCategory('Nouveau Billet', 0, 100);
    renderCategories();
    saveDraft();
}

function removeCategory(id) {
    if (ticketCategories.length <= 1) {
        alert("Il faut au moins une categorie de billet.");
        return;
    }
    ticketCategories = ticketCategories.filter(c => c.id !== id);
    renderCategories();
    saveDraft();
}

function updateCategory(id, field, value) {
    const cat = ticketCategories.find(c => c.id === id);
    if (cat) {
        cat[field] = (field === 'nom' || field === 'currency') ? value : Number(value);
        saveDraft();
    }
}

function renderCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;

    container.innerHTML = ticketCategories.map((cat) => `
        <div class="flex flex-col sm:flex-row gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50 relative group">
            <div class="flex-1">
                <label class="text-xs text-slate-500 font-bold uppercase mb-1 block">Nom du billet</label>
                <input type="text" value="${cat.nom}" oninput="updateCategory(${cat.id}, 'nom', this.value)" 
                       class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm font-medium">
            </div>
            <div class="w-full sm:w-24">
                <label class="text-xs text-slate-500 font-bold uppercase mb-1 block">Devise</label>
                <select onchange="updateCategory(${cat.id}, 'currency', this.value)" 
                        class="w-full bg-white border border-slate-300 rounded px-2 py-2 text-sm font-medium">
                    <option value="$" ${cat.currency === '$' ? 'selected' : ''}>$</option>
                    <option value="FC" ${cat.currency === 'FC' ? 'selected' : ''}>FC</option>
                </select>
            </div>
            <div class="w-full sm:w-32">
                <label class="text-xs text-slate-500 font-bold uppercase mb-1 block">Prix</label>
                <input type="number" value="${cat.prix}" min="0" oninput="updateCategory(${cat.id}, 'prix', this.value)" 
                       class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm font-medium">
            </div>
            <div class="w-full sm:w-32">
                <label class="text-xs text-slate-500 font-bold uppercase mb-1 block">Quantite</label>
                <input type="number" value="${cat.stock}" min="1" oninput="updateCategory(${cat.id}, 'stock', this.value)" 
                       class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm font-medium">
            </div>
            
            <button type="button" onclick="removeCategory(${cat.id})" 
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-600">
                x
            </button>
        </div>
    `).join('');
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            uploadedImageUrl = e.target.result;
            showImagePreview(uploadedImageUrl);
            saveDraft();
        };
        reader.readAsDataURL(file);
    }
}

function showImagePreview(url) {
    const dropzoneContent = document.getElementById('dropzone-content');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');

    if (dropzoneContent && imagePreview && previewImg) {
        dropzoneContent.classList.add('hidden');
        imagePreview.classList.remove('hidden');
        previewImg.src = url;
    }
}

function saveDraft() {
    const title = document.getElementById('evt-title')?.value;
    const date = document.getElementById('evt-date')?.value;
    const time = document.getElementById('evt-time')?.value;
    const location = document.getElementById('evt-location')?.value;
    const desc = document.getElementById('evt-desc')?.value;

    const draft = {
        title, date, time, location, desc,
        categories: ticketCategories,
        image: uploadedImageUrl
    };

    localStorage.setItem('event_draft', JSON.stringify(draft));
}

async function publishEvent(e, eventId = null) {
    e.preventDefault();

    const title = document.getElementById('evt-title').value;
    const date = document.getElementById('evt-date').value;
    const time = document.getElementById('evt-time').value;
    const location = document.getElementById('evt-location').value;
    const desc = document.getElementById('evt-desc').value;

    if (ticketCategories.length === 0) {
        alert("Veuillez ajouter au moins une categorie de billet.");
        return;
    }
    if (!uploadedImageUrl) {
        alert("Veuillez ajouter une affiche.");
        return;
    }

    const categories = ticketCategories.map(c => ({
        name: c.nom,
        price: Number(c.prix),
        currency: c.currency || '$',
        stock: Number(c.stock)
    }));

    const priceStandard = categories[0] ? categories[0].price : 0;
    const priceVip = categories[1] ? categories[1].price : 0;

    const btn = document.getElementById('publish-btn');
    btn.disabled = true;
    btn.textContent = eventId ? "Mise à jour..." : "Publication...";

    try {
        const payload = {
            title,
            description: desc,
            date,
            time,
            location,
            image_url: uploadedImageUrl,
            price_standard: priceStandard,
            price_vip: priceVip,
            currency: categories[0] ? categories[0].currency : '$',
            categories
        };

        if (eventId) {
            await apiUpdateEvent(eventId, payload);
            showToast("Evenement mis à jour avec succes", "success");
        } else {
            await apiCreateEvent(payload);
            showToast("Evenement publie avec succes", "success");
        }

        localStorage.removeItem('event_draft');
        Router.navigate('dashboard-orga');
    } catch (err) {
        showToast(err.message || "Erreur lors de l'enregistrement", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = eventId ? "Mettre à jour" : "Publier l'evenement";
    }
}

async function deleteEventOrga(eventId) {
    if (!confirm("Voulez-vous vraiment supprimer cet événement ? Cette action est irréversible et supprimera tous les billets associés.")) {
        return;
    }

    try {
        await apiDeleteEvent(eventId);
        showToast("Événement supprimé avec succès", "success");

        // Rafraîchir les données et la page
        await apiListEvents();
        Router.navigate('dashboard-orga');
    } catch (err) {
        showToast(err.message || "Erreur lors de la suppression", "error");
    }
}

async function editEvent(eventId) {
    try {
        const event = await apiGetEvent(eventId);
        Router.navigate('create-event', { event });
    } catch (err) {
        showToast("Erreur lors de la récupération de l'événement", "error");
    }
}

// ============================================
// GESTION DES VÉRIFICATEURS (section Manage Event)
// ============================================

let _currentEventVerifiers = [];

async function loadManageEventVerifiers(eventId) {
    const container = document.getElementById('verifiers-list');
    if (!container) return;
    try {
        _currentEventVerifiers = await apiListEventVerifiers(eventId);
        renderManageVerifiersList(eventId);
    } catch (e) {
        if (container) container.innerHTML = '<p class="text-red-400 text-sm">Erreur de chargement.</p>';
    }
}

function renderManageVerifiersList(eventId) {
    const container = document.getElementById('verifiers-list');
    if (!container) return;
    if (_currentEventVerifiers.length === 0) {
        container.innerHTML = '<p class="text-slate-400 italic text-sm">Aucun vérificateur assigné à cet événement.</p>';
        return;
    }
    container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            ${_currentEventVerifiers.map(v => `
                <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div class="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm shrink-0">
                            ${(v.nom || v.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div class="overflow-hidden">
                            <p class="font-semibold text-slate-800 text-sm truncate">${v.nom || '—'}</p>
                            <p class="text-xs text-slate-500 truncate">${v.email}</p>
                        </div>
                    </div>
                    <button onclick="removeVerifierFromEvent(${eventId}, ${v.id})" title="Retirer" class="ml-2 text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition shrink-0 text-lg font-bold leading-none">&times;</button>
                </div>
            `).join('')}
        </div>
    `;
}

async function showAddVerifierModal(eventId) {
    let allVerifiers = [];
    try {
        allVerifiers = await apiListVerifiers();
    } catch (e) {
        showToast("Impossible de charger les vérificateurs", "error");
        return;
    }
    const assignedIds = new Set(_currentEventVerifiers.map(v => v.id));
    const candidates = allVerifiers.filter(v => !assignedIds.has(v.id));

    const options = candidates.length > 0
        ? candidates.map(v => `<option value="${v.id}">${v.nom} (${v.email})</option>`).join('')
        : '<option disabled value="">Aucun vérificateur disponible</option>';

    const existing = document.getElementById('add-verifier-modal');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', `
        <div id="add-verifier-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onclick="if(event.target.id==='add-verifier-modal') this.remove()">
            <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onclick="event.stopPropagation()">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-slate-900">Ajouter un vérificateur</h3>
                    <button onclick="document.getElementById('add-verifier-modal').remove()" class="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none">&times;</button>
                </div>
                <p class="text-sm text-slate-500 mb-4">Ce vérificateur pourra scanner les billets de cet événement.</p>
                <select id="verifier-select" class="w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 mb-5 focus:border-purple-500 outline-none text-sm">
                    ${options}
                </select>
                <div class="flex gap-3">
                    <button onclick="document.getElementById('add-verifier-modal').remove()" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg font-bold text-sm transition">Annuler</button>
                    ${candidates.length > 0 ? `<button onclick="confirmAddVerifier(${eventId})" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition shadow">Ajouter</button>` : ''}
                </div>
            </div>
        </div>
    `);
}

async function confirmAddVerifier(eventId) {
    const select = document.getElementById('verifier-select');
    if (!select || !select.value) return;
    const userId = parseInt(select.value);
    try {
        await apiAddVerifier(eventId, userId);
        showToast("Vérificateur ajouté avec succès", "success");
        document.getElementById('add-verifier-modal').remove();
        await loadManageEventVerifiers(eventId);
    } catch (e) {
        showToast(e.message || "Erreur lors de l'ajout", "error");
    }
}

async function removeVerifierFromEvent(eventId, userId) {
    if (!confirm("Retirer ce vérificateur de l'événement ?")) return;
    try {
        await apiRemoveVerifier(eventId, userId);
        showToast("Vérificateur retiré", "success");
        await loadManageEventVerifiers(eventId);
    } catch (e) {
        showToast(e.message || "Erreur", "error");
    }
}
