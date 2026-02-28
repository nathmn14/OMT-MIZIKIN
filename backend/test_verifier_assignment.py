"""
Test : Affectation des vérificateurs aux événements
Ce script teste les nouvelles fonctionnalités avec une vraie requête HTTP.
"""
import requests
import json
import sys

BASE = "http://127.0.0.1:8000/api"
ERRORS = []

def log(msg, ok=True):
    mark = "✅" if ok else "❌"
    print(f"  {mark} {msg}")
    if not ok:
        ERRORS.append(msg)

def post(path, data, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = requests.post(f"{BASE}{path}", json=data, headers=headers)
    return r

def get(path, token=None, params=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = requests.get(f"{BASE}{path}", headers=headers, params=params)
    return r

def delete(path, token=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = requests.delete(f"{BASE}{path}", headers=headers)
    return r

def login(email, password):
    r = post("/auth/login", {"email": email, "password": password})
    if r.status_code == 200:
        return r.json().get("access_token")
    return None

print("\n=== TEST AFFECTATION VÉRIFICATEURS ===\n")

# 1. Test basique : les events se chargent sans erreur
print("[1] Chargement de la liste des événements (test 500 fix)...")
r = get("/events")
log(f"GET /events → {r.status_code}", r.status_code == 200)
if r.status_code != 200:
    print(f"      Erreur: {r.text[:200]}")

# 2. Connexion admin
print("\n[2] Connexion admin...")
admin_token = login("admin@omt.com", "admin123")
if not admin_token:
    print("  ⚠️  Impossible to obtain admin token, make sure admin user exists and is approved.")

log(f"Token admin obtenu", bool(admin_token))
if not admin_token:
    print("  STOP: Impossible de se connecter en admin. Créez un compte admin manuellement.")
    print(f"  Erreurs: {ERRORS}")
    sys.exit(1)

# 3. Lister les utilisateurs — trouver un vérificateur
print("\n[3] Recherche d'un vérificateur...")
r = get("/admin/users", token=admin_token)
log(f"GET /admin/users → {r.status_code}", r.status_code == 200)
verif = None
if r.status_code == 200:
    users = r.json()
    verifs = [u for u in users if u.get("role") == "verificateur" and u.get("is_approved")]
    if verifs:
        verif = verifs[0]
        log(f"Vérificateur trouvé: {verif['nom']} (id={verif['id']})")
    else:
        log("Aucun vérificateur approuvé trouvé", False)

# 4. Lister les événements, trouver un event
print("\n[4] Recherche d'un événement...")
r = get("/events")
event = None
if r.status_code == 200 and r.json():
    event = r.json()[0]
    log(f"Événement trouvé: {event['title']} (id={event['id']})")
else:
    log("Aucun événement trouvé", False)

# 5. Tests d'affectation si on a un vérif et un event
if verif and event:
    eid = event["id"]
    uid = verif["id"]

    print(f"\n[5] Affectation du vérificateur {uid} à l'événement {eid}...")
    r = post(f"/events/{eid}/verifiers/{uid}", {}, token=admin_token)
    log(f"POST /events/{eid}/verifiers/{uid} → {r.status_code}", r.status_code == 200)
    if r.status_code != 200:
        print(f"      Détail: {r.text}")

    print(f"\n[6] Vérification : liste des vérificateurs de l'événement {eid}...")
    r = get(f"/events/{eid}/verifiers", token=admin_token)
    log(f"GET /events/{eid}/verifiers → {r.status_code}", r.status_code == 200)
    if r.status_code == 200:
        v_list = r.json()
        found = any(v["id"] == uid for v in v_list)
        log(f"Vérificateur présent dans la liste: {found}", found)

    print(f"\n[7] Test GET /users/verifiers (liste tous les vérificateurs)...")
    r = get("/users/verifiers", token=admin_token)
    log(f"GET /users/verifiers → {r.status_code}", r.status_code == 200)

    print(f"\n[8] Connexion du vérificateur (test GET /events/assigned/me)...")
    # try using stored plain_password, fall back to known seeded password
    pw = verif.get("plain_password") or "verif123"
    verif_token = login(verif["email"], pw)
    if verif_token:
        r = get("/events/assigned/me", token=verif_token)
        log(f"GET /events/assigned/me → {r.status_code}", r.status_code == 200)
        if r.status_code == 200:
            assigned = r.json()
            found_event = any(e["id"] == eid for e in assigned)
            log(f"L'événement est visible par le vérificateur: {found_event}", found_event)
    else:
        log("Impossible de se connecter en tant que vérificateur", False)

    print(f"\n[9] Retrait du vérificateur de l'événement...")
    r = delete(f"/events/{eid}/verifiers/{uid}", token=admin_token)
    log(f"DELETE /events/{eid}/verifiers/{uid} → {r.status_code}", r.status_code == 200)

    # Vérifier qu'il n'y est plus
    r = get(f"/events/{eid}/verifiers", token=admin_token)
    if r.status_code == 200:
        v_list = r.json()
        gone = all(v["id"] != uid for v in v_list)
        log(f"Vérificateur retiré correctement: {gone}", gone)
else:
    print("\n  ⚠️  Skipping les tests d'affectation (pas de vérificateur ou d'événement disponible)")

# Résumé
print(f"\n=== RÉSULTAT ===")
if not ERRORS:
    print("  ✅ Tous les tests sont passés !")
else:
    print(f"  ❌ {len(ERRORS)} erreur(s):")
    for e in ERRORS:
        print(f"     - {e}")
