from flask import Blueprint, jsonify, request
from services.gtfs_client import get_stops_in_bounds

stops_bp = Blueprint("stops", __name__)


@stops_bp.route("/stops")
def get_stops():
    """
    GET /stops?min_lat=&max_lat=&min_lon=&max_lon=&limit=300

    מחזיר תחנות בתוך מסגרת גיאוגרפית (bounding box).
    """
    try:
        min_lat = float(request.args["min_lat"])
        max_lat = float(request.args["max_lat"])
        min_lon = float(request.args["min_lon"])
        max_lon = float(request.args["max_lon"])
        limit   = int(request.args.get("limit", 300))
    except (KeyError, ValueError):
        return jsonify({"error": "חסרים פרמטרים: min_lat, max_lat, min_lon, max_lon"}), 400

    results = get_stops_in_bounds(min_lat, max_lat, min_lon, max_lon, limit)
    return jsonify(results)
