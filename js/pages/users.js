// ============================================
// PAGE GESTION DES UTILISATEURS
// ============================================

let userSearchQuery = '';
let userRoleFilter = 'all';

function PageUsersAdmin() {
    return `
        ${Navbar()}
        <div class="max-w-7xl mx-auto px-4 py-6 sm:py-12">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <button onclick="Router.navigate('admin')" class="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-2 font-medium text-sm">
                        <- Retour au Dashboard
                    </button>
                    <h1 class="text-2xl sm:text-3xl font-bold">Gestion des Utilisateurs</h1>
                </div>
                
                <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <!-- Barre de recherche -->
                    <div class="relative flex-1">
                        <input type="text" 
                               id="user-search" 
                               placeholder="Rechercher par nom ou email..." 
                               oninput="handleUserSearch(this.value)"
                               class="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-600 outline-none transition"
                               value="${userSearchQuery}">
                        <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
                    </div>
                    
                    <!-- Filtre par rôle -->
                    <select id="role-filter" 
                            onchange="handleRoleFilter(this.value)"
                            class="px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-600 outline-none transition bg-white">
                        <option value="all" ${userRoleFilter === 'all' ? 'selected' : ''}>Tous les rôles</option>
                        <option value="admin" ${userRoleFilter === 'admin' ? 'selected' : ''}>Administrateurs</option>
                        <option value="organisateur" ${userRoleFilter === 'organisateur' ? 'selected' : ''}>Organisateurs</option>
                        <option value="verificateur" ${userRoleFilter === 'verificateur' ? 'selected' : ''}>Vérificateurs</option>
                        <option value="user" ${userRoleFilter === 'user' ? 'selected' : ''}>Utilisateurs</option>
                        <option value="pending" ${userRoleFilter === 'pending' ? 'selected' : ''}>En attente</option>
                    </select>
                </div>
            </div>

            <!-- Liste des utilisateurs -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-sm uppercase">
                            <tr>
                                <th class="px-6 py-4">Utilisateur</th>
                                <th class="px-6 py-4">Rôle</th>
                                <th class="px-6 py-4">Statut</th>
                                <th class="px-6 py-4">Mot de passe</th>
                                <th class="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="users-list-body" class="divide-y divide-slate-100">
                            <tr>
                                <td colspan="5" class="px-6 py-12 text-center text-slate-500">Chargement...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function handleUserSearch(val) {
    userSearchQuery = val.toLowerCase();
    renderUsersTable();
}

function handleRoleFilter(val) {
    userRoleFilter = val;
    renderUsersTable();
}

async function loadUsersTable() {
    try {
        allUsers = await apiListAllUsers();
        renderUsersTable();
    } catch (err) {
        showToast("Erreur lors du chargement des utilisateurs", "error");
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('users-list-body');
    const tableHead = document.querySelector('.bg-slate-50.border-b tr');
    if (!tbody || !tableHead) return;

    // Ensure header exists (quick fix without modifying HTML string structure if calling multiple times)
    if (!tableHead.innerHTML.includes('Mot de passe')) {
        const passwordHeader = document.createElement('th');
        passwordHeader.className = "px-6 py-4";
        passwordHeader.textContent = "Mot de passe";
        // Insert before 'Actions' (last child)
        tableHead.insertBefore(passwordHeader, tableHead.lastElementChild);
    }

    let filtered = allUsers.filter(u => {
        const matchesSearch = u.nom.toLowerCase().includes(userSearchQuery) ||
            u.email.toLowerCase().includes(userSearchQuery);

        let matchesRole = true;
        if (userRoleFilter === 'pending') {
            matchesRole = !u.is_approved;
        } else if (userRoleFilter !== 'all') {
            matchesRole = u.role === userRoleFilter;
        }

        return matchesSearch && matchesRole;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-12 text-center text-slate-500 italic">Aucun utilisateur trouvé</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(u => `
        <tr class="hover:bg-slate-50/50 transition border-b border-slate-100 last:border-0">
            <td class="px-6 py-5">
                <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                        ${u.nom.charAt(0)}
                    </div>
                    <div>
                        <div class="font-bold text-slate-900">${u.nom}</div>
                        <div class="text-xs text-slate-500">${u.email}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-5">
                ${getRoleBadge(u.role)}
            </td>
            <td class="px-6 py-5">
                <div class="flex flex-col">
                    ${u.is_approved
            ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 w-fit">✅ Actif</span>'
            : '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 w-fit">⏳ En attente</span>'}
                    <span class="text-[10px] text-slate-400 mt-1">Inscrit le ${formatDate(u.created_at)}</span>
                </div>
            </td>
            <td class="px-6 py-5">
                 <div class="font-mono text-xs text-slate-400 break-all max-w-[150px] truncate" title="${u.password_hash || ''}">
                    ${u.password_hash ? u.password_hash.substring(0, 15) + '...' : 'N/A'}
                 </div>
            </td>
            <td class="px-6 py-5 text-right">
                <div class="flex justify-end gap-2">
                    ${!u.is_approved ? `
                        <button onclick="approveUserInTable(${u.id})" 
                                class="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                            Valider
                        </button>
                    ` : ''}
                    <div class="flex items-center bg-slate-100 rounded-lg p-1">
                        <button onclick="showChangeRoleModal(${u.id}, '${u.role}')" 
                                title="Modifier le rôle"
                                class="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-blue-600 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </button>
                        <button onclick="showResetPasswordModal(${u.id}, '${u.nom}')" 
                                title="Réinitialiser le mot de passe"
                                class="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-purple-600 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                        </button>
                        <button onclick="removeUserInTable(${u.id})" 
                                title="Retirer l'utilisateur"
                                class="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-red-600 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');
}

async function approveUserInTable(id) {
    await approveUser(id);
    loadUsersTable();
}

async function removeUserInTable(id) {
    if (confirm("Voulez-vous vraiment supprimer définitivement cet utilisateur ?")) {
        try {
            await apiDeleteUser(id);
            showToast("Utilisateur supprimé", "success");
            loadUsersTable();
        } catch (err) {
            showToast(err.message, "error");
        }
    }
}
