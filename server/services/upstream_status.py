"""
מצב הקישוריות למשרד התחבורה, לתצוגה ב-/health.

הכשל של /arrivals יכול היה לחיות בשקט כי /health דיווח רק על GTFS ולא אמר
כלום על השירות שהוא הפיצ'ר המרכזי. נבדק פעם אחת בעלייה ונשמר — לא בכל
בדיקת חיות, אחרת בודק חיצוני היה מציף את משרד התחבורה.
"""
import logging
import threading
from typing import Optional

from services.probe import redact
from services.siri_client import fetch_arrivals

log = logging.getLogger(__name__)

# תחנה מרכזית בתל אביב, לבדיקה בלבד.
PROBE_STATION = "21472"

_reachable: Optional[bool] = None
_reason: Optional[str] = None


def status() -> dict:
    """None פירושו שהבדיקה עוד לא רצה או שהיא כבויה."""
    return {"reachable": _reachable, "reason": _reason}


def check() -> bool:
    """בודק פעם אחת ושומר את התוצאה."""
    global _reachable, _reason
    try:
        fetch_arrivals(PROBE_STATION)
        _reachable, _reason = True, None
        log.info("הקשר למשרד התחבורה תקין")
    except Exception as e:
        _reachable = False
        # ההודעה נחשפת ב-/health, ולכן עוברת דרך redact.
        _reason = redact(f"{type(e).__name__}: {e}")[:200]
        log.error("הקשר למשרד התחבורה נכשל — /arrivals יחזיר 502. %s", _reason)

    return _reachable


def check_in_background() -> None:
    """
    לא חוסם את העלייה — הבדיקה כוללת ריטריים ויכולה לקחת כמה שניות, ואין
    סיבה לעכב בגללה את שאר הנתיבים שאינם תלויים בה.
    """
    threading.Thread(target=check, name="siri-probe", daemon=True).start()
