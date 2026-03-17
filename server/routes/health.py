from flask import Blueprint, jsonify
from config import API_KEY, SIRI_BASE_URL, ALERTS_URL
from services.gtfs_client import stops_count

health_bp = Blueprint("health", __name__)


@health_bp.route("/health")
def get_health():
    """
    GET /health

    בדיקת חיות השרת.
    { "status": "ok", "api_configured": true, "gtfs_stops_loaded": 45000 }
    """
    return jsonify({
        "status":           "ok",
        "api_configured":   bool(API_KEY),
        "siri_url":         SIRI_BASE_URL,
        "alerts_url":       ALERTS_URL,
        "gtfs_stops_loaded": stops_count(),
    })
