# OMT Events — Plateforme de gestion de billetterie

Ce dépôt contient le backend (FastAPI) et le frontend statique d'une plateforme de billetterie. Le backend fournit des API pour gérer des utilisateurs, événements et billets ; le frontend est une application JavaScript/HTML simple servie depuis le même serveur.

---

## Prérequis

- Python 3.13+ (utilisez le `env/bin/python` fourni ou créez un venv local)
- Linux / macOS / Windows – la procédure ci‑dessous fonctionne dans un shell bash ou PowerShell.

---

## Installation

1. **Cloner le projet**

   ```bash
   git clone <repo-url>
   cd "OMT MIZIKIN"        # note : le nom du dossier contient un espace
   ```

2. **Activer un environnement virtuel** (optionnel mais recommandé) :

   ```bash
   python3 -m venv backend/env       # ou `python -m venv env` depuis backend/
   source backend/env/bin/activate   # bash/zsh
   # ou sous PowerShell :
   # .\backend\env\Scripts\Activate.ps1
   ```

3. **Installer les dépendances** :

   ```bash
   pip install -r backend/requirements.txt
   ```

4. **Initialiser la base de données** (SQLite) :

   ```bash
   cd backend
   python -m app.db.init_db
   ```

   Cette commande crée le fichier `omt.db`, les tables nécessaires et insère
   quelques utilisateurs/événements de démonstration.  Le démarrage du serveur
   exécute automatiquement cette étape si elle n'a pas déjà été faite.

---

## Lancer le serveur

Depuis le dossier `backend` :

```bash
# utilisez l'exécutable du venv si vous en avez un
backend/env/bin/python -m uvicorn app.main:app --reload --port 8000
```

- L'API sera disponible à : `http://localhost:8000`.
- La documentation interactive FastAPI : `http://localhost:8000/docs`.
- Le frontend statique est servi automatiquement à la racine du même port.

Si vous préférez servir le frontend séparément :

```bash
cd frontend
python3 -m http.server 8001
# puis ouvrez http://localhost:8001
```

---

## Tests manuels

Trois scripts Python de vérification sont fournis dans `backend/` :

- `test_admin_modifs.py` : tests des opérations admin (mot de passe visible,
  blocage de rétrogradation d'un organisateur avec événements, etc.).
- `test_separation.py` : s'assure qu'un organisateur ne peut pas supprimer un
  événement appartenant à un autre.
- `test_verifier_assignment.py` : couvre l'affectation/désaffectation de
  vérificateurs et la route `/events/assigned/me`.

Exécutez-les avec :

```bash
cd backend
backend/env/bin/python test_admin_modifs.py
backend/env/bin/python test_separation.py
backend/env/bin/python test_verifier_assignment.py
```

Tous les tests doivent afficher des **✅** avec zéro erreur.

---

## Structure du projet

- `backend/` : code Python FastAPI
  - `app/` : application principale
  - `requirements.txt` : dépendances Python
  - `test_*.py` : scripts de sanity-check
- `frontend/` : fichiers statiques (HTML, JS, CSS)

---

## Configuration

Les paramètres modifiables se trouvent dans `backend/app/core/config.py` :

- `DATABASE_URL` (par défaut `sqlite+aiosqlite:///./omt.db`)
- `SECRET_KEY`, durées des tokens etc.

Vous pouvez créer un fichier `.env` dans `backend/` pour surcharger les
variables d'environnement.

---

## Contribution

1. Ajouter une issue pour un bug ou une fonctionnalité.
2. Créer une branche `feat/...` ou `fix/...` et travailler dessus.
3. Ouvrir une pull request, décrire les changements et les étapes de test.

---

## Licence

Projet typiquement publié sous licence MIT ; ajoutez un fichier `LICENSE` si
vous voulez formaliser cela.


---

*Ce README remplace toute procédure antérieure et décrit comment démarrer la
plateforme à partir d'une installation fraîche.*
