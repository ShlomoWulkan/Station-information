"""
מצב הקישוריות למשרד התחבורה, לתצוגה ב-/health.

הכשל של /arrivals יכול היה לחיות בשקט כי /health דיווח רק על GTFS ולא אמר
כלום על השירות שהוא הפיצ'ר המרכזי. נבדק פעם אחת בעלייה ונשמר — לא בכל
בדיקת חיות, אחרת בודק חיצוני היה מציף את משרד התחבורה.
"""
import logging
import threading
from typing import Optional

from config import API_KEY, api_key_is_real
from services.siri_client import fetch_arrivals

log = logging.getLogger(__name__)

# תחנה מרכזית בתל אביב, לבדיקה בלבד.
PROBE_STATION = "21472"

_reachable: Optional[bool] = None
_reason: Optional[str] = None


def _redact(text: str) -> str:
    """
    מסיר את מפתח ה-API מטקסט.

    חובה: str() של חריגת requests מכיל את ה-URL המלא, ובו ?Key=<המפתח>,
    וההודעה הזאת נחשפת ב-/health.
    """
    return text.replace(API_KEY, "<redacted>") if API_KEY else text


def status() -> dict:
    """None פירושו שהבדיקה עוד לא רצה או שהיא כבויה."""
    return {"reachable": _reachable, "reason": _reason}


def check() -> bool:
    """בודק פעם אחת ושומר את התוצאה."""
    global _reachable, _reason

    # נבדק לפני היציאה לרשת: בלי מפתח אמיתי הקריאה תיכשל בכל מקרה, והשגיאה
    # שתחזור לא תרמוז שהסיבה היא ש-.env מעולם לא מולא.
    if not api_key_is_real():
        _reachable = False
        _reason = "API_KEY אינו מוגדר — המציין מ-.env.example עדיין במקומו"
        log.error("API_KEY לא הוזן ב-.env. /arrivals לא יעבוד. ראה .env.example")
        return False

    try:
        fetch_arrivals(PROBE_STATION)
        _reachable, _reason = True, None
        log.info("הקשר למשרד התחבורה תקין")
    except Exception as e:
        _reachable = False
        # שומרים את הזנב ולא את הראש: requests עוטף את השגיאה האמיתית בתוך
        # HTTPSConnectionPool(...) ארוך, והסיבה בפועל — למשל
        # SSLCertVerificationError — יושבת בסוף.
        message = _redact(f"{type(e).__name__}: {e}")
        _reason = message if len(message) <= 300 else "..." + message[-300:]
        log.error("הקשר למשרד התחבורה נכשל — /arrivals יחזיר 502. %s", _reason)

    return _reachable


def check_in_background() -> None:
    """
    לא חוסם את העלייה — הבדיקה כוללת ריטריים ויכולה לקחת כמה שניות, ואין
    סיבה לעכב בגללה את שאר הנתיבים שאינם תלויים בה.
    """
    threading.Thread(target=check, name="siri-probe", daemon=True).start()
