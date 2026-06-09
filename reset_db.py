import psycopg
from psycopg import sql
import os

# Use fallbacks from settings.py
DB_NAME = os.getenv('DB_NAME', 'programacion1_db')
DB_USER = os.getenv('DB_USER', 'postgres_django_user')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

try:
    # Connect to the 'postgres' database to perform schema operations on 'programacion1_db'
    # Or connect to the target DB and drop schema.
    conn = psycopg.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()
    
    print("Dropping and recreating public schema to reset database...")
    cur.execute("DROP SCHEMA public CASCADE;")
    cur.execute("CREATE SCHEMA public;")
    cur.execute("GRANT ALL ON SCHEMA public TO public;")
    cur.execute(sql.SQL("GRANT ALL ON SCHEMA public TO {}").format(sql.Identifier(DB_USER)))
    
    conn.commit()
    cur.close()
    conn.close()
    print("Successfully reset the database.")
except Exception as e:
    print(f"Error: {e}")
