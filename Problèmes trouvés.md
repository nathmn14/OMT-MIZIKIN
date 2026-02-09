# 🔍 Audit des Problèmes et Vulnérabilités - OMT Events

Ce document récapitule les problèmes d'expérience utilisateur (UX), les failles logiques et les vulnérabilités de sécurité identifiés lors du scan complet de la plateforme.

---

## 🛡️ 1. Sécurité et Vulnérabilités (Critique)

### 🔴 Accès Public aux Données Sensibles (`backend/app/api/routes/tickets.py`)
- **Fuite de données participants** : La route `GET /api/tickets` est entièrement publique. N'importe qui peut lister tous les billets vendus, voir les noms des participants, leurs emails et surtout leurs codes de billets.
- **Vol de billets** : La route `GET /api/tickets/lookup` permet à n'importe qui de récupérer les détails d'un billet via son code, facilitant la fraude.
- **Vérification non protégée** : La route `POST /api/tickets/verify` n'exige pas de rôle `verificateur`. Un utilisateur malveillant pourrait "utiliser" tous les billets de la plateforme à distance.

### 🔴 Défaut d'Autorisation sur les Événements (`backend/app/api/routes/events.py`)
- **Création anonyme** : La route `POST /api/events` ne comporte aucune restriction. N'importe quel visiteur peut créer un événement sur la plateforme sans être connecté ni approuvé.
- **Absence de propriété (Isolation)** : Un organisateur connecté peut modifier ou supprimer **n'importe quel** événement de la plateforme, pas seulement les siens, car le modèle `Event` ne contient pas de champ `organizer_id`.

### 🟠 Escalade de Privilèges (`backend/app/api/routes/auth.py`)
- **Auto-attribution de rôle** : Lors de l'inscription (`/register`), l'utilisateur peut envoyer le rôle de son choix (ex: `admin`). Bien que l'approbation soit manuelle, cela expose le système à des erreurs humaines de validation si l'admin ne vérifie pas le rôle demandé.

### 🟡 Force Brute et Spam
- **Absence de Rate Limiting** : Aucune limite sur les tentatives de connexion ou de création de compte, exposant le système aux attaques par force brute.

---

## 🧠 2. Problèmes Logiques et Intégrité

### 🔴 Stockage des Images (`backend/app/models/event.py`)
- **Troncation des affiches** : Le champ `image_url` est limité à 2000 caractères dans la base de données. Cependant, le frontend envoie des images en format **Data URL** (Base64). Une image standard dépasse largement cette limite, ce qui entraînera des images coupées et corrompues lors de l'enregistrement.

### 🟠 Concurrence sur le Stock (`backend/app/services/ticketing.py`)
- **Risque de survente** : Dans un environnement à fort trafic (ex: ouverture d'une billetterie), deux achats simultanés pourraient ne pas voir le stock se décrémenter de manière atomique, entraînant des ventes dépassant la capacité réelle.

### 🟡 Historique des Scans Incomplet
- **Traçabilité** : Le modèle `Scan` n'enregistre pas l'ID du vérificateur (valeur par défaut à `None`). En cas de litige à l'entrée, il est impossible de savoir quel employé a validé un billet spécifique.

---

## 🎨 3. Expérience Utilisateur (UX)

### 👥 Pour les Participants
- **Perte de billets** : Si un utilisateur ferme la page de succès sans avoir téléchargé ses billets, il n'a aucun moyen de les retrouver (pas de page "Mes Billets" ni d'envoi d'email automatique implémenté).
- **Billets nominatifs limités** : Lors d'un achat groupé (ex: 5 places), le nom saisi dans le formulaire est dupliqué sur tous les billets. Il est impossible de saisir le nom de chaque invité séparément.

### 👔 Pour les Organisateurs
- **Statistiques erronées** : Le tableau de bord affiche les ventes et revenus **globaux** de la plateforme au lieu de filtrer uniquement les ventes liées aux événements de l'organisateur connecté.
- **Gestion des brouillons** : Un seul brouillon peut être sauvegardé localement. Commencer la création d'un deuxième événement écrase le premier.

### 🔍 Pour les Vérificateurs
- **Lenteur du flux** : Le processus actuel nécessite trop de tapes (Scan -> OK -> Valider). Pour une file d'attente fluide, la validation devrait être automatique dès que le QR code est détecté.
- **Synchronisation manuelle** : En cas de coupure réseau, les scans sont stockés localement mais l'utilisateur doit penser à cliquer manuelle sur "Synchroniser" une fois le réseau revenu.

### 👑 Pour l'Administrateur
- **Absence de recherche globale** : Impossible de rechercher un événement ou un utilisateur spécifique par nom dans les longues listes, ralentissant la modération.

---

## 🚀 4. Recommandations Prioritaires
1.  **Sécuriser les APIs** : Ajouter `Depends(require_role(...))` sur toutes les routes de tickets et d'événements.
2.  **Implémenter l'Isolation** : Ajouter `organizer_id` au modèle `Event` et vérifier la propriété avant modification.
3.  **Serveur de fichiers** : Utiliser un stockage d'images externe ou augmenter radicalement la taille des colonnes DB pour le Base64 (non recommandé).
4.  **Espace Client** : Créer une page simple permettant aux participants de retrouver leurs billets via leur email.
