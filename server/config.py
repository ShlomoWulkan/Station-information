import os
from dotenv import load_dotenv

load_dotenv()

API_URL      = "https://api.mot.gov.il/v1/siri/ArrivalsAndDepartures"
API_KEY      = os.getenv("API_KEY", "")
PORT         = int(os.getenv("PORT", 5000))
HOST         = os.getenv("HOST", "0.0.0.0")
CACHE_TTL    = 30    # שניות
RADIUS_METERS = 100  # רדיוס חיפוש תחנות קרובות
