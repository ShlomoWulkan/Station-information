from flask import Blueprint, jsonify
from services.gtfs_client import get_route_stops

route_stops_bp = Blueprint("route_stops", __name__)


@route_stops_bp.route("/route-stops/<line_number>")
def get(line_number: str):
    """
    GET /route-stops/<line_number>
    מחזיר רשימת תחנות לקו לפי סדר.
    [{ "id", "code", "name", "lat", "lon", "sequence" }, ...]
    """
    stops = get_route_stops(line_number)
    if not stops:
        return jsonify({"error": f"לא נמצאו תחנות לקו {line_number}"}), 404
    return jsonify(stops)
