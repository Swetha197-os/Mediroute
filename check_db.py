import sqlite3
import os

db_path = "mediroute.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"Tables: {tables}")
        
        cursor.execute("SELECT COUNT(*) FROM hospitals")
        count = cursor.fetchone()[0]
        print(f"Hospital count: {count}")
        
        cursor.execute("SELECT * FROM hospitals LIMIT 5")
        rows = cursor.fetchall()
        for row in rows:
            print(row)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
else:
    print("Database not found")
