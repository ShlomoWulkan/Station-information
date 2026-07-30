"""
פיענוח stop_times.txt.

בקובץ נפרד כי הוא הכבד ביותר ב-GTFS — מיליוני שורות — והוא היחיד שמפוענח
ידנית ולא דרך csv.reader.
"""
import zipfile

TripStops = dict  # trip_id -> [(sequence, stop_id)]
StopTrips = dict  # stop_id -> {trip_id}


def read(archive: zipfile.ZipFile, wanted_trips: set) -> tuple:
    """
    תחנות לכל trip מבוקש, ו-trips לכל תחנה.

    split(",") ולא csv.reader: התקורה של csv מורגשת על קובץ בסדר גודל כזה.
    ההנחה היא ששלוש העמודות הנקראות אינן מצוטטות ואינן מכילות פסיקים — נכון
    בפיד של משרד התחבורה. אם זה ישתנה, השורות פשוט ידולגו ולא ייקראו שגוי.
    """
    trip_to_stops: TripStops = {trip: [] for trip in wanted_trips}
    stop_to_trips: StopTrips = {}

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
