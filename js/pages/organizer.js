// ============================================
// PAGES ORGANISATEUR
// ============================================

let ticketCategories = [];
let uploadedImageUrl = null;

function PageDashboardOrga() {
    const myEvents = OMT_STATE.events;
    const totalVentes = OMT_STATE.tickets.length;
    const totalRevenu = OMT_STATE.tickets.reduce((sum, t) => sum + t.prix, 0);
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
                    <p class="stat-value font-bold">${totalRevenu}€</p>
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
                                            <button onclick="Router.navigate('manage-event', {eventId: ${e.id}})" class="text-blue-600 hover:text-blue-800 font-medium text-sm">Gerer</button>
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

    const draft = localStorage.getItem('event_draft');
    let title = '', date = '', time = '', location = '', desc = '';

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
                    <h1 class="text-3xl font-extrabold text-slate-900">Studio de Creation</h1>
                    <p class="text-slate-600 mt-2">Configurez votre evenement, vos billets et publiez en quelques clics.</p>
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
                        <form onsubmit="publishEvent(event)" class="space-y-8" onchange="saveDraft()">
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
                                    Publier l'evenement
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

    return `
        ${Navbar()}
        <div class="max-w-7xl mx-auto px-4 py-8">
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <button onclick="Router.navigate('dashboard-orga')" class="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-2 font-medium">
                        <- Retour au Tableau de bord
                    </button>
                    <h1 class="text-3xl font-bold text-slate-900">${event.titre}</h1>
                </div>
                <div class="flex gap-3">
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
function addCategory(name = '', price = 0, stock = 100) {
    ticketCategories.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        nom: name,
        prix: price,
        stock: stock
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
        cat[field] = field === 'nom' ? value : Number(value);
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
            <div class="w-full sm:w-32">
                <label class="text-xs text-slate-500 font-bold uppercase mb-1 block">Prix (€)</label>
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

async function publishEvent(e) {
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
        stock: Number(c.stock)
    }));

    const priceStandard = categories[0] ? categories[0].price : 0;
    const priceVip = categories[1] ? categories[1].price : 0;

    const btn = document.getElementById('publish-btn');
    btn.disabled = true;
    btn.textContent = "Publication...";

    try {
        await apiCreateEvent({
            title,
            description: desc,
            date,
            time,
            location,
            image_url: uploadedImageUrl,
            price_standard: priceStandard,
            price_vip: priceVip,
            categories
        });

        localStorage.removeItem('event_draft');
        showToast("Evenement publie avec succes", "success");
        Router.navigate('dashboard-orga');
    } catch (err) {
        showToast(err.message || "Erreur lors de la publication", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Publier l'evenement";
    }
}
