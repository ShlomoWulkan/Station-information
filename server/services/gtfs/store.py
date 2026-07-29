"""
מחזיק את אינדקס ה-GTFS ומנהל את טעינתו.

שני אינדקסים כי הם נטענים בקצב שונה: התחנות נחוצות מיד, והמסלולים דורשים
פיענוח של קובץ עם מיליוני שורות ולכן נטענים ברקע.

כל אינדקס מפורסם בהשמה אטומית אחת. `_routes` נקרא מ-threads של בקשות בזמן
שה-thread ברקע בונה אותו, והשמה למשתנה מודול היא אטומית ב-CPython, כך שקורא
רואה או את הישן או את החדש — ולא הרכבה חלקית של שישה מיפויים.
"""
import logging
import threading

from .loader import build_stops_index, download_zip
from .models import RoutesIndex, StopsIndex
from .routes_loader import build_routes_index

log = logging.getLogger(__name__)

_stops = StopsIndex()
_routes = RoutesIndex()


def stops() -> StopsIndex:
    return _stops


def routes() -> RoutesIndex:
    return _routes


def load(background_routes: bool = True) -> None:
    """מוריד GTFS, טוען תחנות, ומתחיל את טעינת הקווים ברקע."""
    global _stops

    zip_bytes = download_zip()
    _stops = build_stops_index(zip_bytes)

    if background_routes:
        thread = threading.Thread(
            target=_load_routes, args=(zip_bytes,), name="gtfs-routes", daemon=True
        )
        thread.start()
    else:
        _load_routes(zip_bytes)


def _load_routes(zip_bytes: bytes) -> None:
    global _routes
    try:
        log.info("טוען קווים ברקע")
        _routes = build_routes_index(zip_bytes)
        log.info("אינדקס הקווים מוכן")
    except Exception:
        # הכשל הזה השאיר את routes_ready על False לנצח, וכל /routes החזיר 503
        # בלי שום עקבות. exception() כותב גם את ה-traceback.
        log.exception("טעינת הקווים נכשלה — /routes ו-/route-stops יחזירו 503")
    finally:
        # ה-ZIP הוא מעל 100MB, ונחוץ רק כאן. קודם הוא נשמר בגלובל לנצח.
        del zip_bytes
