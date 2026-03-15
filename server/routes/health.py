from flask import Blueprint, jsonify
from config import API_KEY

health_bp = Blueprint("health", __name__)


@health_bp.route("/health")
def get_health():
    """
    GET /health

    בדיקת חיות השרת.
    { "status": "ok", "api_configured": true }
    """
    return jsonify({
        "status": "ok",
        "api_configured": bool(API_KEY),
    })
