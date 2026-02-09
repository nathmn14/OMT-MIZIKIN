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
