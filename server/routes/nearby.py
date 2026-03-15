from flask import Blueprint, jsonify, request, abort
import requests

from services.siri_client import fetch_nearby
from xml_parser import parse_stations
import cache
from config import CACHE_TTL

nearby_bp = Blueprint("nearby", __name__)


@nearby_bp.route("/nearby")
def get_nearby():
    """
    GET /nearby?lat=32.08&lon=34.78

    מחזיר תחנות בטווח RADIUS_METERS מהמיקום שהתקבל.
    תשובה לדוגמה:
    [
      { "id": "34512", "name": "הרצל / דיזנגוף", "code": "34512",
        "lat": 32.08, "lon": 34.78, "distance": 45 },
      ...
    ]
    """
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    if lat is None or lon is None:
        abort(400, description="נדרשים הפרמטרים lat ו-lon")

    cache_key = f"nearby:{round(lat, 4)}:{round(lon, 4)}"
    cached = cache.get(cache_key, CACHE_TTL)
    if cached is not None:
        return jsonify(cached)

    try:
        xml  = fetch_nearby(lat, lon)
        data = parse_stations(xml)
    except requests.HTTPError as e:
        return jsonify({"error": f"שגיאת API: {e.response.status_code}"}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 502

    cache.set(cache_key, data)
    return jsonify(data)
