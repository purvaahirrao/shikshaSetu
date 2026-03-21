#!/usr/bin/env python3
"""Verify database URL after schema load. Usage:
   python database/check_connection.py
   (reads DATABASE_URL, POSTGRES_URL, or DB_URL from environment or .env)
"""
import os
import sys

def main():
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass
    url = (
        os.environ.get("DATABASE_URL")
        or os.environ.get("POSTGRES_URL")
        or os.environ.get("DB_URL")
    )
    if not url:
        print(
            "Set DATABASE_URL, POSTGRES_URL, or DB_URL (e.g. in .env)",
            file=sys.stderr,
        )
        sys.exit(1)
    try:
        import psycopg
    except ImportError:
        print("Install: pip install 'psycopg[binary]'", file=sys.stderr)
        sys.exit(1)
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT COUNT(*) FROM information_schema.tables "
                "WHERE table_schema = 'public' AND table_name = 'users'"
            )
            ok = cur.fetchone()[0] == 1
            cur.execute("SELECT COUNT(*) FROM users")
            n = cur.fetchone()[0]
    print("OK: connected to PostgreSQL; users table exists; row count users =", n)
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
