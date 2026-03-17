"""
לקוח GTFS סטטי — מוריד israel-public-transportation.zip ומחלץ stops.txt.
אין צורך ב-API key — הקובץ פתוח לציבור.
"""
import csv
import io
import math
import zipfile
import requests

GTFS_ZIP_URL = "https://gtfs.mot.gov.il/gtfsfiles/israel-public-transportation.zip"
_stops: list[dict] = []


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """מחזיר מרחק במטרים בין שתי נקודות."""
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def load_stops() -> None:
    """מוריד את ה-ZIP של GTFS, מחלץ stops.txt ושומר בזיכרון."""
    global _stops
    print(f"מוריד {GTFS_ZIP_URL} ...")
    resp = requests.get(GTFS_ZIP_URL, timeout=120)
    resp.raise_for_status()
    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        with zf.open("stops.txt") as f:
            content = f.read().decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(content))
    _stops = [
        {
            "id":   row["stop_id"],
            "code": row["stop_code"],
            "name": row["stop_name"],
            "lat":  float(row["stop_lat"]),
            "lon":  float(row["stop_lon"]),
        }
        for row in reader
        if row.get("stop_lat") and row.get("stop_lon")
    ]
    print(f"נטענו {len(_stops)} תחנות")


def get_nearby(lat: float, lon: float, radius: int = 500) -> list[dict]:
    """מחזיר תחנות בטווח radius מטרים מהמיקום."""
    results = []
    for stop in _stops:
        dist = _haversine(lat, lon, stop["lat"], stop["lon"])
        if dist <= radius:
            results.append({**stop, "distance": round(dist)})
    results.sort(key=lambda s: s["distance"])
    return results


def get_stop_name(stop_code: str) -> str:
    """מחזיר שם תחנה לפי קוד."""
    for stop in _stops:
        if stop["code"] == stop_code or stop["id"] == stop_code:
            return stop["name"]
    return ""


def stops_count() -> int:
    return len(_stops)
