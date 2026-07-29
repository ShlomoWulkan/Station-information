"""
ממשק ציבורי לנתוני GTFS.

הפירוק עצמו יושב ב-services/gtfs/. הקובץ הזה נשאר כדי שהנתיבים לא יידעו על
מבנה האינדקסים ולא יעבירו אותם ביד.
"""
from typing import Optional

from services.gtfs import queries, store


def load_stops() -> None:
    """מוריד GTFS וטוען תחנות. הקווים ממשיכים להיטען ברקע."""
    store.load()


def get_nearby(lat: float, lon: float, radius: int) -> list[dict]:
    return queries.nearby(store.stops(), lat, lon, radius)


def get_stops_in_bounds(
    min_lat: float, max_lat: float, min_lon: float, max_lon: float, limit: int
) -> list[dict]:
    return queries.in_bounds(store.stops(), min_lat, max_lat, min_lon, max_lon, limit)


def get_stop_by_code(stop_code: str) -> Optional[dict]:
    return queries.stop_by_code(store.stops(), stop_code)


def get_stop_name(stop_code: str) -> str:
    stop = queries.stop_by_code(store.stops(), stop_code)
    return stop["name"] if stop else ""


def get_routes_for_station(stop_code: str) -> list[dict]:
    return queries.routes_for_station(store.stops(), store.routes(), stop_code)


def get_route_stops(station_code: str, line_number: str) -> list[dict]:
    return queries.route_stops(store.stops(), store.routes(), station_code, line_number)


def routes_ready() -> bool:
    return store.routes().ready


def stops_count() -> int:
    return len(store.stops().all)
