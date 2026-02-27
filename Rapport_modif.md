# 📝 Rapport Global des Modifications - OMT Events
**Date :** 7 Février 2026
**Objet :** Mise en place du système complet de modération et de gestion des utilisateurs.

---

## 🏗️ 1. Architecture Backend (FastAPI)

### 🔹 Modèle de Données (`backend/app/models/user.py`)
- Ajout du champ `is_approved` (Boolean) pour isoler le statut d'approbation.
- Mise à jour du champ `status` pour une meilleure compatibilité.

### 🔹 Service Utilisateur (`backend/app/services/user.py`)
Création d'un service centralisant toute la logique métier :
- Approbation / Suspension complète.
- Changement de rôles (Admin, Organisateur, Vérificateur, User).
- Réinitialisation sécurisée des mots de passe.
- Suppression définitive des comptes.

### 🔹 API et Sécurité (`backend/app/api/`)
- **Nouveaux Endpoints Admin** : Refonte totale de `admin.py` avec des routes protégées pour chaque action.
- **Protection des Routes** : Création de la dépendance `require_role("admin")` dans `deps.py`.
- **Authentification** : Mise à jour de `auth.py` pour bloquer la connexion des comptes non approuvés avec une erreur 403 explicite.

### 🔹 Base de Données (`backend/app/db/`)
- Création d'un script de migration automatique `migrate_add_is_approved.py` pour mettre à jour la base de données existante sans perte de données.

---

## 🎨 2. Interface Frontend (Vanilla JS / Tailwind)

### 🔹 Gestionnaire d'Utilisateurs (`js/pages/users.js`)
Création d'une page dédiée "Studio Admin" incluant :
- **Recherche Instantanée** : Barre de recherche par nom ou email.
- **Filtrage Avancé** : Filtres par rôles et par statut d'approbation.
- **Tableau de Bord Interactif** : Une table modernisée avec badges de rôles colorés.
- **Actions Rapides** : Boutons dédiés pour Valider, Modifier le rôle, Reset de mot de passe et Supprimer l'utilisateur.

### 🔹 Dashboard Admin (`js/pages/admin.js`)
- Ajout d'une section "Dernières inscriptions" pour une validation rapide.
- Intégration de compteurs en temps réel (Utilisateurs totaux, En attente).

### 🔹 Système de Navigation (`js/router.js` & `js/components.js`)
- **Navbar** : Ajout d'un accès direct "Utilisateurs" pour les administrateurs.
- **Routeur** : Correction d'un bug critique d'exécution des scripts dynamiques lors du changement de page.
- **API JS** : Ajout de 6 nouvelles fonctions dans `db.js` pour communiquer avec le backend.

---

## 🛡️ 3. Sécurité et Contrôle
- **Auto-protection** : Impossibilité pour un admin de se supprimer lui-même.
- **Validation** : Vérification des types de rôles et de la complexité des mots de passe.
- **Feedback** : Système de notifications (Toasts) pour chaque action réussie ou échouée.

---

## ✅ État Final
Le système est entièrement opérationnel. L'administrateur a désormais un contrôle total sur l'accès à la plateforme, garantissant la sécurité et la qualité des organisateurs présents sur OMT Events.

---

## 🛠️ Mise à jour du 9 Février 2026 (13:05)
**Objet :** Correction de la suppression des utilisateurs actifs et gestion des intégrités.

### 🔹 Corrections Backend
- **Modèle Scan (`backend/app/models/scan.py`)** : Ajout de `ondelete="SET NULL"` sur la clé étrangère `verifier_id`. Cela permet de supprimer un compte utilisateur (Vérificateur) même s'il a déjà scanné des billets, sans provoquer d'erreur d'intégrité en base de données.

### 🔹 Améliorations Frontend
- **API Client (`js/db.js`)** : Ajout de la fonction `apiDeleteUser` pour cibler la route de suppression définitive de l'API.
- **Interface Utilisateurs (`js/pages/users.js`)** : Correction de la fonction `removeUserInTable` qui utilisait par erreur la route de "rejet" (limitée aux comptes en attente). Elle utilise désormais `apiDeleteUser`, permettant à l'admin de supprimer n'importe quel utilisateur, qu'il soit approuvé ou non.

---

## 🛠️ Mise à jour du 9 Février 2026 (13:45)
**Objet :** Ajout de la gestion des événements pour l'administrateur.

### 🔹 Corrections Backend
- **Nouveaux Endpoints (`backend/app/api/routes/events.py`)** : Ajout de la route `DELETE /api/events/{id}` protégée par le rôle administrateur.
- **Modèle Ticket (`backend/app/models/ticket.py`)** : Ajout de `ondelete="CASCADE"` sur la clé étrangère `event_id`. La suppression d'un événement entraîne désormais la suppression propre de tous ses billets associés.
- **Modèle Scan (`backend/app/models/scan.py`)** : Ajout de `ondelete="CASCADE"` sur la clé étrangère `ticket_id`. La suppression d'un billet entraîne la suppression de son historique de scans.

### 🔹 Améliorations Frontend
- **Interface Admin (`js/pages/admin.js`)** : 
    - Intégration d'un nouveau tableau de gestion des événements dans le dashboard.
    - Affichage des statistiques par événement (nombre de billets vendus et revenus générés).
    - Ajout de la fonctionnalité de suppression définitive d'un événement avec confirmation de sécurité.
- **API Client (`js/db.js`)** : Ajout de la fonction `apiDeleteEvent`.

---

## 🛠️ Mise à jour du 9 Février 2026 (14:00)
**Objet :** Extension de la suppression des événements aux organisateurs.

### 🔹 Corrections Backend
- **Dépendances API (`backend/app/api/deps.py`)** : Ajout de la fonction `require_roles(roles: list[str])` permettant d'autoriser plusieurs rôles sur un même point de terminaison.
- **Points d'accès (`backend/app/api/routes/events.py`)** : Mise à jour de la route de suppression pour autoriser à la fois les administrateurs et les organisateurs.

### 🔹 Améliorations Frontend
- **Interface Organisateur (`js/pages/organizer.js`)** : 
    - Ajout d'un bouton de suppression (icône poubelle) à côté du bouton "Gérer" pour chaque événement dans le tableau de bord.
    - Implémentation de la fonction `deleteEventOrga` avec confirmation de sécurité et notification de succès.

---

## 🛠️ Mise à jour du 9 Février 2026 (14:45)
**Objet :** Ajout de la modification des événements pour les organisateurs et administrateurs.

### 🔹 Corrections Backend
- **Schémas API (`backend/app/schemas/event.py`)** : Ajout du schéma `EventUpdate` permettant des mises à jour partielles ou complètes des données de l'événement.
- **Points d'accès (`backend/app/api/routes/events.py`)** : Implémentation de la route `PUT /api/events/{id}` protégée. Cette route gère également la mise à jour dynamique des catégories de billets (suppression et remplacement propre).

### 🔹 Améliorations Frontend
- **API Client (`js/db.js`)** : Ajout de la fonction `apiUpdateEvent`.
- **Interface Organisateur (`js/pages/organizer.js`)** : 
    - Ajout d'un bouton "Modifier" dans le tableau de bord et dans la page de gestion détaillée de l'événement.
    - Evolution de la page "Studio de Création" (`PageCreateEvent`) pour basculer automatiquement en mode édition si un événement est passé en paramètre.
    - Pré-remplissage automatique de tous les champs (titre, date, heure, lieu, description, catégories de billets et affiche).
    - Mise à jour dynamique des textes et boutons selon le mode (Création vs Modification).

---

## 🛠️ Mise à jour du 9 Février 2026 (17:00)
**Objet :** Amélioration du processus d'achat de billets (limites de quantité).

### 🔹 Améliorations Frontend
- **Page de Paiement (`js/pages/public.js`)** : 
    - Suppression de la limite arbitraire de 10 billets maximum par achat.
    - La limite de quantité est désormais basée dynamiquement sur le **stock réel restant** pour la catégorie sélectionnée (ou le total de l'événement).
    - Mise à jour de l'interface pour bloquer l'incrémentation dès que le stock maximum est atteint, avec un message d'information à l'utilisateur.
    - Correction de la persistance de l'ID de catégorie lors du changement de quantité pour garantir l'intégrité de la commande.
- **Rendu des Billets (`js/pages/public.js` & `js/router.js`)** : 
    - Sécurisation du rendu des QR codes pour les commandes volumineuses (plus de 10 billets).
    - Ajout de mécanismes de secours (fallback) affichant le code texte si la génération d'image échoue pour un billet.
    - Consolidation des pages de succès pour unifier la logique d'affichage et éviter les conflits de rendu.
- **Téléchargement Groupé (`js/pages/public.js`)** : 
    - Ajout d'un bouton "Télécharger tous les billets" sur la page de succès.
    - Création d'une fonction `downloadAllTickets` générant un document PDF/Impression unique regroupant tous les billets de la commande avec une mise en page optimisée.
- **Centrage des Billets (Interface PDF)** : 
    - Amélioration de la mise en page CSS pour le téléchargement des billets.
    - Utilisation de Flexbox pour centrer parfaitement le contenu du billet verticalement et horizontalement sur la page, que ce soit pour un billet unique ou pour une série complète.

---

## 🛠️ Mise à jour du 11 Février 2026
**Objet :** Séparation étanche des organisateurs (Espaces Privés).

### 🔹 Modifications Backend
- **Modèle Événement (`backend/app/models/event.py`)** : Ajout d'une clé étrangère `organizer_id` liant chaque événement à son créateur.
- **API Événements (`backend/app/api/routes/events.py`)** : 
    - **Création** : Assignation automatique de l'ID de l'utilisateur connecté comme organisateur de l'événement.
    - **Filtrage** : Ajout d'un paramètre optionnel `organizer_id` sur la route de liste pour permettre de récupérer uniquement les événements d'un organisateur spécifique.
    - **Sécurité** : Mise en place d'une vérification stricte de propriété. Un organisateur ne peut désormais **modifier ou supprimer** que ses propres événements. Les administrateurs conservent un accès complet.
- **API Billets (`backend/app/api/routes/tickets.py`)** : Filtrage automatique des billets. Un organisateur ne peut désormais voir que les billets vendus pour ses propres événements.
- **Base de Données** : Exécution d'un script de migration pour ajouter la colonne `organizer_id` à la table `events` sans perte de données.

### 🔹 Améliorations Frontend
- **API Client (`js/db.js`)** : Mise à jour de `apiListEvents` pour supporter le filtrage par organisateur.
- **Routeur (`js/router.js`)** : 
    - Initialisation sécurisée : Chargement automatique des informations de l'utilisateur au démarrage de l'application si un jeton est présent.
    - Accès Dashboard : Le tableau de bord organisateur ne charge désormais que les événements appartenant à l'utilisateur connecté.
- **Interface Organisateur (`js/pages/organizer.js`)** : Adaptation de l'affichage pour garantir que les statistiques et les listes de participants sont strictement limitées aux données de l'organisateur.

### ✅ Résultat

---

## 🛠️ Mise à jour du 11 Février 2026 (18:30)
**Objet :** Amélioration de la gestion des utilisateurs par l'administrateur.

### 🔹 Modifications Backend
- **Modèle Utilisateur (`backend/app/models/user.py`)** : Ajout du champ `plain_password` pour permettre à l'administrateur de visualiser les mots de passe des comptes pour faciliter le support et la gestion.
- **Service Utilisateur (`backend/app/services/user.py`)** : 
    - **Sécurité des Rôles** : L'administrateur ne peut plus modifier le rôle d'un organisateur si celui-ci a des événements **en cours ou futurs**. Cela garantit la stabilité de la plateforme pour les participants.
    - **Support du rôle "Participant"** : Intégration complète du rôle participant (auparavant désigné comme "user" de manière générique).
- **Enregistrement et Reset** : Mise à jour des processus pour maintenir le champ `plain_password` à jour.

### 🔹 Améliorations Frontend
- **Interface Utilisateurs (`js/pages/users.js`)** : 
    - Ajout d'une colonne **"Mot de Passe"** dans le tableau de gestion. Les mots de passe sont affichés dans une police "monospaced" pour une meilleure lisibilité.
    - Mise à jour des filtres pour inclure explicitement le rôle "Participant".
- **Dashboard Admin (`js/pages/admin.js`)** : 
    - Mise à jour du sélecteur de rôle dans la fenêtre modale pour inclure "Participant".
    - Harmonisation des badges (nouveau badge orange pour les Participants).

### ✅ Sécurité
Le blocage du changement de rôle pour les organisateurs avec des événements actifs protège l'intégrité des ventes et de la validation des billets en cours.

---

## 🛠️ Mise à jour du 26 Février 2026
**Objet :** Affectation des vérificateurs aux événements.

### 🔹 Correction critique (DB)
- **Migration** : La table `event_verifiers` existait en base avec la mauvaise colonne `user_id`. Le script `migrate_event_verifiers.py` a été réécrit pour supprimer et recréer la table avec la colonne correcte `verifier_id`, éliminant une erreur 500 sur tous les endpoints `/api/events`.

### 🔹 Modifications Backend

- **Modèle `Event` (`backend/app/models/event.py`)** : Relation Many-to-Many `verifiers` entre `Event` et `User` via la table d'association `event_verifiers`. Permet de lier n vérificateurs à n événements.
- **API Événements (`backend/app/api/routes/events.py`)** : Ajout de 4 nouvelles routes :
  - `GET /events/assigned/me` — Vérificateur : liste ses événements affectés *(placée avant `/{event_id}` pour éviter le conflit de route)*
  - `GET /events/{id}/verifiers` — Admin/Organisateur : liste les vérificateurs d'un événement
  - `POST /events/{id}/verifiers/{user_id}` — Admin/Organisateur : affecter un vérificateur
  - `DELETE /events/{id}/verifiers/{user_id}` — Admin/Organisateur : retirer un vérificateur
- **Nouveau Router (`backend/app/api/routes/users.py`)** : Route `GET /users/verifiers` (accessible Admin + Organisateur) pour lister tous les utilisateurs ayant le rôle `verificateur` et approuvés.
- **Router principal (`backend/app/api/router.py`)** : Inclusion du nouveau router `users`.

### 🔹 Modifications Frontend

- **API Client (`js/db.js`)** : Ajout de 5 nouvelles fonctions :
  - `apiListVerifiers()`, `apiListEventVerifiers(eventId)`, `apiAddVerifier(eventId, userId)`, `apiRemoveVerifier(eventId, userId)`, `apiListAssignedEvents()`

- **Interface Organisateur (`js/pages/organizer.js`)** :
  - Nouvelle section **"Équipe de Validation"** dans `PageManageEvent()`.
  - Chargée dynamiquement après le rendu HTML initial (`setTimeout`).
  - Affiche les vérificateurs assignés avec bouton de retrait (×).
  - Bouton **"+ Ajouter"** ouvre une modale avec liste déroulante des vérificateurs disponibles.
  - **Adaptation Admin** : Le bouton de retour redirige désormais dynamiquement vers le bon dashboard (Admin ou Organisateur) selon le rôle de l'utilisateur.

- **Interface Administrateur (`js/pages/admin.js`)** :
  - Ajout d'un bouton **"Gérer"** dans la liste des événements pour permettre à l'administrateur d'accéder à la gestion de l'équipe de validation pour n'importe quel événement.

### ✅ Résultat
- Chaque vérificateur ne peut accéder qu'aux événements sur lesquels il a été affecté.
- L'organisateur **et l'administrateur** peuvent gérer l'équipe de validation.
- Les fonctionnalités existantes (scan de billets, gestion des événements, statistiques) restent intactes.

---

## ⚠️ Dépannage connu

### Erreur : `ModuleNotFoundError: No module named 'email_validator'` au démarrage du serveur

**Cause :** `uvicorn` est lancé avec le Python système (`C:\AppData\Local\Programs\Python\Python312\`) au lieu du Python de l'environnement virtuel du projet. Le module `email-validator` est installé dans le `env/` local, pas globalement.

**Solution :** Toujours activer l'environnement virtuel avant de démarrer le serveur :

```powershell
# Option 1 — activer l'env puis lancer normalement
.\env\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

# Option 2 — sans activation de l'env (utilise directement l'exécutable du venv)
env\Scripts\uvicorn.exe app.main:app --reload --port 8000

# Option 3 — via python -m uvicorn
env\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

> 💡 Le symbole `(env)` qui apparaît en début de ligne dans le terminal confirme que l'environnement virtuel est bien activé.
---

## 🛠️ Mise à jour du 26 Février 2026 (15:30)
**Objet :** Gestion multi-devises par catégorie et conversion au checkout.

### 🔹 Modifications Backend
- **Modèles (`backend/app/models/`)** :
  - `Event` & `TicketCategory` : Ajout d'un champ `currency` (par défaut `$`).
  - `Ticket` : Ajout de `payment_currency` et `price_paid` pour tracer la devise choisie et le montant converti lors de l'achat.
- **Schémas (`backend/app/schemas/`)** : Mise à jour des schémas d'entrée/sortie pour inclure les devises et le prix payé.
- **Service Billing (`backend/app/services/ticketing.py`)** : Logique de conversion intégrée (1$ = 2200 FC) pour stocker le prix final payé.
- **Migration DB** : Création et exécution du script `migrate_v2_currency.py` pour mettre à jour la structure SQLite.

### 🔹 Améliorations Frontend
- **Utilitaires (`js/db.js`)** :
  - Refonte de `formatPrice(amount, from, to)` : Gère désormais les conversions dynamiques basées sur le taux fixe.
  - Mise à jour de `normalizeEvent` et `normalizeTicket` : Garantit que les données brutes de l'API sont correctement mappées aux propriétés frontend (ex: `price_standard` -> `prix_standard`).
- **Interface Organisateur (`js/pages/organizer.js`)** :
  - Possibilité de choisir la devise ($ ou FC) pour **chaque catégorie de billet** individuellement lors de la création d'événement.
  - Consolidation des revenus en $ dans le dashboard pour un affichage cohérent.
- **Interface Utilisateur (`js/pages/public.js`)** :
  - **Détails Événement** : Affichage des prix dans la devise choisie par l'organisateur.
  - **Checkout Dynamique** : Le client peut désormais choisir sa devise de paiement ($ ou FC). Les prix unitaires et totaux sont convertis en temps réel.
- **Interface Admin (`js/pages/admin.js`)** :
  - Harmonisation du calcul des revenus totaux (base $) pour agréger les ventes multi-devises.

- **Correction d'Affichage** : Le backend synchronise désormais automatiquement la devise de l'événement avec celle de sa première catégorie de billet (généralement la catégorie standard). Cela garantit que les cartes d'événements sur la page d'accueil affichent le bon symbole ($ ou FC) dès la création.

---

## 🛡️ Mise à jour du 26 Février 2026 (17:00)
**Objet :** Audit de Sécurité et Renforcement (OWASP Top 10).

### 🔹 Sécurisation Backend
- **Protection Mass Assignment** : La route `/register` a été sécurisée pour empêcher l'auto-attribution de rôles (admin/organisateur). Le rôle est désormais forcé à "participant" par défaut.
- **Gestion des Secrets** : Déplacement de la `SECRET_KEY` vers un fichier `.env` sécurisé. L'application exige désormais une clé forte en environnement de production.
- **Prévention XSS** : Intégration de validateurs Pydantic avec `html.escape` sur les champs sensibles (noms, titres, descriptions) pour neutraliser les injections de scripts.
- **Concurrence & Intégrité** : Ajout de `CheckConstraint` en base de données pour garantir que les stocks de billets ne deviennent jamais négatifs, même en cas de forte affluence.

### 🔹 Gestion des Mots de Passe
- **Hachage Sécurisé** : Migration complète vers un système basé exclusivement sur `bcrypt`.
- **Note de Support** : Suite à la demande utilisateur, le champ `plain_password` a été rétabli pour permettre à l'administrateur de visualiser les mots de passe en clair pour faciliter le support technique.

### ✅ Résultat

---

## 🚀 Mise à jour du 26 Février 2026 (17:30)
**Objet :** Optimisation des performances (Backend/Frontend/DB).

### 🔹 Optimisations Base de Données
- **Indexation** : Ajout d'indices sur toutes les clés étrangères (`tickets.event_id`, `tickets.category_id`, `ticket_categories.event_id`, `scans.ticket_id`) pour des recherches instantanées sur de gros volumes.

### 🔹 Optimisations Backend
- **Schémas de Sortie** : Création du schéma `EventShortOut` pour les listes. Les données non essentielles (descriptions longues, détails des catégories) ne sont plus envoyées sur la page d'accueil, divisant par deux le poids des réponses JSON.

### 🔹 Optimisations Frontend
- **Cache Intelligent** : Implémentation d'un cache de 5 minutes dans `OMT_STATE`. La navigation entre les pages est désormais quasi instantanée car les données déjà chargées ne font plus l'objet d'appels API redondants.
- **Lazy Loading** : Les images des événements se chargent uniquement lorsqu'elles entrent dans le champ de vision de l'utilisateur, accélérant le rendu initial de la page.

### ✅ Résultat

---

## 📝 Mise à jour du 26 Février 2026 (18:40)
**Objet :** Amélioration de l'expérience utilisateur - Gestion des erreurs d'inscription.

### 🔹 Validation Backend renforcée
- Ajout d'une contrainte de longueur minimale (6 caractères) pour les mots de passe dans `RegisterRequest`.

### 🔹 Communication API détaillée
- Mise à jour de `apiFetch` pour extraire et formater les erreurs de validation complexes renvoyées par FastAPI (Pydantic). Désormais, les champs erronés sont identifiés précisément.

### 🔹 Interface Utilisateur (UX)
- **Bannière d'erreur** : Ajout d'un conteneur d'alerte rouge dynamique en haut du formulaire d'inscription.
- **Traduction des messages** : Les erreurs techniques (ex: "Email already used", "at least 6 characters") sont interceptées et affichées en français convivial pour l'utilisateur final.
- **Auto-scroll** : La page défile automatiquement vers le haut pour montrer l'erreur si l'inscription échoue.

### ✅ Résultat
Un processus d'inscription plus intuitif qui guide l'utilisateur en cas d'erreur de saisie.
