import logging

from flask import Flask

from config import DIAG_TOKEN

from .alerts import alerts_bp
from .arrivals import arrivals_bp
from .diagnostics import diagnostics_bp
from .health import health_bp
from .nearby import nearby_bp
from .route_stops import route_stops_bp
from .routes import routes_bp
from .station import station_bp
from .stops import stops_bp

log = logging.getLogger(__name__)

_BLUEPRINTS = (
    arrivals_bp,
    nearby_bp,
    health_bp,
    alerts_bp,
    station_bp,
    stops_bp,
    routes_bp,
    route_stops_bp,
)


def register_routes(app: Flask) -> None:
    for blueprint in _BLUEPRINTS:
        app.register_blueprint(blueprint)

    # נרשם רק כשיש טוקן: הנתיב מפעיל קריאות יוצאות וחושף שגיאות פנימיות.
    if DIAG_TOKEN:
        app.register_blueprint(diagnostics_bp)
        log.warning("נתיב האבחון /diagnostics פעיל — להסיר את DIAG_TOKEN בסיום")
