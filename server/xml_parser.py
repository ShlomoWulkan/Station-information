import xml.etree.ElementTree as ET
from datetime import datetime

NS = "http://www.siri.org.uk/siri"


def _minutes_until(iso_time: str) -> int:
    """מחזיר דקות עד הגעה מתוך מחרוזת ISO 8601."""
    try:
        arrival = datetime.fromisoformat(iso_time.replace("Z", "+00:00"))
        now = datetime.now(arrival.tzinfo)
        diff = (arrival - now).total_seconds()
        return max(0, int(diff // 60))
    except Exception:
        return -1


def parse_arrivals(xml_text: str) -> list[dict]:
    """מנתח XML של תגובת SIRI ומחזיר רשימת נסיעות."""
    root = ET.fromstring(xml_text)
    results = []

    for visit in root.iter(f"{{{NS}}}MonitoredStopVisit"):
        journey = visit.find(f".//{{{NS}}}MonitoredVehicleJourney")
        if journey is None:
            continue

        call = journey.find(f"{{{NS}}}MonitoredCall")
        if call is None:
            continue

        line_name = journey.findtext(f"{{{NS}}}PublishedLineName", "")
        dest      = journey.findtext(f"{{{NS}}}DestinationName", "")
        aimed     = (call.findtext(f"{{{NS}}}AimedArrivalTime", "")
                     or call.findtext(f"{{{NS}}}AimedDepartureTime", ""))
        expected  = (call.findtext(f"{{{NS}}}ExpectedArrivalTime", "")
                     or call.findtext(f"{{{NS}}}ExpectedDepartureTime", ""))
        is_rt     = expected != ""

        time_str = expected if is_rt else aimed
        minutes  = _minutes_until(time_str) if time_str else -1

        if minutes < 0:
            continue

        results.append({
            "lineNumber":          line_name,
            "destination":         dest,
            "minutesUntilArrival": minutes,
            "isRealTime":          is_rt,
        })

    results.sort(key=lambda x: x["minutesUntilArrival"])
    return results
