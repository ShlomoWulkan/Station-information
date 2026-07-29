from flask import Flask

from .alerts import alerts_bp
from .arrivals import arrivals_bp
from .health import health_bp
from .nearby import nearby_bp
from .route_stops import route_stops_bp
from .routes import routes_bp
from .station import station_bp
from .stops import stops_bp

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
