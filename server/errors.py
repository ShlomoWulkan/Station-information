"""
מטפלי שגיאות גלובליים.

שני דברים שהיו שבורים:
  1. נתיבים החזירו {"error": str(e)} ללקוח, כלומר טקסט חריגה פנימי — שיכול
     להכיל נתיבי קבצים או URL עם המפתח בתוכו. הפרטים הולכים ללוג בלבד.
  2. 404 ו-500 החזירו דף HTML של Flask ללקוח שמצפה ל-JSON.
"""
import logging

from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException

log = logging.getLogger(__name__)

UPSTREAM_ERROR = "שירות המידע אינו זמין כרגע. נסה שוב בעוד מספר רגעים."
INTERNAL_ERROR = "תקלה בשרת."
NOT_FOUND = "הנתיב המבוקש אינו קיים."


class UpstreamError(Exception):
    """כשל בקריאה לשירות חיצוני (SIRI, GTFS-RT)."""


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(UpstreamError)
    def _upstream(e: UpstreamError):
        log.warning("upstream failure: %s", e)
        return jsonify({"error": UPSTREAM_ERROR}), 502

    @app.errorhandler(404)
    def _not_found(_e):
        return jsonify({"error": NOT_FOUND}), 404

    @app.errorhandler(HTTPException)
    def _http(e: HTTPException):
        # abort(400, description=...) — התיאור נכתב על ידינו ולכן בטוח להחזיר.
        return jsonify({"error": e.description}), e.code or 500

    @app.errorhandler(Exception)
    def _unhandled(e: Exception):
        log.exception("unhandled error: %s", e)
        return jsonify({"error": INTERNAL_ERROR}), 500
