from flask import Blueprint, jsonify

import validators
from services.gtfs_client import get_routes_for_station, routes_ready

routes_bp = Blueprint("routes", __name__)

WARMING_UP = "רשימת הקווים עדיין נטענת. נסה שוב בעוד כמה רגעים."


@routes_bp.route("/routes/<station_code>")
def get_routes(station_code: str):
    """
    GET /routes/<station_code>

    [{ "lineNumber": "5", "destination": "בת ים" }, ...]
    אינו דורש מפתח API — הנתונים מ-GTFS הסטטי.
    """
    code = validators.station_code(station_code)

    # 503 ולא 500: הנתונים נטענים ברקע בעלייה, וזה מצב חולף.
    if not routes_ready():
        return jsonify({"error": WARMING_UP}), 503

    return jsonify(get_routes_for_station(code))
