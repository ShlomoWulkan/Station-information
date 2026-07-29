from flask import Blueprint, abort, jsonify, request

import validators
from config import DEFAULT_STOPS_LIMIT
from services.gtfs_client import get_stops_in_bounds

stops_bp = Blueprint("stops", __name__)


@stops_bp.route("/stops")
def get_stops():
    """
    GET /stops?min_lat=&max_lat=&min_lon=&max_lon=&limit=300

    תחנות בתוך מסגרת גיאוגרפית, הקרובות למרכז המסגרת קודם.
    """
    try:
        min_lat = validators.latitude(request.args.get("min_lat", type=float))
        max_lat = validators.latitude(request.args.get("max_lat", type=float))
        min_lon = validators.longitude(request.args.get("min_lon", type=float))
        max_lon = validators.longitude(request.args.get("max_lon", type=float))
    except TypeError:
        abort(400, description="נדרשים min_lat, max_lat, min_lon, max_lon")

    validators.bounding_box(min_lat, max_lat, min_lon, max_lon)
    limit = validators.stops_limit(request.args.get("limit", type=int, default=DEFAULT_STOPS_LIMIT))

    return jsonify(get_stops_in_bounds(min_lat, max_lat, min_lon, max_lon, limit))
