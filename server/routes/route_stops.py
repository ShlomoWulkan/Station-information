from flask import Blueprint, jsonify

import validators
from services.gtfs_client import get_route_stops, routes_ready

from .routes import WARMING_UP

route_stops_bp = Blueprint("route_stops", __name__)


@route_stops_bp.route("/route-stops/<station_code>/<line_number>")
def get_route_stops_route(station_code: str, line_number: str):
    """
    GET /route-stops/<station_code>/<line_number>

    [{ "id", "code", "name", "lat", "lon", "sequence", "isCurrent" }, ...]
    """
    code = validators.station_code(station_code)
    line = validators.line_number(line_number)

    if not routes_ready():
        return jsonify({"error": WARMING_UP}), 503

    stops = get_route_stops(code, line)
    if not stops:
        return jsonify({"error": f"לא נמצא קו {line} בתחנה {code}"}), 404
    return jsonify(stops)
