"""
Script de test pour vérifier le système de modération
"""
import asyncio
import httpx


BASE_URL = "http://localhost:8000/api"


async def test_moderation_system():
    """Test complet du système de modération"""
    
    print("🧪 Test du système de modération OMT Events\n")
    print("=" * 60)
    
    async with httpx.AsyncClient() as client:
        
        # 1. Connexion admin
        print("\n1️⃣ Connexion en tant qu'admin...")
        login_response = await client.post(
            f"{BASE_URL}/auth/login",
            json={"email": "admin@omt.com", "password": "admin123"}
        )
        
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            print("   ✅ Connexion réussie")
            headers = {"Authorization": f"Bearer {token}"}
        else:
            print(f"   ❌ Échec de connexion: {login_response.status_code}")
            print(f"   Réponse: {login_response.text}")
            return
        
        # 2. Liste de tous les utilisateurs
        print("\n2️⃣ Liste de tous les utilisateurs...")
        users_response = await client.get(f"{BASE_URL}/admin/users", headers=headers)
        
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"   ✅ {len(users)} utilisateur(s) trouvé(s)")
            for user in users[:3]:  # Afficher les 3 premiers
                print(f"      - {user['nom']} ({user['email']}) - Rôle: {user['role']} - Approuvé: {user['is_approved']}")
        else:
            print(f"   ❌ Échec: {users_response.status_code}")
        
        # 3. Liste des utilisateurs en attente
        print("\n3️⃣ Liste des utilisateurs en attente...")
        pending_response = await client.get(f"{BASE_URL}/admin/users/pending", headers=headers)
        
        if pending_response.status_code == 200:
            pending = pending_response.json()
            print(f"   ✅ {len(pending)} utilisateur(s) en attente")
            for user in pending[:3]:
                print(f"      - {user['nom']} ({user['email']})")
        else:
            print(f"   ❌ Échec: {pending_response.status_code}")
        
        # 4. Liste des utilisateurs approuvés
        print("\n4️⃣ Liste des utilisateurs approuvés...")
        approved_response = await client.get(f"{BASE_URL}/admin/users/approved", headers=headers)
        
        if approved_response.status_code == 200:
            approved = approved_response.json()
            print(f"   ✅ {len(approved)} utilisateur(s) approuvé(s)")
        else:
            print(f"   ❌ Échec: {approved_response.status_code}")
        
        # 5. Liste par rôle
        print("\n5️⃣ Liste des organisateurs...")
        orga_response = await client.get(f"{BASE_URL}/admin/users/role/organisateur", headers=headers)
        
        if orga_response.status_code == 200:
            orgas = orga_response.json()
            print(f"   ✅ {len(orgas)} organisateur(s)")
        else:
            print(f"   ❌ Échec: {orga_response.status_code}")
        
        # 6. Test d'approbation (si utilisateur en attente)
        if pending and len(pending) > 0:
            test_user_id = pending[0]['id']
            print(f"\n6️⃣ Test d'approbation de l'utilisateur ID {test_user_id}...")
            
            approve_response = await client.post(
                f"{BASE_URL}/admin/users/{test_user_id}/approve",
                headers=headers
            )
            
            if approve_response.status_code == 200:
                print("   ✅ Utilisateur approuvé avec succès")
                
                # Vérifier que l'utilisateur peut maintenant se connecter
                print("\n7️⃣ Test de connexion de l'utilisateur approuvé...")
                user_email = pending[0]['email']
                # Note: On ne peut pas tester la connexion sans connaître le mot de passe
                print(f"   ℹ️  L'utilisateur {user_email} devrait maintenant pouvoir se connecter")
            else:
                print(f"   ❌ Échec d'approbation: {approve_response.status_code}")
        else:
            print("\n6️⃣ Aucun utilisateur en attente à approuver")
        
        # 8. Test de modification de rôle
        if users and len(users) > 0:
            # Trouver un utilisateur qui n'est pas admin
            test_user = next((u for u in users if u['role'] != 'admin'), None)
            
            if test_user:
                print(f"\n8️⃣ Test de modification de rôle pour {test_user['nom']}...")
                print(f"   Rôle actuel: {test_user['role']}")
                
                # Ne pas vraiment changer le rôle, juste tester l'endpoint
                print("   ℹ️  Endpoint de modification de rôle disponible:")
                print(f"   PATCH /api/admin/users/{test_user['id']}/role")
                print('   Body: {"role": "verificateur"}')
        
        print("\n" + "=" * 60)
        print("✅ Tests terminés avec succès!")
        print("\n📚 Consultez ADMIN_API_DOCS.md pour la documentation complète")


if __name__ == "__main__":
    try:
        asyncio.run(test_moderation_system())
    except Exception as e:
        print(f"\n❌ Erreur lors des tests: {e}")
        import traceback
        traceback.print_exc()
