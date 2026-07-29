from flask import Blueprint, jsonify, request

import cache
import validators
from config import CACHE_TTL_NEARBY, DEFAULT_NEARBY_RADIUS_M
from services.gtfs_client import get_nearby

nearby_bp = Blueprint("nearby", __name__)


@nearby_bp.route("/nearby")
def get_nearby_route():
    """
    GET /nearby?lat=32.08&lon=34.78&radius=250

    [{ "id": "34512", "code": "34512", "name": "הרצל / דיזנגוף",
       "lat": 32.08, "lon": 34.78, "distance": 45 }, ...]
    """
    lat = validators.latitude(request.args.get("lat", type=float))
    lon = validators.longitude(request.args.get("lon", type=float))
    radius = validators.radius_m(
        request.args.get("radius", type=int, default=DEFAULT_NEARBY_RADIUS_M)
    )

    # עיגול המפתח מאחד בקשות מנקודות סמוכות, שאחרת היו כל אחת רשומה נפרדת.
    cache_key = f"nearby:{lat:.4f}:{lon:.4f}:{radius}"
    cached = cache.get(cache_key, CACHE_TTL_NEARBY)
    if cached is not None:
        return jsonify(cached)

    data = get_nearby(lat, lon, radius)
    cache.put(cache_key, data)
    return jsonify(data)
