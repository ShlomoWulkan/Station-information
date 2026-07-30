"""
נתיב אבחון. נרשם רק כש-DIAG_TOKEN מוגדר.

בלי טוקן הנתיב לא קיים כלל — אחרת כל אחד היה יכול להפעיל קריאות יוצאות
מהשרת ולראות שגיאות פנימיות.
"""
import hmac
import logging

from flask import Blueprint, abort, jsonify, request

from config import API_KEY, DIAG_TOKEN, SIRI_CA_BUNDLE, api_key_is_real
from services import probe

log = logging.getLogger(__name__)
diagnostics_bp = Blueprint("diagnostics", __name__)


def _require_token() -> None:
    supplied = request.args.get("token", "")
    # compare_digest ולא ==, כדי לא לדלוף את הטוקן דרך זמן ההשוואה.
    if not (DIAG_TOKEN and hmac.compare_digest(supplied, DIAG_TOKEN)):
        abort(404)


@diagnostics_bp.route("/diagnostics/upstream")
def upstream():
    """
    GET /diagnostics/upstream?token=<DIAG_TOKEN>

    בודק את הקישוריות למשרד התחבורה ומחזיר את סיבת הכשל, בלי המפתח.
    """
    _require_token()
    log.info("diagnostics: probing upstream services")

    return jsonify(
        {
            # מה שצריך להיות רשום אצל משרד התחבורה.
            "outboundIp": probe.outbound_ip(),
            # אורך בלבד — מאשר שהמפתח נטען מבלי לחשוף אותו.
            "apiKeyLength": len(API_KEY),
            # false פירושו שהמציין מ-.env.example נשאר במקומו.
            "apiKeyIsReal": api_key_is_real(),
            "caBundle": SIRI_CA_BUNDLE or None,
            # כתובת שגויה ב-.env נראית כמו תקלת רשת. resolves=false מזהה את
            # זה מיד, במקום לשלוח לחפש בעיות תעודה או חסימות IP.
            "siriHost": probe.resolve_siri_host(),
            # למה האימות נכשל, ו-PEM לבניית SIRI_CA_BUNDLE.
            "siriCertificate": probe.inspect_certificate(),
            "siri": probe.probe_siri(),
            "alerts": probe.probe_alerts(),
        }
    )
