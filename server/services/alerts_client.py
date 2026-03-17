"""
לקוח GTFS-Realtime — מוריד התראות שירות בפורמט Protobuf.
"""
import requests
from google.transit import gtfs_realtime_pb2
from config import ALERTS_URL


def fetch_alerts() -> list[dict]:
    """מוריד ומנתח התראות שירות פעילות."""
    resp = requests.get(ALERTS_URL, timeout=15)
    resp.raise_for_status()

    # ממשק GTFS-RT דורש הרשמה — אם התשובה היא HTML, אין גישה
    if resp.content[:5] == b"<!DOC" or b"<html" in resp.content[:100]:
        return []

    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(resp.content)

    alerts = []
    for entity in feed.entity:
        if not entity.HasField("alert"):
            continue

        alert = entity.alert
        alerts.append({
            "id":          entity.id,
            "header":      _translation(alert.header_text),
            "description": _translation(alert.description_text),
            "routes":      [str(ie.route_id) for ie in alert.informed_entity if ie.route_id],
            "stops":       [str(ie.stop_id)  for ie in alert.informed_entity if ie.stop_id],
        })

    return alerts


def _translation(translated) -> str:
    """מחלץ טקסט עברי מ-TranslatedString."""
    for t in translated.translation:
        if t.language in ("he", "iw", ""):
            return t.text
    if translated.translation:
        return translated.translation[0].text
    return ""
