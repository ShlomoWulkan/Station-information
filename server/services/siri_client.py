"""
HTTP client לממשק SIRI של משרד התחבורה.
GET /2.8/xml?Key=<API_KEY>&MonitoringRef=<stop_code>

משרד התחבורה מאשר קריאות מ-IP של ה-VPS בלבד — ראה docs/SECRETS.md.
"""
import logging

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from config import API_KEY, SIRI_BASE_URL, SIRI_TIMEOUT

log = logging.getLogger(__name__)

# Session אחת לכל התהליך: מחזיקה את החיבור פתוח בין בקשות, ומוסיפה ריטריים
# על כשלים חולפים. קודם כל קריאה פתחה חיבור TLS חדש ונכשלה מיד על 502.
_RETRY = Retry(
    total=3,
    backoff_factor=0.5,
    status_forcelist=(429, 500, 502, 503, 504),
    allowed_methods=frozenset(["GET"]),
)

_session = requests.Session()
_session.mount("https://", HTTPAdapter(max_retries=_RETRY))
_session.mount("http://", HTTPAdapter(max_retries=_RETRY))


def fetch_arrivals(station_code: str) -> str:
    """מחזיר XML של זמני הגעה לתחנה. זורק requests.HTTPError על סטטוס שגיאה."""
    # אימות TLS פעיל בכוונה. הקריאה הזאת נושאת את API_KEY, ולכן כיבוי האימות
    # אפשר לכל מי שיכול להתייצב בדרך להתחזות למשרד התחבורה ולקצור את המפתח.
    # אם התעודה בעייתית — לצרף CA ספציפי ב-config.SIRI_CA_BUNDLE, לא לכבות.
    response = _session.get(
        f"{SIRI_BASE_URL}/xml",
        params={"Key": API_KEY, "MonitoringRef": station_code},
        timeout=SIRI_TIMEOUT,
    )
    log.debug("SIRI %s → %s", station_code, response.status_code)
    response.raise_for_status()
    return response.text
