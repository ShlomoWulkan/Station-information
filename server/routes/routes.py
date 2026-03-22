from flask import Blueprint, jsonify
import requests

from services.siri_client import fetch_arrivals
from xml_parser import parse_arrivals
import cache
from config import CACHE_TTL_ROUTES

routes_bp = Blueprint("routes", __name__)


@routes_bp.route("/routes/<station_code>")
def get_routes(station_code: str):
    """
    GET /routes/<station_code>
    מחזיר רשימת קווים ייחודיים העוברים בתחנה.
    [{ "lineNumber": "5", "destination": "בת ים" }, ...]
    """
    cache_key = f"routes:{station_code}"
    cached = cache.get(cache_key, CACHE_TTL_ROUTES)
    if cached is not None:
        return jsonify(cached)

    try:
        xml  = fetch_arrivals(station_code)
        arrivals = parse_arrivals(xml)
    except requests.HTTPError as e:
        return jsonify({"error": f"שגיאת API: {e.response.status_code}"}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 502

    # קווים ייחודיים לפי מספר קו + יעד
    seen = set()
    unique: list[dict] = []
    for a in arrivals:
        key = (a["lineNumber"], a["destination"])
        if key not in seen:
            seen.add(key)
            unique.append({"lineNumber": a["lineNumber"], "destination": a["destination"]})

    unique.sort(key=lambda r: r["lineNumber"])
    cache.set(cache_key, unique)
    return jsonify(unique)
