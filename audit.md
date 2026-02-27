# Plan de remédiation sécurité — OMT Events

Date: 26 février 2026
Portée: backend + frontend + configuration + opérations

## Objectif
Réduire rapidement le risque exploitable en production, puis durcir l’application de manière durable.

## Priorités
- P0: corriger immédiatement (risque critique/exploitable)
- P1: corriger dans le sprint en cours
- P2: durcissement structurel et dette sécurité

## P0 — Actions immédiates (0-48h)

### 1) Supprimer le stockage/exposition des mots de passe en clair
- Problème: `plain_password` est stocké en base et exposé à l’admin UI/API.
- Impact: compromission massive en cas de fuite DB/API, non-conformité majeure.
- Actions:
  1. Retirer `plain_password` du modèle, des schémas, des réponses API et du frontend admin.
  2. Supprimer tout code qui écrit ce champ lors de l’inscription/reset.
  3. Migration DB: nullifier/effacer la colonne existante puis la supprimer si possible.
  4. Révoquer tous les mots de passe connus en clair et forcer un reset global.

### 2) Protéger les endpoints tickets sensibles
- Problème: endpoints critiques accessibles sans authentification (`lookup`, `verify`, `checkout`, etc.).
- Impact: fraude, validation abusive, fuite de données tickets.
- Actions:
  1. Exiger auth + rôle sur `POST /tickets/verify` (verificateur/admin).
  2. Restreindre `GET /tickets/lookup` aux rôles autorisés et au périmètre événement.
  3. Exiger auth sur `GET /tickets/{id}` + contrôle d’appartenance.
  4. Définir clairement la politique pour `checkout` (public assumé ou auth requis) et appliquer rate limit/anti-abus.

### 3) Rotation des secrets et nettoyage du repo
- Problème: `SECRET_KEY` réelle est commitée.
- Impact: forge de JWT possible si clé compromise.
- Actions:
  1. Générer une nouvelle clé forte et la déployer (rotation immédiate).
  2. Invalider tous les tokens existants.
  3. Ajouter `.env`/secrets à `.gitignore` + retirer les secrets du repo/historique.
  4. Mettre en place des variables d’environnement sécurisées par environnement.

### 4) Bloquer les XSS stockées
- Problème: champs event update non assainis, rendu `innerHTML` massif côté frontend.
- Impact: vol de session/tokens, takeover comptes.
- Actions:
  1. Sanitizer/validation stricte côté backend sur `EventUpdate` (même niveau que `EventCreate`).
  2. Côté frontend, éviter `innerHTML` pour les données utilisateur ou échapper systématiquement.
  3. Ajouter une CSP stricte (au minimum `script-src` maîtrisé).

## P1 — Sprint en cours (2-7 jours)

### 5) Corriger les contrôles d’accès horizontaux
- Problème: listing tickets potentiellement trop large pour certains rôles.
- Actions:
  1. Matrice RBAC explicite par endpoint (admin/organisateur/verificateur/participant/public).
  2. Filtrage serveur obligatoire par propriétaire/événement/assignation.
  3. Tests d’autorisation négatifs (403 attendus) pour chaque route.

### 6) Sécuriser la logique financière
- Problème: `price_paid` vient du client.
- Actions:
  1. Recalculer systématiquement côté serveur (prix, devise, conversion).
  2. Ignorer les montants clients non fiables.
  3. Journaliser les montants calculés + devise source/cible côté backend.

### 7) Durcir l’authentification
- Actions:
  1. Politique mot de passe forte (longueur + complexité minimale).
  2. Limiter les tentatives de login (rate limit + délai progressif).
  3. Ajouter `jti`/rotation refresh token et révocation.

### 8) Réduire l’exposition frontend
- Problème: tokens en `localStorage`.
- Actions:
  1. Migrer vers cookies `HttpOnly` + `Secure` + `SameSite` si architecture compatible.
  2. Éliminer les credentials de démo préremplis en environnement non-dev.
  3. Encadrer les dépendances CDN (SRI + versions figées, idéalement auto-hébergées).

## P2 — Durcissement structurel (1-4 semaines)

### 9) Gouvernance des secrets et pipeline
- Intégrer secret scanning (pre-commit + CI).
- Politique de rotation périodique (clés JWT, API keys).
- Séparer strictement `dev/staging/prod`.

### 10) Journalisation et détection
- Logs sécurité structurés (auth, refus RBAC, scans ticket, actions admin).
- Alertes sur patterns anormaux (pics de verify/lookup, bruteforce login).

### 11) Base de données et migrations
- Normaliser les migrations (outil dédié type Alembic).
- Ajouter contraintes DB complémentaires (unicité, bornes, intégrité référentielle selon besoins).

### 12) Qualité sécurité continue
- Suite de tests sécurité automatisés:
  - authN/authZ par route
  - non-régression XSS
  - validations d’entrée
  - scénarios fraude billetterie

## Plan d’exécution recommandé

### Lot A (J0-J1)
1. Rotation `SECRET_KEY` + invalidation tokens.
2. Suppression complète `plain_password` (code/API/UI + migration).
3. Verrouillage auth/rôles sur routes tickets critiques.

### Lot B (J2-J5)
1. Correctifs XSS backend+frontend + CSP.
2. Correction RBAC horizontale tickets/events.
3. Recalcul serveur des montants paiement.

### Lot C (Semaine suivante)
1. Renforcement auth (rate limit, refresh rotation).
2. Durcissement dépendances frontend/CDN.
3. Mise en place sécurité CI (secrets/tests).

## Critères d’acceptation (Done)
- Aucun mot de passe en clair stocké/exposé.
- Aucune route ticket sensible accessible anonymement hors cas explicitement voulu.
- Secret applicatif non présent dans le repo, clé tournée, anciens tokens invalides.
- Champs événement non exploitables en XSS stockée.
- Matrice RBAC testée avec cas négatifs.
- Prix payé calculé exclusivement côté serveur.

## Risques résiduels si non traité
- Prise de contrôle de comptes via XSS + vol de token.
- Fraude billetterie (lookup/verify abusifs).
- Falsification de tokens JWT si clé compromise.
- Fuite massive de secrets utilisateurs en cas d’incident DB/API.
