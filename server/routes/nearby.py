from flask import Blueprint, jsonify, request, abort

from services.gtfs_client import get_nearby
import cache
from config import CACHE_TTL_ALERTS

nearby_bp = Blueprint("nearby", __name__)


@nearby_bp.route("/nearby")
def get_nearby_route():
    """
    GET /nearby?lat=32.08&lon=34.78&radius=500

    מחזיר תחנות בטווח radius מטרים (ברירת מחדל 500).
    תשובה לדוגמה:
    [
      { "id": "34512", "name": "הרצל / דיזנגוף", "code": "34512",
        "lat": 32.08, "lon": 34.78, "distance": 45 },
      ...
    ]
    """
    lat    = request.args.get("lat",    type=float)
    lon    = request.args.get("lon",    type=float)
    radius = request.args.get("radius", type=int, default=100)

    if lat is None or lon is None:
        abort(400, description="נדרשים הפרמטרים lat ו-lon")

    cache_key = f"nearby:{round(lat, 4)}:{round(lon, 4)}:{radius}"
    cached = cache.get(cache_key, CACHE_TTL_ALERTS)
    if cached is not None:
        return jsonify(cached)

    try:
        data = get_nearby(lat, lon, radius)
    except Exception as e:
        return jsonify({"error": str(e)}), 502

    cache.set(cache_key, data)
    return jsonify(data)
