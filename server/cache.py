"""
Cache בזיכרון עם TTL, מוגן ל-threads וחסום בגודל.

היה dict גלובלי בלי מנעול. תחת gunicorn עם threads זה מפסיק להיות תיאורטי, וגם
`del` על מפתח שפג היה יכול להתפוצץ ב-KeyError כששני threads מפקיעים במקביל.

החסם בגודל הוא תיקון דליפה ולא ניקיון: מפתחות ה-cache של /nearby כוללים
קואורדינטות, ולכן לקוח שמזרים נקודות אקראיות הגדיל את ה-dict בלי גבול.
"""
import threading
import time
from collections import OrderedDict
from typing import Any, Optional

from config import CACHE_MAX_ENTRIES

_lock = threading.RLock()
_store: "OrderedDict[str, tuple[Any, float]]" = OrderedDict()


def get(key: str, ttl: int) -> Optional[Any]:
    """מחזיר ערך אם עדיין בתוקף, אחרת None."""
    with _lock:
        entry = _store.get(key)
        if entry is None:
            return None

        value, stored_at = entry
        # >= ולא >, כדי ש-ttl=0 יפקיע מיד ולא יחזיר ערך שנשמר באותו tick.
        if time.time() - stored_at >= ttl:
            _store.pop(key, None)
            return None

        # שימוש מרענן את המקום בתור, כדי ש-eviction יפגע בישן באמת.
        _store.move_to_end(key)
        return value


def put(key: str, value: Any) -> None:
    """שומר ערך עם חותמת זמן, ומפנה את הישן ביותר כשהחסם נחרג."""
    with _lock:
        _store[key] = (value, time.time())
        _store.move_to_end(key)
        while len(_store) > CACHE_MAX_ENTRIES:
            _store.popitem(last=False)


def clear() -> None:
    with _lock:
        _store.clear()


def size() -> int:
    with _lock:
        return len(_store)
