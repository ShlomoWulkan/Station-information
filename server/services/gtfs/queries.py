"""שאילתות על אינדקס ה-GTFS. פונקציות טהורות — המצב מוחזק ב-store."""
from typing import Optional

from .geo import haversine
from .models import RoutesIndex, Stop, StopsIndex


def nearby(stops: StopsIndex, lat: float, lon: float, radius_m: int) -> list[dict]:
    """
    תחנות ברדיוס, הקרובה קודם.

    סריקה ליניארית על ~45 אלף תחנות. זה כמה מילישניות, ויש cache של 5 דקות
    מעליה, ולכן אינדקס מרחבי (rtree/scipy) לא מוצדק עד שיהיה עומס אמיתי.
    """
    found = []
    for stop in stops.all:
        distance = haversine(lat, lon, stop["lat"], stop["lon"])
        if distance <= radius_m:
            found.append({**stop, "distance": round(distance)})

    found.sort(key=lambda s: s["distance"])
    return found


def in_bounds(
    stops: StopsIndex,
    min_lat: float,
    max_lat: float,
    min_lon: float,
    max_lon: float,
    limit: int,
) -> list[dict]:
    """
    תחנות במסגרת, הקרובות למרכז קודם.

    המיון הוא התיקון: קודם נחתכו ה-limit הראשונים בסדר הרשימה, כך שבמרכז עיר
    צפופה הסמנים שהוצגו במפה היו שרירותיים ולא אלה שהמשתמש מסתכל עליהם.
    """
    center_lat = (min_lat + max_lat) / 2
    center_lon = (min_lon + max_lon) / 2

    inside = [
        stop
        for stop in stops.all
        if min_lat <= stop["lat"] <= max_lat and min_lon <= stop["lon"] <= max_lon
    ]
    inside.sort(key=lambda s: haversine(center_lat, center_lon, s["lat"], s["lon"]))
    return inside[:limit]


def routes_for_station(stops: StopsIndex, routes: RoutesIndex, code: str) -> list[dict]:
    """הקווים שעוצרים בתחנה, עם היעד (התחנה האחרונה במסלול)."""
    stop = stops.resolve(code)
    if stop is None:
        return []

    stop_id = stop["id"]
    names = routes.stop_to_route_names.get(stop_id, set())

    result = []
    # מיון לפי אורך ואז לקסיקוגרפי, כדי ש-"5" יופיע לפני "51" ולא אחרי "480".
    for name in sorted(names, key=lambda n: (len(n), n)):
        trip = routes.choose_trip(name, stop_id)
        result.append({"lineNumber": name, "destination": _final_stop_name(stops, routes, trip)})

    return result


def _final_stop_name(stops: StopsIndex, routes: RoutesIndex, trip: Optional[str]) -> str:
    if trip is None:
        return ""
    sequence = routes.trip_to_stops.get(trip, [])
    if not sequence:
        return ""

    last_stop = stops.by_id.get(sequence[-1][1])
    return last_stop["name"] if last_stop else ""


def route_stops(
    stops: StopsIndex, routes: RoutesIndex, station_code: str, line_number: str
) -> list[dict]:
    """תחנות המסלול של הקו שעובר בתחנה הנתונה, לפי סדר הנסיעה."""
    stop = stops.resolve(station_code)
    stop_id = stop["id"] if stop else None

    trip = routes.choose_trip(line_number, stop_id)
    if trip is None:
        return []

    return [
        {**stops.by_id[sid], "sequence": sequence, "isCurrent": sid == stop_id}
        for sequence, sid in routes.trip_to_stops.get(trip, [])
        if sid in stops.by_id
    ]


def stop_by_code(stops: StopsIndex, code: str) -> Optional[Stop]:
    return stops.resolve(code)
