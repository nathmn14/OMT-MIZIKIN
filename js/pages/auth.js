// ============================================
// PAGES AUTHENTIFICATION
// ============================================
function PageLogin() {
    return `
        ${Navbar(false)}
        <div class="min-h-screen flex items-center justify-center px-4 py-8">
            <div class="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md my-4">
                <button onclick="Router.navigate('home')" class="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 font-medium text-sm">
                    <- Retour a l'accueil
                </button>
                <div class="text-center mb-6 sm:mb-8">
                    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Bienvenue</h1>
                    <p class="text-gray-600 font-medium text-sm sm:text-base">Connectez-vous a votre espace</p>
                </div>
                
                <form onsubmit="handleLogin(event)">
                    <div class="mb-4">
                        <label class="block text-slate-700 font-medium mb-2 text-sm sm:text-base">Email</label>
                        <input type="email" id="login-email" value="orga@omt.com" class="w-full border-2 border-slate-200 rounded-lg px-3 sm:px-4 py-3 focus:border-blue-600 outline-none transition text-sm sm:text-base">
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-slate-700 font-medium mb-2 text-sm sm:text-base">Mot de passe</label>
                        <input type="password" id="login-password" value="orga123" class="w-full border-2 border-slate-200 rounded-lg px-3 sm:px-4 py-3 focus:border-blue-600 outline-none transition text-sm sm:text-base">
                    </div>
                    
                    <button type="submit" id="btn-login" class="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition font-bold text-sm sm:text-base mb-4 sm:mb-6 shadow-lg shadow-blue-500/30">
                        Se connecter
                    </button>
                    
                    <div class="text-center">
                        <p class="text-slate-600 text-sm">Deja un compte ? 
                            <button onclick="Router.navigate('login')" class="text-blue-600 font-bold hover:underline">Se connecter</button>
                        </p>
                        <div class="mt-4 pt-4 border-t border-slate-100">
                             <p class="text-xs text-slate-400 mb-2">Comptes de demo :</p>
                             <div class="flex flex-wrap justify-center gap-2 text-xs">
                                 <code class="bg-slate-100 px-2 py-1 rounded cursor-pointer hover:bg-slate-200" onclick="fillLogin('orga@omt.com', 'orga123')">Orga</code>
                                 <code class="bg-slate-100 px-2 py-1 rounded cursor-pointer hover:bg-slate-200" onclick="fillLogin('verif@omt.com', 'verif123')">Verif</code>
                                 <code class="bg-slate-100 px-2 py-1 rounded cursor-pointer hover:bg-slate-200" onclick="fillLogin('admin@omt.com', 'admin123')">Admin</code>
                             </div>
                        </div>
                    </div>
                </form>
                
                <div class="text-center mt-4 border-t pt-4">
                     <p class="text-slate-600 text-sm mb-2">Pas encore de compte ?</p>
                     <button onclick="Router.navigate('register')" class="w-full bg-slate-100 border border-slate-200 text-slate-700 py-3 rounded-lg hover:bg-slate-200 transition font-bold text-sm">
                        Creer un compte
                    </button>
                </div>
            </div>
        </div>
    `;
}

function PageRegister() {
    return `
        ${Navbar(false)}
        <div class="min-h-screen flex items-center justify-center px-4 py-8">
            <div class="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md my-4">
                <button onclick="Router.navigate('home')" class="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 font-medium text-sm">
                    <- Retour a l'accueil
                </button>
                <h1 class="text-2xl sm:text-3xl font-bold text-center mb-6">Inscription</h1>
                
                <form onsubmit="handleRegister(event)" class="space-y-4">
                    <div>
                        <label class="block text-slate-700 font-medium mb-1 text-sm">Nom complet</label>
                        <input type="text" id="reg-name" required class="w-full border-2 border-slate-200 rounded-lg px-3 py-2 focus:border-blue-600 outline-none">
                    </div>

                    <div>
                        <label class="block text-slate-700 font-medium mb-1 text-sm">Email</label>
                        <input type="email" id="reg-email" required class="w-full border-2 border-slate-200 rounded-lg px-3 py-2 focus:border-blue-600 outline-none">
                    </div>
                    
                    <div>
                        <label class="block text-slate-700 font-medium mb-1 text-sm">Mot de passe</label>
                        <input type="password" id="reg-password" required class="w-full border-2 border-slate-200 rounded-lg px-3 py-2 focus:border-blue-600 outline-none">
                    </div>

                    <div>
                        <label class="block text-slate-700 font-medium mb-1 text-sm">Telephone</label>
                        <input type="tel" id="reg-phone" required placeholder="+33 6 12 34 56 78" class="w-full border-2 border-slate-200 rounded-lg px-3 py-2 focus:border-blue-600 outline-none">
                    </div>

                    <div>
                        <label class="block text-slate-700 font-medium mb-1 text-sm">Role souhaite</label>
                        <select id="reg-role" class="w-full border-2 border-slate-200 rounded-lg px-3 py-2 focus:border-blue-600 outline-none bg-white">
                            <option value="organisateur">Organisateur</option>
                            <option value="verificateur">Verificateur</option>
                            <option value="admin">Administrateur</option>
                        </select>
                    </div>

                    <div class="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <h4 class="font-semibold text-sm mb-3 text-slate-700">Information de Paiement</h4>
                        <div class="mb-3">
                            <label class="block text-slate-600 text-xs mb-1">Mode de paiement</label>
                            <select id="reg-pay-method" onchange="updatePaymentPlaceholder()" class="w-full border border-slate-300 rounded px-2 py-2 outline-none text-sm">
                                <option value="mobile_money">Mobile Money</option>
                                <option value="card">Carte Bancaire</option>
                                <option value="paypal">PayPal</option>
                            </select>
                        </div>
                        <div>
                            <label id="reg-pay-label" class="block text-slate-600 text-xs mb-1">Numero de telephone</label>
                            <input type="text" id="reg-pay-detail" required placeholder="Ex: +229 01..." class="w-full border border-slate-300 rounded px-2 py-2 outline-none text-sm">
                        </div>
                    </div>
                    
                    <button type="submit" id="btn-register" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold text-sm sm:text-base mt-2">
                        S'inscrire
                    </button>
                </form>
                
                <div class="text-center mt-4">
                    <p class="text-slate-600 text-sm">Deja un compte ? 
                        <button onclick="Router.navigate('login')" class="text-blue-600 font-bold hover:underline">Se connecter</button>
                    </p>
                </div>
            </div>
        </div>
    `;
}

// LOGIQUE AUTH 
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('btn-login');

    btn.disabled = true;
    btn.textContent = "Connexion...";

    try {
        await apiLogin(email, password);
        const user = await apiMe();

        showToast("Connexion reussie", "success");

        if (user.role === 'organisateur') {
            Router.navigate('dashboard-orga');
        } else if (user.role === 'verificateur') {
            Router.navigate('dashboard-verif');
        } else if (user.role === 'admin') {
            Router.navigate('dashboard-admin');
        } else {
            Router.navigate('home');
        }
    } catch (err) {
        showToast(err.message || "Identifiants incorrects", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Se connecter";
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const payload = {
        nom: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        phone: document.getElementById('reg-phone').value,
        role: document.getElementById('reg-role').value,
        payment_method: document.getElementById('reg-pay-method').value,
        payment_detail: document.getElementById('reg-pay-detail').value
    };

    const btn = document.getElementById('btn-register');
    btn.disabled = true;
    btn.textContent = "Inscription...";

    try {
        await apiRegister(payload);
        showToast("Inscription reussie. Votre compte est en attente de validation.", "success");
        Router.navigate('login');
    } catch (err) {
        showToast(err.message || "Erreur lors de l'inscription", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "S'inscrire";
    }
}

function logout() {
    OMT_STATE.currentUser = null;
    saveTokens(null, null);
    localStorage.removeItem("omt_access");
    localStorage.removeItem("omt_refresh");
    Router.navigate('home');
}

function fillLogin(e, p) {
    document.getElementById('login-email').value = e;
    document.getElementById('login-password').value = p;
}

function updatePaymentPlaceholder() {
    const method = document.getElementById('reg-pay-method').value;
    const label = document.getElementById('reg-pay-label');
    const input = document.getElementById('reg-pay-detail');

    if (method === 'card') {
        label.textContent = 'Numero de carte';
        input.placeholder = 'XXXX XXXX XXXX XXXX';
    } else if (method === 'paypal') {
        label.textContent = 'Email PayPal';
        input.placeholder = 'exemple@paypal.com';
    } else {
        label.textContent = 'Numero de telephone';
        input.placeholder = 'Ex: +229 01...';
    }
}
