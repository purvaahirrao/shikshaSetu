"""PostgreSQL connection helper. Set DATABASE_URL (e.g. postgresql://user:pass@localhost:5432/shikshasetu)."""

from __future__ import annotations

import os
from contextlib import contextmanager

import psycopg


def database_url() -> str | None:
    return (
        os.getenv("DATABASE_URL")
        or os.getenv("POSTGRES_URL")
        or os.getenv("DB_URL")
    )


@contextmanager
def get_connection():
    url = database_url()
    if not url:
        raise RuntimeError(
            "No database URL: set DATABASE_URL, POSTGRES_URL, or DB_URL (e.g. in .env)"
        )
    conn = psycopg.connect(url)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
