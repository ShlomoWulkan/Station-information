"""
אימות פרמטרים מבקשות.

הגבלות אינן קוסמטיות: לפני זה `radius` ו-`limit` היו ללא תקרה, כך שבקשה אחת
עם radius=99999999 הכריחה סריקה ליניארית עם haversine על ~45 אלף תחנות והחזירה
את כולן.
"""
import re
from typing import Optional

from flask import abort

from config import (
    MAX_BBOX_DEGREES,
    MAX_NEARBY_RADIUS_M,
    MAX_STOPS_LIMIT,
)

# קודי תחנה ומספרי קו מ-GTFS: ספרות, ולפעמים אותיות/מקף בשמות קווים.
_STATION_CODE = re.compile(r"^[0-9]{1,12}$")
_LINE_NUMBER = re.compile(r"^[0-9A-Za-z֐-׿#/-]{1,16}$")


def station_code(value: str) -> str:
    """מאמת קוד תחנה לפני שהוא נכנס ל-URL של שירות חיצוני."""
    if not _STATION_CODE.match(value):
        abort(400, description="קוד תחנה אינו תקין")
    return value


def line_number(value: str) -> str:
    if not _LINE_NUMBER.match(value):
        abort(400, description="מספר קו אינו תקין")
    return value


def latitude(value: Optional[float]) -> float:
    if value is None or not (-90.0 <= value <= 90.0):
        abort(400, description="קו רוחב אינו תקין")
    return value


def longitude(value: Optional[float]) -> float:
    if value is None or not (-180.0 <= value <= 180.0):
        abort(400, description="קו אורך אינו תקין")
    return value


def radius_m(value: int) -> int:
    if value <= 0:
        abort(400, description="רדיוס חייב להיות חיובי")
    if value > MAX_NEARBY_RADIUS_M:
        abort(400, description=f"רדיוס מקסימלי הוא {MAX_NEARBY_RADIUS_M} מטר")
    return value


def stops_limit(value: int) -> int:
    if value <= 0:
        abort(400, description="limit חייב להיות חיובי")
    return min(value, MAX_STOPS_LIMIT)


def bounding_box(min_lat: float, max_lat: float, min_lon: float, max_lon: float) -> None:
    """מאמת מסגרת גיאוגרפית — סדר נכון וגודל סביר."""
    if min_lat > max_lat or min_lon > max_lon:
        abort(400, description="גבולות המסגרת אינם בסדר הנכון")
    if (max_lat - min_lat) > MAX_BBOX_DEGREES or (max_lon - min_lon) > MAX_BBOX_DEGREES:
        abort(400, description=f"מסגרת גדולה מדי (מקסימום {MAX_BBOX_DEGREES} מעלות)")
