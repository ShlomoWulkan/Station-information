"""בניית אינדקס הקווים והמסלולים מתוך ה-ZIP של GTFS."""
import csv
import io
import logging
import zipfile

from . import stop_times
from .models import RoutesIndex

log = logging.getLogger(__name__)


def _read_routes(archive: zipfile.ZipFile) -> tuple:
    """route_id → שם קו, ושם קו → כל ה-route_id שנושאים אותו."""
    route_id_to_name: dict = {}
    name_to_route_ids: dict = {}

    raw = archive.open("routes.txt").read().decode("utf-8-sig")
    for row in csv.DictReader(io.StringIO(raw)):
        name = row.get("route_short_name", "")
        if not name:
            continue
        route_id_to_name[row["route_id"]] = name
        name_to_route_ids.setdefault(name, []).append(row["route_id"])

    return route_id_to_name, name_to_route_ids


def _read_trips(archive: zipfile.ZipFile, route_id_to_name: dict) -> tuple:
    """trip מייצג אחד לכל route_id, ומיפוי trip → שם קו."""
    route_id_to_trip: dict = {}
    trip_to_name: dict = {}

    raw = archive.open("trips.txt").read().decode("utf-8-sig")
    for row in csv.DictReader(io.StringIO(raw)):
        route_id, trip_id = row["route_id"], row["trip_id"]
        name = route_id_to_name.get(route_id, "")
        if not name:
            continue
        trip_to_name[trip_id] = name
        # אחד לכל route_id ולא לכל שם: לשם קו אחד יש כמה כיוונים וחלופות.
        route_id_to_trip.setdefault(route_id, trip_id)

    return route_id_to_trip, trip_to_name


def _stop_to_route_names(trip_to_stops: dict, trip_to_name: dict) -> dict:
    result: dict = {}
    for trip_id, stops in trip_to_stops.items():
        name = trip_to_name.get(trip_id, "")
        if not name:
            continue
        for _, stop_id in stops:
            result.setdefault(stop_id, set()).add(name)
    return result


def build_routes_index(zip_bytes: bytes) -> RoutesIndex:
    """בונה את אינדקס הקווים. זורק על קובץ פגום — הקורא רושם ללוג."""
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as archive:
        route_id_to_name, name_to_route_ids = _read_routes(archive)
        route_id_to_trip, trip_to_name = _read_trips(archive, route_id_to_name)

        wanted = set(route_id_to_trip.values())
        log.info("%d קווים, %d מסלולים נבחרו", len(name_to_route_ids), len(wanted))

        trip_to_stops, stop_to_trips = stop_times.read(archive, wanted)

    return RoutesIndex(
        name_to_route_ids=name_to_route_ids,
        route_id_to_trip=route_id_to_trip,
        trip_to_name=trip_to_name,
        trip_to_stops=trip_to_stops,
        stop_to_trips=stop_to_trips,
        stop_to_route_names=_stop_to_route_names(trip_to_stops, trip_to_name),
        ready=True,
    )
