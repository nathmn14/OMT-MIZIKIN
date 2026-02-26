import sqlite3
import os

def migrate():
    db_path = "backend/omt.db"
    if not os.path.exists(db_path):
        db_path = "omt.db"
    
    if not os.path.exists(db_path):
        print(f"Error: Database file {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # 1. Update events table
        cursor.execute("PRAGMA table_info(events)")
        event_columns = [column[1] for column in cursor.fetchall()]
        if "currency" not in event_columns:
            print("Adding 'currency' to 'events'...")
            cursor.execute("ALTER TABLE events ADD COLUMN currency VARCHAR(10) DEFAULT '$'")

        # 2. Update ticket_categories table
        cursor.execute("PRAGMA table_info(ticket_categories)")
        cat_columns = [column[1] for column in cursor.fetchall()]
        if "currency" not in cat_columns:
            print("Adding 'currency' to 'ticket_categories'...")
            cursor.execute("ALTER TABLE ticket_categories ADD COLUMN currency VARCHAR(10) DEFAULT '$'")

        # 3. Update tickets table
        cursor.execute("PRAGMA table_info(tickets)")
        ticket_columns = [column[1] for column in cursor.fetchall()]
        if "payment_currency" not in ticket_columns:
            print("Adding 'payment_currency' to 'tickets'...")
            cursor.execute("ALTER TABLE tickets ADD COLUMN payment_currency VARCHAR(10) DEFAULT '$'")
        if "price_paid" not in ticket_columns:
            print("Adding 'price_paid' to 'tickets'...")
            cursor.execute("ALTER TABLE tickets ADD COLUMN price_paid INTEGER")
            # Update price_paid with existing price for consistency
            cursor.execute("UPDATE tickets SET price_paid = price WHERE price_paid IS NULL")

        conn.commit()
        print("Migration V2 successful.")

    except Exception as e:
        print(f"Migration V2 failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
