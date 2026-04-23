from .arrivals import arrivals_bp
from .nearby import nearby_bp
from .health import health_bp
from .alerts import alerts_bp
from .station import station_bp
from .stops import stops_bp
from .routes import routes_bp
from .route_stops import route_stops_bp


def register_routes(app):
    app.register_blueprint(arrivals_bp)
    app.register_blueprint(nearby_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(station_bp)
    app.register_blueprint(stops_bp)
    app.register_blueprint(routes_bp)
    app.register_blueprint(route_stops_bp)
