# 🚀 Plan d'Optimisation - OMT Events

Ce document présente une analyse détaillée de l'architecture actuelle et propose des pistes concrètes pour améliorer les performances, la scalabilité et l'expérience utilisateur.

---

## 🔍 1. Analyse de l'Architecture & Relations

### 🏗️ Structure Globale
L'application suit une architecture **Découplée** :
- **Backend** : FastAPI (Asynchrone) + SQLAlchemy 2.0. Gère la logique métier, la sécurité (JWT) et la persistance.
- **Frontend** : Single Page Application (SPA) en Vanilla JS. Utilise un routeur personnalisé pour injecter du HTML dynamique dans un conteneur unique (`#app`).

### 🔄 Flux de Données & Dépendances
1. **Frontend (`js/router.js`)** intercepté par les clics.
2. Déclenchement de fonctions API dans **`js/db.js`**.
3. Appels HTTP vers les points d'entrée **`backend/app/api/`**.
4. Validation via **`schemas/`**, logique via **`services/`**, et accès DB via **`models/`**.

---

## 🛠️ 2. Goulots d'Étranglement Identifiés

### 📉 Performance Frontend
- **Re-rendu Massif** : L'utilisation systématique de `.innerHTML = PageX()` détruit et recrée tout le DOM à chaque changement de page, ce qui est coûteux en CPU.
- **Appels Redondants** : Le routeur appelle `apiListEvents()` ou `apiMe()` systématiquement, même si les données sont déjà présentes dans `OMT_STATE`.
- **Poids des Scripts** : Les fichiers comme `organizer.js` (36 Ko) ou `public.js` (30 Ko) sont chargés d'un bloc.

### 🗄️ Performance Backend & DB
- **Indices Manquants** : Les clés étrangères comme `event_id` dans les tables `tickets` et `categories` ne sont pas explicitement indexées, ralentissant les recherches sur de gros volumes.
- **Concurrence SQLite** : Bien que rapide, SQLite peut bloquer (`Database is locked`) lors de pics d'achats simultanés.
- **N+1 Potentiels** : La récupération des événements avec leurs catégories utilise `selectinload`, ce qui est bon, mais charger *toutes* les catégories pour la simple liste d'accueil est excessif.

---

## 🚀 3. Plan d'Optimisation

### 🟢 Phase 1 : Base de Données (Le plus gros gain)
- [ ] **Ajout d'Indices SQL** :
    - `tickets.event_id`
    - `tickets.category_id`
    - `ticket_categories.event_id`
    - `scans.ticket_id`
- [ ] **Optimisation des Requêtes** : Créer un schéma `EventShortOut` pour la page d'accueil (sans les descriptions longues ni le détail des catégories).

### 🔵 Phase 2 : Frontend & Réseau
- [ ] **Cache de Données** : Implémenter une vérification dans `Router.navigate` : si `OMT_STATE.events` est déjà rempli et date de moins de 5 minutes, ne pas refaire l'appel API.
- [ ] **Optimisation des Images** : Utiliser un service de redimensionnement ou compresser les affiches d'événements côté serveur avant stockage.
- [ ] **Minification & Compression** : Activer `GZip` ou `Brotli` sur le serveur Uvicorn pour réduire la taille des fichiers JS/CSS transférés.

### 🟡 Phase 3 : Structure & Scalabilité (Long Terme)
- [ ] **Migration PostgreSQL** : Si le trafic dépasse 1000 billets/heure, passer de SQLite à PostgreSQL pour gérer les transactions concurrentes de manière native.
- [ ] **Rendu Partiel** : Au lieu de remplacer tout `#app`, ne mettre à jour que les sections changeantes (ex: rafraîchir uniquement la liste des participants sans recharger la navigation).
- [ ] **Lazy Loading** : Charger les scripts `admin.js` ou `organizer.js` uniquement lorsque l'utilisateur accède à ces sections.

---

## 📈 4. Métriques de Succès
1. **Temps de chargement initial** : < 1.5s.
2. **Navigation entre pages** : < 200ms (grâce au cache).
3. **Recherche de billets/scans** : < 50ms constante (grâce aux indices).
