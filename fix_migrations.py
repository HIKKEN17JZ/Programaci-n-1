import psycopg
import os

# Use fallbacks from settings.py
DB_NAME = os.getenv('DB_NAME', 'programacion1_db')
DB_USER = os.getenv('DB_USER', 'postgres_django_user')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

try:
    conn = psycopg.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()
    
    print("Clearing django_migrations table...")
    cur.execute("DELETE FROM django_migrations;")
    
    conn.commit()
    cur.close()
    conn.close()
    print("Successfully cleared django_migrations.")
except Exception as e:
    print(f"Error: {e}")
