import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_separation():
    # 1. Register orga1
    orga1_email = "orga1@test.com"
    orga1_pass = "pass123"
    print(f"Registering {orga1_email}...")
    try:
        requests.post(f"{BASE_URL}/auth/register", json={
            "nom": "Orga 1",
            "email": orga1_email,
            "password": orga1_pass,
            "phone": "0102030405",
            "role": "organisateur",
            "payment_method": "mobile_money",
            "payment_detail": "0102030405"
        })
    except: pass # Might already exist

    # 2. Login as admin to approve orga1
    print("Logging in as admin...")
    admin_login = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@omt.com", "password": "admin123"}).json()
    admin_token = admin_login["access_token"]
    
    # Get all users to find orga1 id
    users = requests.get(f"{BASE_URL}/admin/users", headers={"Authorization": f"Bearer {admin_token}"}).json()
    orga1 = next((u for u in users if u["email"] == orga1_email), None)
    if orga1:
        print(f"Approving orga1 (ID: {orga1['id']})...")
        requests.post(f"{BASE_URL}/admin/users/{orga1['id']}/approve", headers={"Authorization": f"Bearer {admin_token}"})
        # promote to organisateur for event creation
        requests.patch(
            f"{BASE_URL}/admin/users/{orga1['id']}/role",
            json={"role": "organisateur"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    # 3. Login as orga1
    print("Logging in as orga1...")
    orga1_login = requests.post(f"{BASE_URL}/auth/login", json={"email": orga1_email, "password": orga1_pass}).json()
    orga1_token = orga1_login["access_token"]
    orga1_id = requests.get(f"{BASE_URL}/auth/me", headers={"Authorization": f"Bearer {orga1_token}"}).json()["id"]

    # 4. Orga 1 creates an event
    print("Orga 1 creating event...")
    event_payload = {
        "title": "Event Orga 1",
        "description": "Desc 1",
        "date": "2026-01-01",
        "time": "12:00",
        "location": "Loc 1",
        "image_url": "http://img1.com",
        "price_standard": 10,
        "price_vip": 20,
        "categories": [{"name": "Standard", "price": 10, "stock": 100}]
    }
    event1 = requests.post(f"{BASE_URL}/events", json=event_payload, headers={"Authorization": f"Bearer {orga1_token}"}).json()
    event1_id = event1["id"]
    print(f"Event 1 created with ID: {event1_id}")

    # 5. Register and approve orga2
    orga2_email = "orga2@test.com"
    orga2_pass = "pass123"
    print(f"Registering {orga2_email}...")
    requests.post(f"{BASE_URL}/auth/register", json={
        "nom": "Orga 2",
        "email": orga2_email,
        "password": orga2_pass,
        "phone": "0202020202",
        "role": "organisateur",
        "payment_method": "mobile_money",
        "payment_detail": "0202020202"
    })
    users = requests.get(f"{BASE_URL}/admin/users", headers={"Authorization": f"Bearer {admin_token}"}).json()
    orga2 = next((u for u in users if u["email"] == orga2_email), None)
    if orga2:
        print(f"Approving orga2 (ID: {orga2['id']})...")
        requests.post(f"{BASE_URL}/admin/users/{orga2['id']}/approve", headers={"Authorization": f"Bearer {admin_token}"})
        requests.patch(
            f"{BASE_URL}/admin/users/{orga2['id']}/role",
            json={"role": "organisateur"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    # 6. Login as orga2
    print("Logging in as orga2...")
    orga2_login = requests.post(f"{BASE_URL}/auth/login", json={"email": orga2_email, "password": orga2_pass}).json()
    orga2_token = orga2_login["access_token"]
    orga2_id = requests.get(f"{BASE_URL}/auth/me", headers={"Authorization": f"Bearer {orga2_token}"}).json()["id"]

    # 7. Orga 2 lists events
    print("Orga 2 listing their events...")
    events_orga2 = requests.get(f"{BASE_URL}/events?organizer_id={orga2_id}", headers={"Authorization": f"Bearer {orga2_token}"}).json()
    print(f"Orga 2 saw {len(events_orga2)} events.")
    
    # Check if event 1 is in orga 2 list (it shouldn't be if we filter by current user's ID on frontend)
    # But wait, the frontend PASSES the id. If it doesn't pass it, it sees everything.
    # On the dashboard, we now pass it.
    
    # Let's check if orga 2 can DELETE orga 1's event
    print(f"Orga 2 trying to delete Orga 1's event (ID: {event1_id})...")
    del_res = requests.delete(f"{BASE_URL}/events/{event1_id}", headers={"Authorization": f"Bearer {orga2_token}"})
    print(f"Delete result: {del_res.status_code} (Expected 403)")

    if del_res.status_code == 403:
        print("SUCCESS: Separation works!")
    else:
        print("FAILURE: Orga 2 could delete Orga 1's event!")

if __name__ == "__main__":
    test_separation()
