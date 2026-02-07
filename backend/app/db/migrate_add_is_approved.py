"""
Script de migration pour ajouter le champ is_approved à la table users
À exécuter une seule fois pour mettre à jour la base de données existante
"""
import asyncio
import sys
from pathlib import Path

# Ajouter le répertoire parent au path pour les imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.db.session import engine


async def migrate_add_is_approved():
    """Ajoute la colonne is_approved à la table users"""
    async with engine.begin() as conn:
        # Vérifier si la colonne existe déjà
        result = await conn.execute(text(
            "SELECT COUNT(*) FROM pragma_table_info('users') WHERE name='is_approved'"
        ))
        exists = result.scalar()
        
        if exists > 0:
            print("✓ La colonne 'is_approved' existe déjà")
            return
        
        print("Ajout de la colonne 'is_approved'...")
        
        # Ajouter la colonne is_approved (défaut False)
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT 0 NOT NULL"
        ))
        
        # Créer un index sur is_approved pour améliorer les performances
        await conn.execute(text(
            "CREATE INDEX IF NOT EXISTS ix_users_is_approved ON users (is_approved)"
        ))
        
        # Synchroniser is_approved avec status pour les données existantes
        # Les utilisateurs avec status='active' deviennent is_approved=True
        await conn.execute(text(
            "UPDATE users SET is_approved = 1 WHERE status = 'active'"
        ))
        
        print("✓ Migration terminée avec succès")
        print("  - Colonne 'is_approved' ajoutée")
        print("  - Index créé")
        print("  - Données existantes synchronisées")


async def main():
    try:
        await migrate_add_is_approved()
        print("\n✅ Migration réussie!")
    except Exception as e:
        print(f"\n❌ Erreur lors de la migration: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
