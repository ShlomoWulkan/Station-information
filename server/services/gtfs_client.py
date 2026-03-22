"""
לקוח GTFS סטטי — stops, routes per stop, route stops.
אין צורך ב-API key.
"""
import csv
import io
import math
import zipfile
import threading
import requests
from typing import Optional

GTFS_ZIP_URL = "https://gtfs.mot.gov.il/gtfsfiles/israel-public-transportation.zip"

_stops:        list[dict]      = []
_stop_by_id:   dict[str, dict] = {}
_stop_by_code: dict[str, dict] = {}

# נבנה ברקע
_name_to_route_ids: dict[str, list[str]] = {}  # short_name -> [route_ids]
_route_id_to_trip:  dict[str, str]       = {}  # route_id   -> trip_id (אחד)
_trip_to_name:      dict[str, str]       = {}  # trip_id    -> short_name
_trip_to_stops:     dict[str, list]      = {}  # trip_id    -> [(seq, stop_id)]
_stop_to_trips:     dict[str, set]       = {}  # stop_id    -> {trip_ids}
_stop_to_routes:    dict[str, set]       = {}  # stop_id    -> {short_names}
_routes_ready = False
_zip_bytes: bytes = b""


# ── helpers ────────────────────────────────────────────────────────────────

def _haversine(lat1, lon1, lat2, lon2) -> float:
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi, dlam = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ── loaders ────────────────────────────────────────────────────────────────

def load_stops() -> None:
    global _stops, _stop_by_id, _stop_by_code, _zip_bytes

    print(f"מוריד {GTFS_ZIP_URL} ...")
    resp = requests.get(GTFS_ZIP_URL, timeout=120)
    resp.raise_for_status()
    _zip_bytes = resp.content

    with zipfile.ZipFile(io.BytesIO(_zip_bytes)) as zf:
        content = zf.open("stops.txt").read().decode("utf-8-sig")
    for row in csv.DictReader(io.StringIO(content)):
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

    threading.Thread(target=_load_routes_background, daemon=True).start()


def _load_routes_background() -> None:
    global _name_to_route_ids, _route_id_to_trip, _trip_to_name
    global _trip_to_stops, _stop_to_trips, _stop_to_routes, _routes_ready
    try:
        print("טוען קווים ברקע...")
        with zipfile.ZipFile(io.BytesIO(_zip_bytes)) as zf:

            # 1. routes.txt: route_id → short_name + short_name → [route_ids]
            route_id_to_name: dict[str, str]       = {}
            name_to_route_ids: dict[str, list[str]] = {}
            for row in csv.DictReader(io.StringIO(zf.open("routes.txt").read().decode("utf-8-sig"))):
                rid  = row["route_id"]
                name = row.get("route_short_name", "")
                if not name:
                    continue
                route_id_to_name[rid] = name
                name_to_route_ids.setdefault(name, []).append(rid)

            # 2. trips.txt: trip אחד לכל route_id (לא לכל שם!)
            route_id_to_trip: dict[str, str] = {}
            trip_to_name:     dict[str, str] = {}
            for row in csv.DictReader(io.StringIO(zf.open("trips.txt").read().decode("utf-8-sig"))):
                rid = row["route_id"]
                tid = row["trip_id"]
                name = route_id_to_name.get(rid, "")
                if not name:
                    continue
                trip_to_name[tid] = name
                if rid not in route_id_to_trip:
                    route_id_to_trip[rid] = tid

            wanted = set(route_id_to_trip.values())
            print(f"  {len(wanted)} trips נבחרו (אחד לכל route_id)")

            # 3. stop_times.txt — קריאה מהירה, רק trips שנבחרו
            trip_to_stops: dict[str, list] = {t: [] for t in wanted}
            stop_to_trips: dict[str, set]  = {}

            with zf.open("stop_times.txt") as f:
                hdr = f.readline().decode("utf-8-sig").strip().split(",")
                ti, si, qi = hdr.index("trip_id"), hdr.index("stop_id"), hdr.index("stop_sequence")
                for line in f:
                    p = line.decode("utf-8", errors="ignore").strip().split(",")
                    if len(p) <= max(ti, si, qi):
                        continue
                    tid = p[ti]
                    if tid not in wanted:
                        continue
                    sid = p[si]
                    try:
                        trip_to_stops[tid].append((int(p[qi]), sid))
                    except ValueError:
                        continue
                    stop_to_trips.setdefault(sid, set()).add(tid)

        # מיון תחנות לפי סדר
        for tid in trip_to_stops:
            trip_to_stops[tid].sort(key=lambda x: x[0])

        # stop_id → route short names
        stop_to_routes: dict[str, set] = {}
        for tid, stops_list in trip_to_stops.items():
            name = trip_to_name.get(tid, "")
            if not name:
                continue
            for _, sid in stops_list:
                stop_to_routes.setdefault(sid, set()).add(name)

        _name_to_route_ids = name_to_route_ids
        _route_id_to_trip  = route_id_to_trip
        _trip_to_name      = trip_to_name
        _trip_to_stops     = trip_to_stops
        _stop_to_trips     = stop_to_trips
        _stop_to_routes    = stop_to_routes
        _routes_ready      = True
        print(f"נטענו {len(_name_to_route_ids)} שמות קווים, {len(_route_id_to_trip)} מסלולים")

    except Exception as e:
        print(f"שגיאה בטעינת קווים: {e}")


# ── queries ────────────────────────────────────────────────────────────────

def get_nearby(lat: float, lon: float, radius: int = 500) -> list[dict]:
    out = []
    for s in _stops:
        d = _haversine(lat, lon, s["lat"], s["lon"])
        if d <= radius:
            out.append({**s, "distance": round(d)})
    out.sort(key=lambda s: s["distance"])
    return out


def get_stop_name(stop_code: str) -> str:
    s = _stop_by_code.get(stop_code) or _stop_by_id.get(stop_code)
    return s["name"] if s else ""


def get_stop_by_code(stop_code: str) -> Optional[dict]:
    return _stop_by_code.get(stop_code) or _stop_by_id.get(stop_code)


def get_stops_in_bounds(min_lat, max_lat, min_lon, max_lon, limit=300) -> list[dict]:
    return [
        s for s in _stops
        if min_lat <= s["lat"] <= max_lat and min_lon <= s["lon"] <= max_lon
    ][:limit]


def get_routes_for_station(stop_code: str) -> list[str]:
    """קווים לתחנה מ-GTFS — ללא API key."""
    stop = _stop_by_code.get(stop_code) or _stop_by_id.get(stop_code)
    if not stop:
        return []
    names = _stop_to_routes.get(stop["id"], set())
    return sorted(names, key=lambda n: (len(n), n))


def get_route_stops(station_code: str, line_number: str) -> list[dict]:
    """
    תחנות הקו שעובר בתחנה הספציפית.
    מוצא route_id שמכיל את התחנה עם שם הקו הנכון.
    """
    stop = _stop_by_code.get(station_code) or _stop_by_id.get(station_code)
    stop_id = stop["id"] if stop else None

    route_ids = _name_to_route_ids.get(line_number, [])
    if not route_ids:
        return []

    # מצא route_id שה-trip שלו עובר בתחנה
    chosen_tid = None
    if stop_id:
        stop_trip_ids = _stop_to_trips.get(stop_id, set())
        for rid in route_ids:
            tid = _route_id_to_trip.get(rid)
            if tid and tid in stop_trip_ids:
                chosen_tid = tid
                break

    # fallback: trip ראשון לשם הקו
    if not chosen_tid:
        for rid in route_ids:
            chosen_tid = _route_id_to_trip.get(rid)
            if chosen_tid:
                break

    if not chosen_tid:
        return []

    return [
        {**_stop_by_id[sid], "sequence": seq, "isCurrent": sid == stop_id}
        for seq, sid in _trip_to_stops.get(chosen_tid, [])
        if sid in _stop_by_id
    ]


def routes_ready() -> bool:
    return _routes_ready


def stops_count() -> int:
    return len(_stops)
