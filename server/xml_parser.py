import xml.etree.ElementTree as ET
from datetime import datetime


NS = {
    "siri": "http://www.siri.org.uk/siri",
    "il":   "http://www.siri.org.uk/siri",
}


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

    for visit in root.iter("{http://www.siri.org.uk/siri}MonitoredVehicleJourney"):
        line_ref   = visit.findtext(".//{http://www.siri.org.uk/siri}LineRef", "")
        dest       = visit.findtext(".//{http://www.siri.org.uk/siri}DestinationName", "")
        aimed      = visit.findtext(".//{http://www.siri.org.uk/siri}AimedArrivalTime", "")
        expected   = visit.findtext(".//{http://www.siri.org.uk/siri}ExpectedArrivalTime", "")
        is_rt      = expected != ""

        time_str = expected if is_rt else aimed
        minutes  = _minutes_until(time_str) if time_str else -1

        if minutes < 0:
            continue

        results.append({
            "lineNumber":            line_ref,
            "destination":           dest,
            "minutesUntilArrival":   minutes,
            "isRealTime":            is_rt,
        })

    results.sort(key=lambda x: x["minutesUntilArrival"])
    return results


def parse_stations(xml_text: str) -> list[dict]:
    """מנתח XML של תחנות ומחזיר רשימה."""
    root = ET.fromstring(xml_text)
    stations = []

    for sp in root.iter("{http://www.siri.org.uk/siri}StopPoint"):
        stations.append({
            "id":   sp.findtext(".//{http://www.siri.org.uk/siri}StopPointRef", ""),
            "name": sp.findtext(".//{http://www.siri.org.uk/siri}StopPointName", ""),
            "code": sp.findtext(".//{http://www.siri.org.uk/siri}StopPointRef", ""),
            "lat":  float(sp.findtext(".//{http://www.siri.org.uk/siri}Latitude",  "0") or 0),
            "lon":  float(sp.findtext(".//{http://www.siri.org.uk/siri}Longitude", "0") or 0),
        })

    return stations
