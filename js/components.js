// ============================================
// COMPOSANTS REUTILISABLES
// ============================================
function Navbar(showAuth = true) {
    const user = OMT_STATE.currentUser;

    // Determine dashboard route based on role
    let dashboardRoute = null;
    if (user) {
        if (user.role === 'organisateur') dashboardRoute = 'dashboard-orga';
        else if (user.role === 'verificateur') dashboardRoute = 'dashboard-verif';
        else if (user.role === 'admin') dashboardRoute = 'dashboard-admin';
    }

    const roleBadge = user ? `<span class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">${user.role}</span>` : '';

    return `
        <nav class="bg-white shadow-lg sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center cursor-pointer" onclick="Router.navigate('home')">
                        <h1 class="text-xl sm:text-2xl font-bold text-blue-600">OMT Events</h1>
                    </div>
                    ${showAuth ? `
                        <!-- Desktop Menu -->
                        <div class="hidden sm:flex gap-3 items-center">
                            ${user ? `
                                <div class="flex items-center gap-2">
                                    <span class="text-slate-700 text-sm sm:text-base hidden md:inline">Bonjour, ${user.nom}</span>
                                    ${roleBadge}
                                </div>
                                ${dashboardRoute ? `
                                <button onclick="Router.navigate('${dashboardRoute}')" class="bg-slate-100 text-slate-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-200 transition text-sm sm:text-base font-medium">
                                    Tableau de bord
                                </button>
                                ` : ''}
                                ${user.role === 'admin' ? `
                                <button onclick="Router.navigate('admin-users')" class="bg-blue-50 text-blue-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base font-medium">
                                    Utilisateurs
                                </button>
                                ` : ''}
                                <button onclick="logout()" class="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm sm:text-base">
                                    Deconnexion
                                </button>
                            ` : `
                                <button onclick="Router.navigate('login')" class="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base">
                                    Connexion
                                </button>
                            `}
                        </div>
                        <!-- Mobile Menu Button -->
                        <div class="sm:hidden">
                            <div class="mobile-menu-btn" onclick="toggleMobileMenu()">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            ${showAuth ? `
                <!-- Mobile Menu -->
                <div id="mobile-menu" class="mobile-menu">
                    ${user ? `
                        <div class="flex flex-col gap-3">
                            <div class="text-slate-700 font-medium py-2 border-b">Bonjour, ${user.nom}</div>
                            ${dashboardRoute ? `
                            <button onclick="Router.navigate('${dashboardRoute}'); closeMobileMenu();" class="bg-slate-100 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-200 transition font-medium w-full text-left">
                                Tableau de bord
                            </button>
                            ` : ''}
                            <button onclick="logout(); closeMobileMenu();" class="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition font-medium w-full">
                                Deconnexion
                            </button>
                        </div>
                    ` : `
                        <button onclick="Router.navigate('login'); closeMobileMenu();" class="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium w-full">
                            Connexion
                        </button>
                    `}
                </div>
            ` : ''}
        </nav>
    `;
}

function EventCard(event) {
    return `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" 
             onclick="Router.navigate('event-detail', {eventId: ${event.id}})">
            <img src="${event.image}" alt="${event.titre}" class="w-full event-card-image object-cover">
            <div class="p-4 sm:p-6">
                <h3 class="text-lg sm:text-xl font-bold text-slate-900 mb-2">${event.titre}</h3>
                <p class="text-sm sm:text-base text-slate-600 mb-4 line-clamp-2">${event.description}</p>
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs sm:text-sm text-slate-500 mb-4">
                    <span> ${formatDate(event.date)}</span>
                    <span> ${event.lieu.split(',')[1] || event.lieu}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-blue-600 font-bold text-base sm:text-lg">A partir de ${event.prix_standard}€</span>
                    <span class="text-xs sm:text-sm text-slate-500">${event.billets_restants} places</span>
                </div>
            </div>
        </div>
    `;
}
