"""
מידע תחנה — שרת proxy לממשק SIRI של משרד התחבורה.

הרצה:
    source venv/bin/activate
    pip install -r requirements.txt
    python app.py
"""
from flask import Flask
from flask_cors import CORS

from config import HOST, PORT, API_KEY
from routes import register_routes


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)
    register_routes(app)
    return app


if __name__ == "__main__":
    app = create_app()
    print(f"🚌  שרת מידע תחנה פועל על http://{HOST}:{PORT}")
    print(f"   API key: {'✓ מוגדר' if API_KEY else '✗ חסר — הגדר API_KEY ב-.env'}")
    app.run(host=HOST, port=PORT, debug=True)
