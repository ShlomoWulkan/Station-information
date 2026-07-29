from flask import Blueprint, jsonify

import cache
from config import API_KEY
from services.gtfs_client import routes_ready, stops_count

health_bp = Blueprint("health", __name__)


@health_bp.route("/health")
def get_health():
    """
    GET /health

    { "status": "ok", "apiKeyConfigured": true,
      "gtfsStopsLoaded": 45000, "routesReady": true, "cacheEntries": 12 }

    לא חושף את כתובות שירותי המקור — הן היו כאן וזה מידע פנימי מיותר.
    """
    return jsonify(
        {
            "status": "ok",
            "apiKeyConfigured": bool(API_KEY),
            "gtfsStopsLoaded": stops_count(),
            "routesReady": routes_ready(),
            "cacheEntries": cache.size(),
        }
    )
