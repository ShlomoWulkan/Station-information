from flask import Blueprint, jsonify
import requests

from services.siri_client import fetch_arrivals
from xml_parser import parse_arrivals
import cache
from config import CACHE_TTL

arrivals_bp = Blueprint("arrivals", __name__)


@arrivals_bp.route("/arrivals/<station_code>")
def get_arrivals(station_code: str):
    """
    GET /arrivals/<station_code>

    מחזיר רשימת נסיעות קרובות לתחנה.
    תשובה לדוגמה:
    [
      { "lineNumber": "5", "destination": "בת ים", "minutesUntilArrival": 3, "isRealTime": true },
      ...
    ]
    """
    cache_key = f"arr:{station_code}"
    cached = cache.get(cache_key, CACHE_TTL)
    if cached is not None:
        return jsonify(cached)

    try:
        xml  = fetch_arrivals(station_code)
        data = parse_arrivals(xml)
    except requests.HTTPError as e:
        return jsonify({"error": f"שגיאת API: {e.response.status_code}"}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 502

    cache.set(cache_key, data)
    return jsonify(data)
