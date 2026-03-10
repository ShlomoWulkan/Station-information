import time
from typing import Any

_store: dict[str, tuple[Any, float]] = {}


def get(key: str, ttl: int) -> Any | None:
    """מחזיר ערך מה-cache אם עדיין בתוקף, אחרת None."""
    entry = _store.get(key)
    if entry is None:
        return None
    value, timestamp = entry
    if time.time() - timestamp > ttl:
        del _store[key]
        return None
    return value


def set(key: str, value: Any) -> None:
    """שומר ערך ב-cache עם חותמת זמן."""
    _store[key] = (value, time.time())


def clear() -> None:
    _store.clear()
