"""
מידע תחנה — שרת proxy לממשק SIRI של משרד התחבורה.

השרת קיים כדי שמפתח ה-API לא יהיה באפליקציה, משם כל אחד היה מחלץ אותו מה-APK.

פיתוח:
    .\\venv\\Scripts\\activate
    pip install -r requirements.txt
    python app.py

ייצור: ראה server/deploy/README.md — gunicorn מאחורי Caddy, לא הקובץ הזה.
"""
import logging

from flask import Flask
from flask_cors import CORS

from config import DEBUG, HOST, PORT
from errors import register_error_handlers
from logging_config import configure_logging
from routes import register_routes
from services import upstream_status
from services.gtfs_client import load_stops

log = logging.getLogger(__name__)


def create_app(load_data: bool = True) -> Flask:
    """
    בונה את האפליקציה.

    load_data=False לבדיקות, שלא יורידו 100MB של GTFS.
    """
    configure_logging()

    app = Flask(__name__)
    # ה-API ציבורי וללא אימות, ולכן CORS פתוח אינו מחמיר את החשיפה. אם ייווסף
    # אימות או קוקיז — לצמצם ל-origins מפורשים.
    CORS(app)

    register_error_handlers(app)
    register_routes(app)

    if load_data:
        # נטען כאן ולא בבלוק __main__, אחרת gunicorn מעלה שרת בלי תחנות בכלל.
        load_stops()
        # כשל בקשר למשרד התחבורה יופיע בלוג מיד, במקום להתגלות רק כשמשתמש
        # לוחץ על תחנה. ברקע, כדי לא לעכב את שאר הנתיבים שאינם תלויים בו.
        upstream_status.check_in_background()

    return app


if __name__ == "__main__":
    app = create_app()
    log.info("שרת מידע תחנה פועל על http://%s:%s", HOST, PORT)
    if not DEBUG:
        log.info("שרת הפיתוח של Flask. לייצור השתמש ב-gunicorn — ראה deploy/README.md")
    # debug נשלט ב-FLASK_DEBUG ואינו קשיח: debug=True חושף קונסולת פייתון
    # אינטראקטיבית לכל מי שיגרום לשגיאה.
    app.run(host=HOST, port=PORT, debug=DEBUG)
