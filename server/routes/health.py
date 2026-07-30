from flask import Blueprint, jsonify

import cache
from config import api_key_is_real
from services import upstream_status
from services.gtfs_client import routes_ready, stops_count

health_bp = Blueprint("health", __name__)


@health_bp.route("/health")
def get_health():
    """
    GET /health

    { "status": "ok", "apiKeyConfigured": true, "gtfsStopsLoaded": 35245,
      "routesReady": true, "cacheEntries": 12,
      "siriReachable": true, "siriReason": null }

    siriReachable הוא התוצאה השמורה מבדיקת העלייה, לא קריאה חיה — אחרת בודק
    חיצוני היה מציף את משרד התחבורה. null = הבדיקה עוד לא הסתיימה.

    לא חושף את כתובות שירותי המקור; הן היו כאן וזה מידע פנימי מיותר.
    """
    siri = upstream_status.status()

    return jsonify(
        {
            "status": "ok",
            # false גם כשהמציין מ-.env.example נשאר במקומו — מחרוזת כזאת
            # עוברת bool() ולכן דווחה בעבר כמפתח תקין.
            "apiKeyConfigured": api_key_is_real(),
            "gtfsStopsLoaded": stops_count(),
            "routesReady": routes_ready(),
            "cacheEntries": cache.size(),
            "siriReachable": siri["reachable"],
            "siriReason": siri["reason"],
        }
    )
