import logging

from flask import Blueprint, jsonify
from requests import RequestException

import cache
from config import CACHE_TTL_ALERTS
from errors import UpstreamError
from services.alerts_client import fetch_alerts

log = logging.getLogger(__name__)
alerts_bp = Blueprint("alerts", __name__)


@alerts_bp.route("/alerts")
def get_alerts():
    """
    GET /alerts

    [{ "id": "1", "header": "עיכובים בקו 5", "description": "...",
       "routes": ["5"], "stops": [] }, ...]
    """
    cached = cache.get("alerts", CACHE_TTL_ALERTS)
    if cached is not None:
        return jsonify(cached)

    try:
        data = fetch_alerts()
    except RequestException as e:
        raise UpstreamError(f"alerts request failed: {e}") from e
    except Exception as e:
        # פיענוח protobuf כושל אינו RequestException.
        raise UpstreamError(f"alerts feed could not be parsed: {e}") from e

    cache.put("alerts", data)
    return jsonify(data)
