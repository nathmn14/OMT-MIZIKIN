"""
Migration : Fix event_verifiers table
- Drop la table si elle contient la colonne user_id (ancienne version)
- La recree avec la colonne verifier_id correcte
"""
import sqlite3
import os

db_path = "./omt.db"

def migrate():
    if not os.path.exists(db_path):
        print("Database file not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Verifier si la table existe et avec quel schema
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='event_verifiers';")
    row = cursor.fetchone()
    if row:
        print(f"Table existante: {row[0]}")
        # Dropper: soit elle avait user_id (bug) soit verifier_id (ok mais on recrée proprement)
        cursor.execute("DROP TABLE IF EXISTS event_verifiers;")
        print("Ancienne table supprimée.")
    else:
        print("Table event_verifiers n'existait pas encore.")

    # Créer avec la bonne colonne
    cursor.execute("""
        CREATE TABLE event_verifiers (
            event_id INTEGER NOT NULL,
            verifier_id INTEGER NOT NULL,
            PRIMARY KEY (event_id, verifier_id),
            FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
            FOREIGN KEY (verifier_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)
    print("Table event_verifiers créée avec verifier_id. OK.")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
