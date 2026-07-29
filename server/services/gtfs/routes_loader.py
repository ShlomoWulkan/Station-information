"""בניית אינדקס הקווים והמסלולים מתוך ה-ZIP של GTFS."""
import csv
import io
import logging
import zipfile

from .models import RoutesIndex

log = logging.getLogger(__name__)


def _read_routes(archive: zipfile.ZipFile) -> tuple[dict[str, str], dict[str, list[str]]]:
    """route_id → שם קו, ושם קו → כל ה-route_id שנושאים אותו."""
    route_id_to_name: dict[str, str] = {}
    name_to_route_ids: dict[str, list[str]] = {}

    raw = archive.open("routes.txt").read().decode("utf-8-sig")
    for row in csv.DictReader(io.StringIO(raw)):
        name = row.get("route_short_name", "")
        if not name:
            continue
        route_id_to_name[row["route_id"]] = name
        name_to_route_ids.setdefault(name, []).append(row["route_id"])

    return route_id_to_name, name_to_route_ids


def _read_trips(
    archive: zipfile.ZipFile, route_id_to_name: dict[str, str]
) -> tuple[dict[str, str], dict[str, str]]:
    """trip מייצג אחד לכל route_id, ומיפוי trip → שם קו."""
    route_id_to_trip: dict[str, str] = {}
    trip_to_name: dict[str, str] = {}

    raw = archive.open("trips.txt").read().decode("utf-8-sig")
    for row in csv.DictReader(io.StringIO(raw)):
        route_id, trip_id = row["route_id"], row["trip_id"]
        name = route_id_to_name.get(route_id, "")
        if not name:
            continue
        trip_to_name[trip_id] = name
        # אחד לכל route_id ולא לכל שם: לשם אחד יש כמה כיוונים.
        route_id_to_trip.setdefault(route_id, trip_id)

    return route_id_to_trip, trip_to_name


def _read_stop_times(
    archive: zipfile.ZipFile, wanted_trips: set[str]
) -> tuple[dict[str, list[tuple[int, str]]], dict[str, set[str]]]:
    """
    תחנות לכל trip מבוקש, ו-trips לכל תחנה.

    פיענוח ידני ולא csv.reader: stop_times.txt הוא הקובץ הכבד ביותר ב-GTFS
    (מיליוני שורות), והתקורה של csv מורגשת. ההנחה היא ששלוש העמודות שאנחנו
    קוראים אינן מצוטטות ואינן מכילות פסיקים — נכון בפיד של משרד התחבורה.
    """
    trip_to_stops: dict[str, list[tuple[int, str]]] = {t: [] for t in wanted_trips}
    stop_to_trips: dict[str, set[str]] = {}

    with archive.open("stop_times.txt") as handle:
        header = handle.readline().decode("utf-8-sig").strip().split(",")
        try:
            i_trip = header.index("trip_id")
            i_stop = header.index("stop_id")
            i_seq = header.index("stop_sequence")
        except ValueError as e:
            raise ValueError(f"stop_times.txt חסר עמודה נדרשת: {e}") from e

        max_index = max(i_trip, i_stop, i_seq)
        for line in handle:
            parts = line.decode("utf-8", errors="ignore").strip().split(",")
            if len(parts) <= max_index:
                continue

            trip_id = parts[i_trip]
            if trip_id not in wanted_trips:
                continue

            try:
                sequence = int(parts[i_seq])
            except ValueError:
                continue

            stop_id = parts[i_stop]
            trip_to_stops[trip_id].append((sequence, stop_id))
            stop_to_trips.setdefault(stop_id, set()).add(trip_id)

    for stops in trip_to_stops.values():
        stops.sort(key=lambda pair: pair[0])

    return trip_to_stops, stop_to_trips


def build_routes_index(zip_bytes: bytes) -> RoutesIndex:
    """בונה את אינדקס הקווים. זורק על קובץ פגום — הקורא רושם ללוג."""
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as archive:
        route_id_to_name, name_to_route_ids = _read_routes(archive)
        route_id_to_trip, trip_to_name = _read_trips(archive, route_id_to_name)

        wanted = set(route_id_to_trip.values())
        log.info("%d קווים, %d מסלולים נבחרו", len(name_to_route_ids), len(wanted))

        trip_to_stops, stop_to_trips = _read_stop_times(archive, wanted)

    stop_to_route_names: dict[str, set[str]] = {}
    for trip_id, stops in trip_to_stops.items():
        name = trip_to_name.get(trip_id, "")
        if not name:
            continue
        for _, stop_id in stops:
            stop_to_route_names.setdefault(stop_id, set()).add(name)

    return RoutesIndex(
        name_to_route_ids=name_to_route_ids,
        route_id_to_trip=route_id_to_trip,
        trip_to_name=trip_to_name,
        trip_to_stops=trip_to_stops,
        stop_to_trips=stop_to_trips,
        stop_to_route_names=stop_to_route_names,
        ready=True,
    )
