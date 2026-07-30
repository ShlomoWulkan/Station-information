"""
לקוח GTFS-Realtime — התראות שירות בפורמט Protobuf.

⚠️ הפיצ'ר אינו פעיל. ALERTS_URL אינו מצביע על פיד קיים: gtfs.mot.gov.il
מארח רק קבצי GTFS סטטיים, ו-/ServiceAlerts/ מוגש שם כדף שגיאה — תחת קוד 200,
כלומר 404 מחופש.

לכן fetch_alerts מחזיר רשימה ריקה, ומשמעותה **"אין לנו גישה"** ולא "אין
התראות". אין לחבר את /alerts לממשק לפני שמאומת פיד עובד — הצגת "אין שיבושים"
כשאין נתונים היא אותו סוג הטעיה כמו זמני אוטובוס מזויפים.

צריך לברר מול משרד התחבורה אם הגישה למרכז הנתונים כוללת GTFS-Realtime
Service Alerts, ומה הכתובת.
"""
import logging

import requests
from google.transit import gtfs_realtime_pb2

from config import ALERTS_TIMEOUT, ALERTS_URL

log = logging.getLogger(__name__)

_HEBREW_LANGS = ("he", "iw", "")


def fetch_alerts() -> list[dict]:
    """מוריד ומנתח התראות שירות פעילות."""
    response = requests.get(ALERTS_URL, timeout=ALERTS_TIMEOUT)
    response.raise_for_status()

    # הפיד דורש הרשמה. בלי גישה מוחזר דף HTML, שפיענוח protobuf יפיל עליו.
    head = response.content[:100]
    if head.startswith(b"<!DOC") or b"<html" in head:
        log.warning("פיד ההתראות החזיר HTML — כנראה אין הרשאת גישה")
        return []

    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(response.content)

    alerts = []
    for entity in feed.entity:
        if not entity.HasField("alert"):
            continue

        alert = entity.alert
        alerts.append(
            {
                "id": entity.id,
                "header": _hebrew(alert.header_text),
                "description": _hebrew(alert.description_text),
                "routes": [str(e.route_id) for e in alert.informed_entity if e.route_id],
                "stops": [str(e.stop_id) for e in alert.informed_entity if e.stop_id],
            }
        )

    log.debug("%d התראות", len(alerts))
    return alerts


def _hebrew(translated) -> str:
    """מחלץ טקסט עברי מ-TranslatedString, ונופל לתרגום הראשון."""
    for translation in translated.translation:
        if translation.language in _HEBREW_LANGS:
            return translation.text

    return translated.translation[0].text if translated.translation else ""
