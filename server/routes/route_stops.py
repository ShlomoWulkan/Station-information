from flask import Blueprint, jsonify
from services.gtfs_client import get_route_stops, routes_ready

route_stops_bp = Blueprint("route_stops", __name__)


@route_stops_bp.route("/route-stops/<station_code>/<line_number>")
def get(station_code: str, line_number: str):
    """
    GET /route-stops/<station_code>/<line_number>
    מחזיר תחנות הקו הספציפי שעובר בתחנה זו.
    [{ "id", "code", "name", "lat", "lon", "sequence", "isCurrent" }, ...]
    """
    if not routes_ready():
        return jsonify({"error": "קווים עדיין נטענים, נסה שוב בעוד כמה דקות"}), 503

    stops = get_route_stops(station_code, line_number)
    if not stops:
        return jsonify({"error": f"לא נמצא קו {line_number} בתחנה {station_code}"}), 404
    return jsonify(stops)
