from flask import Blueprint, jsonify

import validators
from services.gtfs_client import get_stop_by_code

station_bp = Blueprint("station", __name__)


@station_bp.route("/station/<station_code>")
def get_station(station_code: str):
    """
    GET /station/<station_code>

    { "id": "...", "code": "1111", "name": "שם התחנה", "lat": 32.0, "lon": 34.8 }
    """
    code = validators.station_code(station_code)

    stop = get_stop_by_code(code)
    if stop is None:
        return jsonify({"error": f"תחנה {code} לא נמצאה"}), 404
    return jsonify(stop)
