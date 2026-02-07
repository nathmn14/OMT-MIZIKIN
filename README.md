# OMT Events — Plateforme de gestion de billetterie

Un projet web pour la gestion d'événements et la vente/validation de billets.

**Objectif :**

- **Description :** Backend FastAPI pour les API et la logique applicative, accompagné de fichiers frontend statiques pour les interfaces publique, organisateur et administrateur.

**Fonctionnalités principales :**

- **Authentification :** Connexion / Inscription (token JWT).
- **Gestion d'événements :** Création et administration des événements.
- **Billetterie :** Catégories de billets, émission, scan/vérification.

**Technologies :**

- **Backend :** Python, FastAPI, SQLAlchemy.
- **Frontend :** HTML/CSS/JS (fichiers statiques à la racine du projet).

**Installation (locale, Windows)**

1. Cloner le dépôt : `git clone <repo-url>`
2. Créer un environnement virtuel dans le répertoire du projet (optionnel, mais recommandé) :

```powershell
python -m venv env
Activer l'environnement virtuel (PowerShell) :

PowerShell
.\env\Scripts\Activate.ps1
Installer les dépendances du backend :

PowerShell
pip install -r backend/requirements.txt
Exécution (développement)

Lancer le backend (depuis la racine du projet ou depuis le dossier backend) :

PowerShell
uvicorn app.main:app --reload --port 8000
Le backend sera accessible dans le navigateur à l'adresse : http://localhost:8000

Documentation automatique FastAPI : http://localhost:8000/docs

Pour le frontend, vous pouvez ouvrir index.html directement dans le navigateur ou servir les fichiers statiques avec un serveur simple :

PowerShell
python -m http.server 8001
# Ensuite, ouvrez http://localhost:8001 dans votre navigateur (si exécuté depuis le répertoire contenant index.html)
Structure du projet (résumé)

Fichier principal frontend : index.html

Répertoire backend : backend/

Configuration & Sécurité : backend/app/core/config.py, backend/app/core/security.py

Routes & Dépendances : backend/app/api/router.py, backend/app/api/deps.py

Modèles : backend/app/models/ (ex: event.py, ticket.py, user.py)

Schémas (Pydantic) : backend/app/schemas/

Services : backend/app/services/ (ex: ticketing.py)

Initialisation DB : backend/app/db/init_db.py

Configuration & Environnements

Vérifiez les paramètres dans backend/app/core/config.py pour les variables d'environnement (ex: connexion DB, clés secrètes).

Vous pouvez utiliser un fichier .env local pour les variables sensibles.

Développement & Contributions

Ouvrez un "Issue" pour signaler des bugs ou demander des fonctionnalités.

Créez des branches pour vos modifications (feature/, fix/), soumettez des Pull Requests (PR) et incluez une description ainsi que les étapes de test.

Licence

Recommandée : MIT. Ajoutez un fichier LICENSE si vous souhaitez une annonce officielle de licence.

Contact

Pour plus de détails, ajoutez ici vos informations de contact ou un lien vers votre profil GitHub.