"""הגדרות מרוכזות. נקראות ממשתני סביבה, עם ברירות מחדל לפיתוח."""
import os

from dotenv import load_dotenv

load_dotenv()


def _int_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return default


# ── שירותים חיצוניים ────────────────────────────────────────────────────────

SIRI_BASE_URL = os.getenv(
    "SIRI_BASE_URL", "https://moran.mot.gov.il/Channels/HTTPChannel/SmQuery/2.8"
)
ALERTS_URL = os.getenv("ALERTS_URL", "https://gtfs.mot.gov.il/ServiceAlerts/gtfs_rt_alerts.pb")
GTFS_ZIP_URL = os.getenv(
    "GTFS_ZIP_URL", "https://gtfs.mot.gov.il/gtfsfiles/israel-public-transportation.zip"
)
API_KEY = os.getenv("API_KEY", "")

# מציינים שנשארים ב-.env אחרי העתקה מ-.env.example. חשוב לזהות אותם בנפרד
# מ"ריק": מחרוזת כזאת עוברת bool() בהצלחה, ולכן בדיקה תמימה מדווחת שהמפתח
# מוגדר בזמן שהוא בכלל לא הוזן. זה בדיוק מה שקרה כאן.
_PLACEHOLDERS = frozenset(
    {"YOUR_API_KEY_HERE", "YOUR_KEY_HERE", "CHANGE_ME", "CHANGEME", "TODO", ""}
)


def api_key_is_real() -> bool:
    return API_KEY.strip().upper() not in _PLACEHOLDERS

# נתיב לשרשרת CA ספציפית, אם התעודה של mot.gov.il בעייתית. ריק = מאגר ה-CA
# של המערכת. זו החלופה לכיבוי אימות TLS, שהיה כאן וחשף את מפתח ה-API.
SIRI_CA_BUNDLE = os.getenv("SIRI_CA_BUNDLE", "")

# ── הרצה ────────────────────────────────────────────────────────────────────

PORT = _int_env("PORT", 5000)
# 127.0.0.1 בברירת מחדל: בייצור Caddy הוא זה שמאזין לחוץ, והשרת נשאר מקומי.
HOST = os.getenv("HOST", "127.0.0.1")
DEBUG = os.getenv("FLASK_DEBUG", "").lower() in ("1", "true", "yes")

# ── timeouts ────────────────────────────────────────────────────────────────

SIRI_TIMEOUT = _int_env("SIRI_TIMEOUT", 10)
ALERTS_TIMEOUT = _int_env("ALERTS_TIMEOUT", 15)
GTFS_TIMEOUT = _int_env("GTFS_TIMEOUT", 120)

# ── cache (שניות) ───────────────────────────────────────────────────────────

CACHE_TTL_ARRIVALS = 10
CACHE_TTL_ALERTS = 300
CACHE_TTL_NEARBY = 300
CACHE_MAX_ENTRIES = 2000

# ── תקרות על קלט ────────────────────────────────────────────────────────────
# בלי אלה, לקוח יכול לבקש רדיוס עצום ולהכריח סריקה על כל התחנות.

MAX_NEARBY_RADIUS_M = 2000
DEFAULT_NEARBY_RADIUS_M = 250
MAX_STOPS_LIMIT = 500
DEFAULT_STOPS_LIMIT = 300
MAX_BBOX_DEGREES = 1.0
