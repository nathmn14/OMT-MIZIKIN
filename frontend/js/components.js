// ============================================
// COMPOSANTS REUTILISABLES
// ============================================
function MizikinBrand(compact = false) {
    const logoUrl = typeof getAbsoluteAssetUrl === "function"
        ? getAbsoluteAssetUrl('assets/mizikin-logo.svg')
        : '/assets/mizikin-logo.svg';
    return `
        <div class="mizikin-brand ${compact ? 'mizikin-brand-compact' : ''}">
            <img src="${logoUrl}" alt="Logo MIZIKIN" class="mizikin-logo" />
            <div class="mizikin-wordmark">
                <strong>MIZIKIN</strong>
                <span>Music & Art Urban Festival</span>
            </div>
        </div>
    `;
}

function Navbar(showAuth = true) {
    const user = OMT_STATE.currentUser;

    // Determine dashboard route based on role
    let dashboardRoute = null;
    if (user) {
        if (user.role === 'organisateur') dashboardRoute = 'dashboard-orga';
        else if (user.role === 'verificateur') dashboardRoute = 'dashboard-verif';
        else if (user.role === 'admin') dashboardRoute = 'dashboard-admin';
    }

    const roleBadge = user ? `<span class="mizikin-pill">${user.role}</span>` : '';

    return `
        <nav class="sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center min-h-[5rem] py-3 gap-4">
                    <div class="flex items-center cursor-pointer" onclick="closeMobileMenu(); Router.navigate('home')">
                        ${MizikinBrand(true)}
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
                            <button type="button" class="mobile-menu-btn" onclick="toggleMobileMenu()" aria-label="Ouvrir le menu" aria-controls="mobile-menu" aria-expanded="false">
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
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
        <div class="mizikin-card rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" 
             onclick="Router.navigate('event-detail', {eventId: ${event.id}})">
            <div class="relative">
                <img src="${event.image}" alt="${event.titre}" class="w-full event-card-image object-cover" loading="lazy">
                <div class="absolute top-4 left-4">
                    <span class="mizikin-pill">Festival</span>
                </div>
            </div>
            <div class="p-4 sm:p-6">
                <h3 class="text-lg sm:text-xl font-bold text-slate-900 mb-2">${event.titre}</h3>
                <p class="text-sm sm:text-base text-slate-600 mb-4 line-clamp-2">${event.description || 'Experience live, art et emotions.'}</p>
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs sm:text-sm text-slate-500 mb-4">
                    <span>${formatDate(event.date)}</span>
                    <span>${event.lieu.split(',')[1] || event.lieu}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-blue-600 font-bold text-base sm:text-lg">A partir de ${formatPrice(event.prix_standard, event.currency || '$')}</span>
                    <span class="text-xs sm:text-sm text-slate-500">${event.billets_restants} places</span>
                </div>
            </div>
        </div>
    `;
}
