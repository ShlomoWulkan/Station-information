"""
לקוח GTFS סטטי — מוריד israel-public-transportation.zip ומחלץ stops + route stops.
אין צורך ב-API key — הקובץ פתוח לציבור.
"""
import csv
import io
import math
import zipfile
import requests

GTFS_ZIP_URL = "https://gtfs.mot.gov.il/gtfsfiles/israel-public-transportation.zip"

_stops: list[dict] = []
_stop_by_id: dict[str, dict] = {}          # stop_id  -> stop
_stop_by_code: dict[str, dict] = {}         # stop_code -> stop
_route_stops: dict[str, list[dict]] = {}    # route_short_name -> [stop dicts ordered]


# ── helpers ──────────────────────────────────────────────────────────────────

def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _read_csv(zf: zipfile.ZipFile, filename: str) -> csv.DictReader:
    content = zf.open(filename).read().decode("utf-8-sig")
    return csv.DictReader(io.StringIO(content))


# ── loader ───────────────────────────────────────────────────────────────────

def load_stops() -> None:
    global _stops, _stop_by_id, _stop_by_code, _route_stops

    print(f"מוריד {GTFS_ZIP_URL} ...")
    resp = requests.get(GTFS_ZIP_URL, timeout=120)
    resp.raise_for_status()
    zip_bytes = resp.content
    print("מנתח GTFS...")

    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:

        # 1. stops.txt
        for row in _read_csv(zf, "stops.txt"):
            if not row.get("stop_lat") or not row.get("stop_lon"):
                continue
            s = {
                "id":   row["stop_id"],
                "code": row["stop_code"],
                "name": row["stop_name"],
                "lat":  float(row["stop_lat"]),
                "lon":  float(row["stop_lon"]),
            }
            _stops.append(s)
            _stop_by_id[s["id"]] = s
            _stop_by_code[s["code"]] = s
        print(f"נטענו {len(_stops)} תחנות")

        # 2. routes.txt — route_id -> short_name
        route_id_to_name: dict[str, str] = {}
        for row in _read_csv(zf, "routes.txt"):
            route_id_to_name[row["route_id"]] = row.get("route_short_name", "")

        # 3. trips.txt — בוחר trip אחד (ראשון) לכל route_short_name
        name_to_trip: dict[str, str] = {}   # short_name -> trip_id
        for row in _read_csv(zf, "trips.txt"):
            name = route_id_to_name.get(row["route_id"], "")
            if name and name not in name_to_trip:
                name_to_trip[name] = row["trip_id"]

        wanted_trips = set(name_to_trip.values())

        # 4. stop_times.txt — רק trips שנבחרו
        trip_stops: dict[str, list[tuple[int, str]]] = {t: [] for t in wanted_trips}
        for row in _read_csv(zf, "stop_times.txt"):
            tid = row["trip_id"]
            if tid not in wanted_trips:
                continue
            try:
                seq = int(row["stop_sequence"])
            except ValueError:
                continue
            trip_stops[tid].append((seq, row["stop_id"]))

        # 5. בנה _route_stops
        for name, tid in name_to_trip.items():
            ordered = sorted(trip_stops.get(tid, []), key=lambda x: x[0])
            stops_list = []
            for seq, sid in ordered:
                stop = _stop_by_id.get(sid)
                if stop:
                    stops_list.append({**stop, "sequence": seq})
            if stops_list:
                _route_stops[name] = stops_list

    print(f"נטענו {len(_route_stops)} קווים")


# ── queries ───────────────────────────────────────────────────────────────────

def get_nearby(lat: float, lon: float, radius: int = 500) -> list[dict]:
    results = []
    for stop in _stops:
        dist = _haversine(lat, lon, stop["lat"], stop["lon"])
        if dist <= radius:
            results.append({**stop, "distance": round(dist)})
    results.sort(key=lambda s: s["distance"])
    return results


def get_stop_name(stop_code: str) -> str:
    s = _stop_by_code.get(stop_code) or _stop_by_id.get(stop_code)
    return s["name"] if s else ""


def get_stop_by_code(stop_code: str) -> dict | None:
    return _stop_by_code.get(stop_code) or _stop_by_id.get(stop_code)


def get_stops_in_bounds(min_lat: float, max_lat: float, min_lon: float, max_lon: float, limit: int = 300) -> list[dict]:
    results = [
        s for s in _stops
        if min_lat <= s["lat"] <= max_lat and min_lon <= s["lon"] <= max_lon
    ]
    return results[:limit]


def get_route_stops(line_number: str) -> list[dict]:
    """מחזיר רשימת תחנות לקו לפי מספרו, לפי סדר."""
    return _route_stops.get(line_number, [])


def stops_count() -> int:
    return len(_stops)
