"""
פיענוח תגובת SIRI.

defusedxml ולא xml.etree: ה-XML מגיע מגורם חיצוני, ו-ElementTree של הספרייה
התקנית פגיע להתקפת התרחבות ישויות (billion laughs) — פיד עוין או פגום יכול
לתפוח לגיגה-בייטים של זיכרון בזמן פיענוח.
"""
import logging
from datetime import datetime
from typing import Optional

from defusedxml import ElementTree as ET

from arrival_ids import ensure_unique, journey_id
from siri_xml import first_text, tag

log = logging.getLogger(__name__)


def _minutes_until(iso_time: str) -> Optional[int]:
    """
    דקות עד המועד הנתון, או None אם אינו ניתן לפיענוח.

    None ולא -1: הקורא מסנן לפי זה, ומספר קסם ששימש גם כשגיאה וגם כזמן הסתיר
    נסיעות בשקט כשהפורמט השתנה.
    """
    try:
        arrival = datetime.fromisoformat(iso_time.replace("Z", "+00:00"))
    except ValueError:
        log.debug("זמן לא ניתן לפיענוח: %r", iso_time)
        return None

    now = datetime.now(arrival.tzinfo)
    return max(0, int((arrival - now).total_seconds() // 60))


def parse_arrivals(xml_text: str) -> list[dict]:
    """
    מנתח XML של SIRI לרשימת נסיעות, הקרובה קודם.

    זורק ValueError על XML לא תקין.
    """
    try:
        root = ET.fromstring(xml_text)
    except Exception as e:
        raise ValueError(f"SIRI XML לא תקין: {e}") from e

    results = []
    skipped = 0

    for visit in root.iter(tag("MonitoredStopVisit")):
        journey = visit.find(f".//{tag('MonitoredVehicleJourney')}")
        if journey is None:
            continue

        call = journey.find(tag("MonitoredCall"))
        if call is None:
            continue

        expected = first_text(call, "ExpectedArrivalTime", "ExpectedDepartureTime")
        aimed = first_text(call, "AimedArrivalTime", "AimedDepartureTime")

        # זמן צפוי מגיע ממערכת הזמן-אמת; זמן מתוכנן הוא מלוח הזמנים.
        is_real_time = bool(expected)
        minutes = _minutes_until(expected or aimed) if (expected or aimed) else None
        if minutes is None:
            skipped += 1
            continue

        line = journey.findtext(tag("PublishedLineName"), "")
        results.append(
            {
                "id": journey_id(visit, journey, line, expected or aimed),
                "lineNumber": line,
                # משרד התחבורה שולח DestinationRef (קוד תחנה) ולא DestinationName.
                # התרגום לשם נעשה ב-services/destinations.py, כדי שהמודול הזה
                # יישאר פיענוח טהור בלי תלות בנתוני GTFS.
                "destination": journey.findtext(tag("DestinationName"), ""),
                "destinationRef": journey.findtext(tag("DestinationRef"), ""),
                "minutesUntilArrival": minutes,
                "isRealTime": is_real_time,
            }
        )

    if skipped:
        log.info("%d נסיעות דולגו — זמן חסר או לא ניתן לפיענוח", skipped)

    results.sort(key=lambda r: r["minutesUntilArrival"])
    ensure_unique(results)
    return results
