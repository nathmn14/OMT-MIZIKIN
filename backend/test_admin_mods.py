import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api"

def test_admin_mods():
    # Login as admin
    print("Logging in as admin...")
    admin_login = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@omt.com", "password": "admin123"}).json()
    admin_token = admin_login["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Check password hash visibility
    print("Checking if password_hash is visible in user list...")
    users = requests.get(f"{BASE_URL}/admin/users", headers=headers).json()
    if users and "password_hash" in users[0]:
        print("SUCCESS: password_hash is present in response.")
        print(f"Sample hash: {users[0]['password_hash'][:20]}...")
    else:
        print("FAILURE: password_hash NOT found in response.")
        return

    # 2. Setup: Create/Find an organizer with an ACTIVE event
    print("\nSetting up Organizer with Active Event...")
    # Register/Find organizer
    orga_email = "test_orga_active@test.com"
    orga = next((u for u in users if u["email"] == orga_email), None)
    
    if not orga:
        print(f"Registering {orga_email}...")
        requests.post(f"{BASE_URL}/auth/register", json={
            "nom": "Orga Active",
            "email": orga_email,
            "password": "pass",
            "phone": "0000",
            "role": "organisateur",
            "payment_method": "card",
            "payment_detail": "0000"
        })
        # Approve
        users = requests.get(f"{BASE_URL}/admin/users", headers=headers).json()
        orga = next((u for u in users if u["email"] == orga_email), None)
        requests.post(f"{BASE_URL}/admin/users/{orga['id']}/approve", headers=headers)
        orga_id = orga["id"]
        # Make sure role is organizer
        requests.patch(f"{BASE_URL}/admin/users/{orga_id}/role", json={"role": "organisateur"}, headers=headers)
    else:
        orga_id = orga["id"]
        # Ensure role is organizer
        if orga["role"] != "organisateur":
             requests.patch(f"{BASE_URL}/admin/users/{orga_id}/role", json={"role": "organisateur"}, headers=headers)

    # Login as this orga to create event
    print("Logging in as Orga Active...")
    orga_login = requests.post(f"{BASE_URL}/auth/login", json={"email": orga_email, "password": "pass"}).json()
    orga_token = orga_login["access_token"]
    
    # Create FUTURE event
    print("Creating future event...")
    future_date = "2030-01-01"
    event_payload = {
        "title": "Future Event",
        "description": "Desc",
        "date": future_date, 
        "time": "12:00",
        "location": "Loc",
        "image_url": "http://img.com",
        "categories": [{"name": "Std", "price": 10, "stock": 10}]
    }
    requests.post(f"{BASE_URL}/events", json=event_payload, headers={"Authorization": f"Bearer {orga_token}"})

    # 3. Try to change role of this organizer (Should Fail)
    print("Attempting to change role of Organizer with active event (should fail)...")
    res = requests.patch(f"{BASE_URL}/admin/users/{orga_id}/role", json={"role": "user"}, headers=headers)
    if res.status_code == 400 and "événements" in res.json()["detail"]:
        print("SUCCESS: Role change BLOCKED as expected.")
    else:
        print(f"FAILURE: Unexpected response: {res.status_code} {res.text}")

    # 4. Try to change role of a user WITHOUT active events
    print("\nTesting valid role change...")
    # Register dummy user
    dummy_email = "dummy_user_role@test.com"
    dummy = next((u for u in users if u["email"] == dummy_email), None)
    if not dummy:
         requests.post(f"{BASE_URL}/auth/register", json={
            "nom": "Dummy",
            "email": dummy_email,
            "password": "pass",
            "phone": "0000",
            "role": "user",
            "payment_method": "card",
            "payment_detail": "0000"
        })
         users = requests.get(f"{BASE_URL}/admin/users", headers=headers).json()
         dummy = next((u for u in users if u["email"] == dummy_email), None)
         requests.post(f"{BASE_URL}/admin/users/{dummy['id']}/approve", headers=headers)
    
    dummy_id = dummy["id"]
    print(f"Changing role of dummy user {dummy_id} to 'verificateur'...")
    res = requests.patch(f"{BASE_URL}/admin/users/{dummy_id}/role", json={"role": "verificateur"}, headers=headers)
    if res.status_code == 200 and res.json()["role"] == "verificateur":
        print("SUCCESS: Role change allowed.")
    else:
        print(f"FAILURE: {res.status_code} {res.text}")

if __name__ == "__main__":
    test_admin_mods()
