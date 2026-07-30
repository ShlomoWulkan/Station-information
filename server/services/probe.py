"""
בדיקות קישוריות לשירותים החיצוניים, לאבחון.

קיים כי הכשל של /arrivals אינו ניתן לאבחון מבחוץ: ההודעה ללקוח גנרית בכוונה,
והשגיאה האמיתית מכילה את ה-URL ובו המפתח. הבדיקה כאן רצה בצד השרת — כלומר
מה-IP שמשרד התחבורה מאשר — ומחזירה את הסיבה בלי הסוד.
"""
import socket
import ssl
import time
from typing import Any, Optional
from urllib.parse import urlparse

import requests

from config import ALERTS_TIMEOUT, ALERTS_URL, API_KEY, SIRI_BASE_URL, SIRI_TIMEOUT

REDACTED = "<redacted>"


def redact(text: str) -> str:
    """
    מסיר את מפתח ה-API מטקסט.

    חובה: str() של חריגת requests מכיל את ה-URL המלא, ובו ?Key=<המפתח>.
    בלי זה כלי האבחון עצמו היה מדליף את מה שבאנו להגן עליו.
    """
    if API_KEY and API_KEY in text:
        text = text.replace(API_KEY, REDACTED)
    return text


def _attempt(url: str, params: dict, timeout: int, verify: Any) -> dict:
    """
    ניסיון בודד, בלי ריטריים — רוצים תשובה מהירה ואת השגיאה הראשונה כמו שהיא.
    """
    started = time.monotonic()
    try:
        response = requests.get(url, params=params, timeout=timeout, verify=verify)
        return {
            "outcome": "http",
            "status": response.status_code,
            "bytes": len(response.content),
            "bodyHead": redact(response.text[:300].replace("\n", " ")),
            "seconds": round(time.monotonic() - started, 2),
        }
    except Exception as e:
        return {
            "outcome": "exception",
            "type": type(e).__name__,
            "message": redact(str(e))[:400],
            "seconds": round(time.monotonic() - started, 2),
        }


def probe_siri(station_code: str = "21472") -> dict:
    """
    מריץ את קריאת SIRI עם אימות TLS ובלעדיו.

    ההשוואה היא כל העניין: verify מדלג רק על אימות התעודה, שקורה אחרי שהשרת
    שלח אותה. אם שתיהן נכשלות באותה שגיאת חיבור, הבעיה אינה בתעודה.
    """
    url = f"{SIRI_BASE_URL}/xml"
    params = {"Key": API_KEY, "MonitoringRef": station_code}
    return {
        "verifyTrue": _attempt(url, params, SIRI_TIMEOUT, True),
        "verifyFalse": _attempt(url, params, SIRI_TIMEOUT, False),
    }


def probe_alerts() -> dict:
    """ביקורת: יציאה ל-HTTPS עם אימות, לשירות ללא הגבלת IP."""
    return _attempt(ALERTS_URL, {}, ALERTS_TIMEOUT, True)


def resolve_siri_host() -> dict:
    """
    האם שם המארח של SIRI קיים ב-DNS.

    נבדק בנפרד כי כתובת שגויה ב-.env נראית בדיוק כמו תקלת רשת: הכשל הוא
    ConnectionError, urllib3 מנסה שוב שלוש פעמים, והתוצאה היא 502 אחרי כמה
    שניות — בלי שום רמז שהשם פשוט לא קיים.
    """
    host = urlparse(SIRI_BASE_URL).hostname or ""
    try:
        return {"host": host, "resolves": True, "address": socket.gethostbyname(host)}
    except OSError as e:
        return {"host": host, "resolves": False, "error": str(e)[:120]}


def inspect_certificate() -> dict:
    """
    מושך את התעודה של שרת SIRI בלי לאמת אותה, כדי לראות למה האימות נכשל.

    שרשרת חסרה, תעודה שפגה ואי-התאמת שם נראות זהות מבחוץ ("SSLCertVerification
    Error") אבל דורשות תיקון שונה, ולכן צריך את הפרטים עצמם. התעודה היא מידע
    ציבורי — כל לקוח שמתחבר מקבל אותה.
    """
    host = urlparse(SIRI_BASE_URL).hostname or ""
    result: dict = {"host": host}

    # השגיאה המדויקת מאימות אמיתי — זו שקובעת מה לתקן.
    context = ssl.create_default_context()
    try:
        with socket.create_connection((host, 443), timeout=10) as raw, context.wrap_socket(
            raw, server_hostname=host
        ):
            result["verifies"] = True
    except ssl.SSLCertVerificationError as e:
        result["verifies"] = False
        result["verifyError"] = f"{e.verify_code}: {e.verify_message}"
    except Exception as e:
        result["verifies"] = False
        result["verifyError"] = f"{type(e).__name__}: {str(e)[:150]}"

    # התעודה עצמה, ללא אימות — ממנה נבנה SIRI_CA_BUNDLE אם צריך.
    # לא ssl.get_server_certificate: הוא מחפש קובץ CA ונופל ב-FileNotFoundError
    # על חלק מהפלטפורמות. חיבור ידני עם CERT_NONE עובד בכל מקום.
    unverified = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    unverified.check_hostname = False
    unverified.verify_mode = ssl.CERT_NONE
    try:
        with socket.create_connection((host, 443), timeout=10) as raw, unverified.wrap_socket(
            raw, server_hostname=host
        ) as tls:
            der = tls.getpeercert(binary_form=True)
            result["pem"] = ssl.DER_cert_to_PEM_cert(der) if der else None
            # השרשרת המלאה זמינה רק מ-Python 3.10; בלעדיה יש רק את התעודה
            # עצמה, וזה מספיק כדי להצמיד אותה.
            chain = getattr(tls, "get_unverified_chain", None)
            result["chainLength"] = len(chain()) if chain else 1
    except Exception as e:
        result["pem"] = None
        result["pemError"] = f"{type(e).__name__}: {str(e)[:150]}"

    return result


def outbound_ip() -> Optional[str]:
    """ה-IP היוצא כפי שרואה אותו העולם — מה שצריך להיות רשום אצל משרד התחבורה."""
    try:
        return requests.get("https://api.ipify.org", timeout=10).text.strip()
    except Exception:
        return None
