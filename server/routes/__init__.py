from .arrivals import arrivals_bp
from .nearby import nearby_bp
from .health import health_bp
from .alerts import alerts_bp


def register_routes(app):
    app.register_blueprint(arrivals_bp)
    app.register_blueprint(nearby_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(alerts_bp)
