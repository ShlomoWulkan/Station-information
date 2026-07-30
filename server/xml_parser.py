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

log = logging.getLogger(__name__)

NS = "http://www.siri.org.uk/siri"


def _tag(name: str) -> str:
    return f"{{{NS}}}{name}"


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


def _first_text(element, *names: str) -> str:
    """הטקסט של השדה הראשון שקיים מבין השמות."""
    for name in names:
        text = element.findtext(_tag(name), "")
        if text:
            return text
    return ""


def _journey_id(visit, journey, line: str, timestamp: str) -> str:
    """
    מזהה לנסיעה בודדת, ממה ש-SIRI כבר נותן.

    נופל לחותמת הזמן המלאה ולא לדקות המעוגלות — שני אוטובוסים של אותו קו
    שמגיעים באותה דקה זה מצב לגיטימי, וזה בדיוק מה שייצר מפתחות כפולים.
    """
    identifier = (
        visit.findtext(_tag("ItemIdentifier"), "")
        or _first_text(journey, "VehicleRef", "DatedVehicleJourneyRef")
        or journey.findtext(f".//{_tag('DatedVehicleJourneyRef')}", "")
    )
    return identifier or f"{line}|{timestamp}"


def _ensure_unique_ids(rows: list[dict]) -> None:
    """
    מוסיף סיומת למזהים שחוזרים על עצמם.

    הערובה בפועל: היא לא תלויה בשאלה אילו שדות SIRI שלח, ולכן מפתחות כפולים
    לא יכולים לחזור גם אם הפורמט ישתנה.
    """
    seen: dict[str, int] = {}
    for row in rows:
        base = row["id"]
        count = seen.get(base, 0)
        seen[base] = count + 1
        if count:
            row["id"] = f"{base}#{count}"


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

    for visit in root.iter(_tag("MonitoredStopVisit")):
        journey = visit.find(f".//{_tag('MonitoredVehicleJourney')}")
        if journey is None:
            continue

        call = journey.find(_tag("MonitoredCall"))
        if call is None:
            continue

        expected = _first_text(call, "ExpectedArrivalTime", "ExpectedDepartureTime")
        aimed = _first_text(call, "AimedArrivalTime", "AimedDepartureTime")

        # זמן צפוי מגיע ממערכת הזמן-אמת; זמן מתוכנן הוא מלוח הזמנים.
        is_real_time = bool(expected)
        minutes = _minutes_until(expected or aimed) if (expected or aimed) else None
        if minutes is None:
            skipped += 1
            continue

        line = journey.findtext(_tag("PublishedLineName"), "")
        results.append(
            {
                "id": _journey_id(visit, journey, line, expected or aimed),
                "lineNumber": line,
                "destination": journey.findtext(_tag("DestinationName"), ""),
                "minutesUntilArrival": minutes,
                "isRealTime": is_real_time,
            }
        )

    if skipped:
        log.info("%d נסיעות דולגו — זמן חסר או לא ניתן לפיענוח", skipped)

    results.sort(key=lambda r: r["minutesUntilArrival"])
    _ensure_unique_ids(results)
    return results
