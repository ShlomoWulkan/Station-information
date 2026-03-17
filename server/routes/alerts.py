from flask import Blueprint, jsonify
import requests

from services.alerts_client import fetch_alerts
import cache
from config import CACHE_TTL_ALERTS

alerts_bp = Blueprint("alerts", __name__)


@alerts_bp.route("/alerts")
def get_alerts():
    """
    GET /alerts

    מחזיר התראות שירות פעילות מממשק GTFS-Realtime.
    תשובה לדוגמה:
    [
      { "id": "1", "header": "עיכובים בקו 5", "description": "...",
        "routes": ["5"], "stops": [] },
      ...
    ]
    """
    cached = cache.get("alerts", CACHE_TTL_ALERTS)
    if cached is not None:
        return jsonify(cached)

    try:
        data = fetch_alerts()
    except requests.HTTPError as e:
        return jsonify({"error": f"שגיאת API: {e.response.status_code}"}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 502

    cache.set("alerts", data)
    return jsonify(data)
