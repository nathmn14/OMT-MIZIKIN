import requests
import json
from datetime import date, timedelta

BASE_URL = "http://127.0.0.1:8000/api"

def test_admin_modifs():
    print("--- TEST ADMIN MODIFS ---")
    
    # 1. Login as admin
    print("Logging in as admin...")
    admin_login = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@omt.com", "password": "admin123"}).json()
    admin_token = admin_login["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Register a new user
    print("Registering a new user...")
    test_email = "test_pw@test.com"
    test_pass = "secret123"
    requests.post(f"{BASE_URL}/auth/register", json={
        "nom": "Test Password",
        "email": test_email,
        "password": test_pass,
        "phone": "0000000000",
        "role": "participant",
        "payment_method": "mobile_money",
        "payment_detail": "000000"
    })

    # 3. Check if password shows up in admin list
    print("Checking if password shows up in admin list...")
    users = requests.get(f"{BASE_URL}/admin/users", headers=headers).json()
    test_user = next((u for u in users if u["email"] == test_email), None)
    if test_user and test_user.get("plain_password") == test_pass:
        print(f"SUCCESS: Password visible for admin: {test_user['plain_password']}")
    else:
        print(f"FAILURE: Password NOT visible or incorrect. User: {test_user}")

    # 4. Test role modification blocking for organizers with events
    print("Testing role modification blocking...")
    # Create an organizer
    orga_email = "test_orga_events@test.com"
    orga_pass = "pass123"
    requests.post(f"{BASE_URL}/auth/register", json={
        "nom": "Orga with Events",
        "email": orga_email,
        "password": orga_pass,
        "phone": "1111111111",
        "role": "organisateur",
        "payment_method": "mobile_money",
        "payment_detail": "111111"
    })
    
    # Approve orga
    users = requests.get(f"{BASE_URL}/admin/users", headers=headers).json()
    orga_user = next((u for u in users if u["email"] == orga_email), None)
    requests.post(f"{BASE_URL}/admin/users/{orga_user['id']}/approve", headers=headers)

    # promote the user to organisateur so they can create events
    requests.patch(
        f"{BASE_URL}/admin/users/{orga_user['id']}/role",
        json={"role": "organisateur"},
        headers=headers
    )

    # Login as orga and create an event
    orga_login = requests.post(f"{BASE_URL}/auth/login", json={"email": orga_email, "password": orga_pass}).json()
    orga_token = orga_login["access_token"]
    orga_headers = {"Authorization": f"Bearer {orga_token}"}
    
    future_date = (date.today() + timedelta(days=5)).isoformat()
    print(f"Creating an event for {future_date}...")
    requests.post(f"{BASE_URL}/events", json={
        "title": "Future Event",
        "description": "Desc",
        "date": future_date,
        "time": "12:00",
        "location": "Loc",
        "image_url": "http://img.com",
        "price_standard": 10,
        "price_vip": 20,
        "categories": [{"name": "Standard", "price": 10, "stock": 100}]
    }, headers=orga_headers)

    # Now try to change orga role as admin (should be blocked because event exists)
    print("Trying to change orga role to participant...")
    res = requests.patch(
        f"{BASE_URL}/admin/users/{orga_user['id']}/role",
        json={"role": "participant"},
        headers=headers
    )
    if res.status_code == 400:
        print(f"SUCCESS: Role change blocked. Error: {res.json()['detail']}")
    else:
        print(f"FAILURE: Role change NOT blocked! Status: {res.status_code}")

if __name__ == "__main__":
    test_admin_modifs()
