import sqlite3
import os

db_path = "./omt.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE events ADD COLUMN organizer_id INTEGER")
        print("Column organizer_id added successfully.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column organizer_id already exists.")
        else:
            print(f"Error: {e}")
    conn.commit()
    conn.close()
else:
    print("Database file not found.")
