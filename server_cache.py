"""
cache.py — In-memory question → response cache with 24-hour TTL.
"""

from datetime import datetime, timedelta

_store: dict = {}
TTL_HOURS = 24


def get_cached(key: str):
    entry = _store.get(key)
    if not entry:
        return None
    if datetime.utcnow() > entry["expires"]:
        del _store[key]
        return None
    return entry["data"]


def set_cached(key: str, data: dict):
    _store[key] = {
        "data":    data,
        "expires": datetime.utcnow() + timedelta(hours=TTL_HOURS),
    }


def stats() -> dict:
    now   = datetime.utcnow()
    valid = sum(1 for e in _store.values() if now <= e["expires"])
    return {"total": len(_store), "valid": valid}


def clear():
    _store.clear()
