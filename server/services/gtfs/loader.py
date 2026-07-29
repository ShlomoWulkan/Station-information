"""הורדת ה-ZIP של GTFS ובניית אינדקס התחנות."""
import csv
import io
import logging
import zipfile

import requests

from config import GTFS_TIMEOUT, GTFS_ZIP_URL

from .models import StopsIndex

log = logging.getLogger(__name__)


def download_zip() -> bytes:
    log.info("מוריד GTFS מ-%s", GTFS_ZIP_URL)
    response = requests.get(GTFS_ZIP_URL, timeout=GTFS_TIMEOUT)
    response.raise_for_status()
    log.info("הורדו %.1f MB", len(response.content) / 1_048_576)
    return response.content


def read_member(zip_bytes: bytes, name: str) -> str:
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as archive:
        return archive.open(name).read().decode("utf-8-sig")


def build_stops_index(zip_bytes: bytes) -> StopsIndex:
    """
    בונה את אינדקס התחנות מ-stops.txt.

    מחזיר אינדקס חדש ולא צובר לתוך קיים — הגרסה הקודמת עשתה append לרשימה
    גלובלית, כך שטעינה שנייה הכפילה כל תחנה.
    """
    index = StopsIndex()
    skipped = 0

    for row in csv.DictReader(io.StringIO(read_member(zip_bytes, "stops.txt"))):
        try:
            stop = {
                "id": row["stop_id"],
                "code": row["stop_code"],
                "name": row["stop_name"],
                "lat": float(row["stop_lat"]),
                "lon": float(row["stop_lon"]),
            }
        except (KeyError, TypeError, ValueError):
            # שורה בלי קואורדינטות תקינות אינה שמישה במפה ובחיפוש קרבה.
            skipped += 1
            continue

        index.all.append(stop)
        index.by_id[stop["id"]] = stop
        index.by_code[stop["code"]] = stop

    log.info("נטענו %d תחנות (%d שורות דולגו)", len(index.all), skipped)
    return index
