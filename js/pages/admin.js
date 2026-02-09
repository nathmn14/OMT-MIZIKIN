// ============================================
// PAGES ADMIN
// ============================================

let currentAdminTab = 'pending'; // pending, approved, all
let allUsers = [];

function PageDashboardAdmin() {
    const totalEvents = OMT_STATE.events.length;
    const totalTickets = OMT_STATE.tickets.length;
    const totalRevenu = OMT_STATE.tickets.reduce((sum, t) => sum + t.prix, 0);

    return `
        ${Navbar()}
        <div class="max-w-7xl mx-auto px-4 py-6 sm:py-12">
            <button onclick="Router.navigate('home')" class="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 font-medium text-sm sm:text-base">
                <- Retour a l'accueil
            </button>
            <h1 class="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Tableau de bord Administrateur</h1>
            
            <!-- Statistiques -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 sm:p-6 shadow-lg">
                    <p class="text-xs sm:text-sm opacity-90 mb-2">Evenements</p>
                    <p class="stat-value font-bold">${totalEvents}</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 sm:p-6 shadow-lg">
                    <p class="text-xs sm:text-sm opacity-90 mb-2">Billets Vendus</p>
                    <p class="stat-value font-bold">${totalTickets}</p>
                </div>
                <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4 sm:p-6 shadow-lg">
                    <p class="text-xs sm:text-sm opacity-90 mb-2">Revenu Total</p>
                    <p class="stat-value font-bold">${totalRevenu}€</p>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 sm:p-6 shadow-lg">
                    <p class="text-xs sm:text-sm opacity-90 mb-2">Utilisateurs</p>
                    <p class="stat-value font-bold" id="total-users-count">-</p>
                </div>
            </div>
            
            <!-- Gestion des utilisateurs -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                <div class="border-b border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 class="text-xl font-bold text-slate-900">Gestion des Utilisateurs</h2>
                        <p class="text-sm text-slate-500">Approuvez les nouvelles inscriptions et gérez les rôles.</p>
                    </div>
                    <button onclick="Router.navigate('admin-users')" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold transition shadow-md flex items-center justify-center gap-2">
                        👥 Gérer tous les utilisateurs
                    </button>
                </div>
                
                <div class="p-4 sm:p-6 bg-slate-50 border-b border-slate-100">
                    <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span class="flex h-2 w-2 rounded-full bg-orange-500"></span>
                        Dernières inscriptions en attente
                    </h3>
                    
                    <div id="quick-pending-list" class="space-y-3">
                        <div class="text-center py-4 text-slate-400">Chargement...</div>
                    </div>
                </div>
            </div>
            <!-- Gestion des événements -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100 mb-8">
                <div class="p-4 sm:p-6 border-b border-slate-200">
                    <h2 class="text-xl font-bold text-slate-900">Gestion des Événements</h2>
                    <p class="text-sm text-slate-500">Visualisez et gérez tous les événements de la plateforme.</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-xs uppercase tracking-wider">
                            <tr>
                                <th class="px-6 py-4">Événement</th>
                                <th class="px-6 py-4">Date & Lieu</th>
                                <th class="px-6 py-4">Stats</th>
                                <th class="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="admin-events-list" class="divide-y divide-slate-100">
                            <tr>
                                <td colspan="4" class="px-6 py-12 text-center text-slate-500 italic">Chargement des événements...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// LOGIQUE DASHBOARD
async function loadDashboardData() {
    try {
        allUsers = await apiListAllUsers();
        document.getElementById('total-users-count').textContent = allUsers.length;
        renderQuickPending();
        renderAdminEvents();
    } catch (err) {
        showToast("Erreur dashboard", "error");
    }
}

function renderQuickPending() {
    const container = document.getElementById('quick-pending-list');
    if (!container) return;

    const pending = allUsers.filter(u => !u.is_approved).slice(0, 5);

    if (pending.length === 0) {
        container.innerHTML = `<p class="text-center py-4 text-slate-500 italic bg-white rounded-lg border border-slate-100">Aucune inscription en attente.</p>`;
        return;
    }

    container.innerHTML = pending.map(u => `
        <div class="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-blue-200 transition">
            <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    ${u.nom.charAt(0)}
                </div>
                <div>
                    <div class="font-bold text-slate-800">${u.nom}</div>
                    <div class="text-xs text-slate-500">${u.email}</div>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="approveUser(${u.id})" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition shadow-sm">
                    Valider
                </button>
                <button onclick="Router.navigate('admin-users')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold transition">
                    Détails
                </button>
            </div>
        </div>
    `).join('');
}

function renderAdminEvents() {
    const container = document.getElementById('admin-events-list');
    if (!container) return;

    if (OMT_STATE.events.length === 0) {
        container.innerHTML = `<tr><td colspan="4" class="px-6 py-12 text-center text-slate-500 italic">Aucun événement n'a été créé.</td></tr>`;
        return;
    }

    container.innerHTML = OMT_STATE.events.map(event => {
        const eventTickets = OMT_STATE.tickets.filter(t => t.event_id === event.id);
        const soldCount = eventTickets.length;
        const totalRevenue = eventTickets.reduce((sum, t) => sum + t.prix, 0);

        return `
            <tr class="hover:bg-slate-50/50 transition">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <img src="${event.image || 'https://via.placeholder.com/150'}" alt="${event.titre}" class="h-10 w-16 object-cover rounded shadow-sm border border-slate-200">
                        <div>
                            <div class="font-bold text-slate-900">${event.titre}</div>
                            <div class="text-xs text-slate-500 truncate max-w-[200px]">${event.description || 'Pas de description'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-slate-700">${formatDate ? formatDate(event.date) : event.date}</div>
                    <div class="text-xs text-slate-500">${event.lieu}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-slate-700">${soldCount} billets vendus</span>
                        <span class="text-xs text-green-600 font-medium">${totalRevenue}€ générés</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                        <button onclick="deleteEventAdmin(${event.id})" 
                                class="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition"
                                title="Supprimer l'événement">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function deleteEventAdmin(eventId) {
    if (!confirm("Voulez-vous vraiment supprimer cet événement ? Cette action supprimera également tous les billets et catégories associés. Cette action est irréversible.")) {
        return;
    }

    try {
        await apiDeleteEvent(eventId);
        showToast("Événement supprimé avec succès", "success");
        // Recharger les données
        await apiListEvents();
        renderAdminEvents();
    } catch (err) {
        showToast(err.message || "Erreur lors de la suppression de l'événement", "error");
    }
}


// LOGIQUE ADMIN
async function loadAllUsers() {
    try {
        allUsers = await apiListAllUsers();
        document.getElementById('total-users-count').textContent = allUsers.length;
        updateUserCounts();
        displayUsers();
    } catch (err) {
        showToast(err.message || 'Erreur de chargement des utilisateurs', 'error');
        document.getElementById('users-container').innerHTML = `
            <p class="text-center text-slate-500 py-8">Erreur de chargement</p>
        `;
    }
}

function updateUserCounts() {
    const pending = allUsers.filter(u => !u.is_approved).length;
    const approved = allUsers.filter(u => u.is_approved).length;

    document.getElementById('pending-count').textContent = pending;
    document.getElementById('approved-count').textContent = approved;
}

function switchAdminTab(tab) {
    currentAdminTab = tab;
    updateTabStyles();
    displayUsers();
}

function updateTabStyles() {
    ['pending', 'approved', 'all'].forEach(tab => {
        const btn = document.getElementById(`tab-${tab}`);
        if (btn) {
            if (tab === currentAdminTab) {
                btn.className = 'tab-btn px-4 py-2 rounded-lg font-medium text-sm transition bg-blue-600 text-white';
            } else {
                btn.className = 'tab-btn px-4 py-2 rounded-lg font-medium text-sm transition bg-slate-100 text-slate-700 hover:bg-slate-200';
            }
        }
    });
}

function displayUsers() {
    const container = document.getElementById('users-container');
    if (!container) return;

    let filteredUsers = allUsers;

    if (currentAdminTab === 'pending') {
        filteredUsers = allUsers.filter(u => !u.is_approved);
    } else if (currentAdminTab === 'approved') {
        filteredUsers = allUsers.filter(u => u.is_approved);
    }

    if (filteredUsers.length === 0) {
        container.innerHTML = `
            <div class="text-center text-slate-500 py-8">
                ${currentAdminTab === 'pending' ? 'Aucune inscription en attente' : 'Aucun utilisateur'}
            </div>
        `;
        return;
    }

    container.innerHTML = filteredUsers.map(user => renderUserCard(user)).join('');
}

function renderUserCard(user) {
    const statusBadge = user.is_approved
        ? '<span class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">✓ Approuve</span>'
        : '<span class="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">⏳ En attente</span>';

    const roleBadge = getRoleBadge(user.role);

    return `
        <div class="border ${user.is_approved ? 'border-slate-200' : 'border-orange-200 bg-orange-50'} rounded-lg p-4 hover:shadow-md transition">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <!-- Info utilisateur -->
                <div class="flex-1">
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                        <h4 class="font-bold text-slate-900 text-base sm:text-lg">${user.nom}</h4>
                        ${statusBadge}
                        ${roleBadge}
                    </div>
                    <p class="text-sm text-slate-600 mb-1">📧 ${user.email}</p>
                    ${user.phone ? `<p class="text-sm text-slate-600 mb-1">📱 ${user.phone}</p>` : ''}
                    <p class="text-xs text-slate-500">Inscrit le ${formatDate(user.created_at)}</p>
                </div>
                
                <!-- Actions -->
                <div class="flex flex-wrap gap-2">
                    ${!user.is_approved ? `
                        <button onclick="approveUser(${user.id})" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm flex items-center gap-1">
                            ✓ Approuver
                        </button>
                        <button onclick="rejectUser(${user.id})" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm flex items-center gap-1">
                            ✕ Rejeter
                        </button>
                    ` : `
                        <button onclick="toggleUserApproval(${user.id})" class="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-medium text-sm transition shadow-sm">
                            Suspendre
                        </button>
                    `}
                    <button onclick="showChangeRoleModal(${user.id}, '${user.role}')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium text-sm transition shadow-sm">
                        Changer role
                    </button>
                    <button onclick="showResetPasswordModal(${user.id}, '${user.nom}')" class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg font-medium text-sm transition shadow-sm">
                        Reset MDP
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getRoleBadge(role) {
    const badges = {
        'admin': '<span class="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">👑 Admin</span>',
        'organisateur': '<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">🎪 Organisateur</span>',
        'verificateur': '<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">🔍 Verificateur</span>',
        'user': '<span class="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-bold">👤 User</span>'
    };
    return badges[role] || badges['user'];
}

async function approveUser(userId) {
    try {
        await apiApproveUser(userId);
        showToast("Utilisateur approuve avec succes", "success");
        await loadAllUsers();
    } catch (err) {
        showToast(err.message || "Erreur lors de l'approbation", "error");
    }
}

async function rejectUser(userId) {
    if (!confirm("Etes-vous sur de vouloir rejeter cette inscription ? L'utilisateur sera supprime.")) {
        return;
    }

    try {
        await apiRejectUser(userId);
        showToast("Inscription rejetee", "success");
        await loadAllUsers();
    } catch (err) {
        showToast(err.message || "Erreur lors du rejet", "error");
    }
}

async function toggleUserApproval(userId) {
    if (!confirm("Voulez-vous suspendre cet utilisateur ? Il ne pourra plus se connecter.")) {
        return;
    }

    try {
        await apiToggleUserApproval(userId);
        showToast("Statut modifie", "success");
        await loadAllUsers();
    } catch (err) {
        showToast(err.message || "Erreur", "error");
    }
}

function showChangeRoleModal(userId, currentRole) {
    const roles = [
        { value: 'user', label: 'User (Standard)' },
        { value: 'organisateur', label: 'Organisateur' },
        { value: 'verificateur', label: 'Verificateur' },
        { value: 'admin', label: 'Administrateur' }
    ];

    const options = roles.map(r =>
        `<option value="${r.value}" ${r.value === currentRole ? 'selected' : ''}>${r.label}</option>`
    ).join('');

    const modal = `
        <div id="role-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target.id==='role-modal') closeRoleModal()">
            <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl" onclick="event.stopPropagation()">
                <h3 class="text-xl font-bold mb-4">Changer le role</h3>
                <select id="new-role-select" class="w-full border-2 border-slate-200 rounded-lg px-4 py-3 mb-4 focus:border-blue-600 outline-none">
                    ${options}
                </select>
                <div class="flex gap-3">
                    <button onclick="closeRoleModal()" class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-lg font-bold transition">
                        Annuler
                    </button>
                    <button onclick="changeUserRole(${userId})" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-bold transition">
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
}

function closeRoleModal() {
    const modal = document.getElementById('role-modal');
    if (modal) modal.remove();
}

async function changeUserRole(userId) {
    const newRole = document.getElementById('new-role-select').value;

    try {
        await apiUpdateUserRole(userId, newRole);
        showToast("Role modifie avec succes", "success");
        closeRoleModal();
        await loadAllUsers();
    } catch (err) {
        showToast(err.message || "Erreur lors du changement de role", "error");
    }
}

function showResetPasswordModal(userId, userName) {
    const modal = `
        <div id="password-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target.id==='password-modal') closePasswordModal()">
            <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl" onclick="event.stopPropagation()">
                <h3 class="text-xl font-bold mb-2">Reinitialiser le mot de passe</h3>
                <p class="text-slate-600 mb-4">Pour: <strong>${userName}</strong></p>
                <input type="password" id="new-password-input" placeholder="Nouveau mot de passe (min. 6 caracteres)" 
                       class="w-full border-2 border-slate-200 rounded-lg px-4 py-3 mb-4 focus:border-blue-600 outline-none">
                <div class="flex gap-3">
                    <button onclick="closePasswordModal()" class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-lg font-bold transition">
                        Annuler
                    </button>
                    <button onclick="resetUserPassword(${userId})" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-bold transition">
                        Reinitialiser
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
}

function closePasswordModal() {
    const modal = document.getElementById('password-modal');
    if (modal) modal.remove();
}

async function resetUserPassword(userId) {
    const newPassword = document.getElementById('new-password-input').value;

    if (newPassword.length < 6) {
        showToast("Le mot de passe doit contenir au moins 6 caracteres", "error");
        return;
    }

    try {
        await apiResetUserPassword(userId, newPassword);
        showToast("Mot de passe reinitialise avec succes", "success");
        closePasswordModal();
    } catch (err) {
        showToast(err.message || "Erreur lors de la reinitialisation", "error");
    }
}

