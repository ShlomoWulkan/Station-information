import logging

from flask import Blueprint, jsonify
from requests import RequestException

import cache
import validators
from config import CACHE_TTL_ARRIVALS
from errors import UpstreamError
from services import destinations
from services.siri_client import fetch_arrivals
from xml_parser import parse_arrivals

log = logging.getLogger(__name__)
arrivals_bp = Blueprint("arrivals", __name__)


@arrivals_bp.route("/arrivals/<station_code>")
def get_arrivals(station_code: str):
    """
    GET /arrivals/<station_code>

    [{ "lineNumber": "5", "destination": "בת ים",
       "minutesUntilArrival": 3, "isRealTime": true }, ...]
    """
    code = validators.station_code(station_code)

    cache_key = f"arr:{code}"
    cached = cache.get(cache_key, CACHE_TTL_ARRIVALS)
    if cached is not None:
        return jsonify(cached)

    try:
        # SIRI נותן קוד תחנת יעד; השם מגיע מ-GTFS.
        data = destinations.resolve(parse_arrivals(fetch_arrivals(code)))
    except RequestException as e:
        # ההודעה ללקוח גנרית — str(e) מכיל את ה-URL, ובו המפתח.
        raise UpstreamError(f"SIRI request failed for {code}: {e}") from e
    except ValueError as e:
        raise UpstreamError(f"SIRI returned unparseable XML for {code}: {e}") from e

    cache.put(cache_key, data)
    return jsonify(data)
