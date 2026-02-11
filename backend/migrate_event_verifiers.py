import sqlite3
import os

db_path = "./omt.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS event_verifiers (
                event_id INTEGER NOT NULL,
                verifier_id INTEGER NOT NULL,
                PRIMARY KEY (event_id, verifier_id),
                FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
                FOREIGN KEY (verifier_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)
        print("Table event_verifiers created successfully.")
    except sqlite3.OperationalError as e:
        print(f"Error: {e}")
    conn.commit()
    conn.close()
else:
    print("Database file not found.")
