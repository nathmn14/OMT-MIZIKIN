import sqlite3
import os

db_path = "./omt.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN plain_password TEXT")
        print("Column plain_password added successfully.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column plain_password already exists.")
        else:
            print(f"Error: {e}")
    conn.commit()
    conn.close()
else:
    print("Database file not found.")
