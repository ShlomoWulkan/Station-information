"""מבני הנתונים של אינדקס ה-GTFS."""
from dataclasses import dataclass, field
from typing import Optional

Stop = dict  # {"id", "code", "name", "lat", "lon"}


@dataclass(frozen=True)
class StopsIndex:
    """התחנות עצמן, לפי מזהה ולפי קוד."""

    all: list[Stop] = field(default_factory=list)
    by_id: dict[str, Stop] = field(default_factory=dict)
    by_code: dict[str, Stop] = field(default_factory=dict)

    def resolve(self, code: str) -> Optional[Stop]:
        """
        מאתר תחנה לפי קוד או לפי מזהה.

        שני המקורות כי הלקוח מעביר לפעמים code ולפעמים id, וההבחנה לא הייתה
        עקבית. הלוגיקה הזאת הייתה משוכפלת בארבעה מקומות.
        """
        return self.by_code.get(code) or self.by_id.get(code)


@dataclass(frozen=True)
class RoutesIndex:
    """
    מסלולים וקווים.

    frozen ומפורסם בהשמה אטומית אחת: קודם שישה גלובלים נכתבו בזה אחר זה מתוך
    thread רקע בזמן ש-threads של בקשות קראו אותם, וחלון חוסר-העקביות ביניהם
    היה נראה ללקוח.
    """

    name_to_route_ids: dict[str, list[str]] = field(default_factory=dict)
    route_id_to_trip: dict[str, str] = field(default_factory=dict)
    trip_to_name: dict[str, str] = field(default_factory=dict)
    trip_to_stops: dict[str, list[tuple[int, str]]] = field(default_factory=dict)
    stop_to_trips: dict[str, set[str]] = field(default_factory=dict)
    stop_to_route_names: dict[str, set[str]] = field(default_factory=dict)
    ready: bool = False

    def choose_trip(self, line_number: str, stop_id: Optional[str]) -> Optional[str]:
        """
        בוחר trip שמייצג את הקו — כזה שעובר בתחנה הנתונה אם אפשר.

        שם קו אחד יכול להתאים לכמה route_id (כיוונים, חלופות), ולכן צריך לבחור
        את זה שרלוונטי לתחנה. היה משוכפל בשתי פונקציות.
        """
        route_ids = self.name_to_route_ids.get(line_number, [])
        if not route_ids:
            return None

        if stop_id is not None:
            trips_here = self.stop_to_trips.get(stop_id, set())
            for route_id in route_ids:
                trip = self.route_id_to_trip.get(route_id)
                if trip and trip in trips_here:
                    return trip

        # אין trip שעובר בתחנה — נופלים לראשון שיש לו מסלול.
        for route_id in route_ids:
            trip = self.route_id_to_trip.get(route_id)
            if trip:
                return trip
        return None
