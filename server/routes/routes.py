from flask import Blueprint, jsonify
from services.gtfs_client import get_routes_for_station, routes_ready

routes_bp = Blueprint("routes", __name__)


@routes_bp.route("/routes/<station_code>")
def get_routes(station_code: str):
    """
    GET /routes/<station_code>
    מחזיר קווים לתחנה מ-GTFS — ללא API key.
    [{ "lineNumber": "5", "destination": "" }, ...]
    """
    if not routes_ready():
        return jsonify({"error": "קווים עדיין נטענים, נסה שוב בעוד כמה דקות"}), 503

    names = get_routes_for_station(station_code)
    return jsonify([{"lineNumber": n} for n in names])
