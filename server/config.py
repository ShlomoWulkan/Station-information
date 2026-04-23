import os
from dotenv import load_dotenv

load_dotenv()

SIRI_BASE_URL    = os.getenv("SIRI_BASE_URL", "https://api.mot.gov.il/v1/siri")
ALERTS_URL       = os.getenv("ALERTS_URL", "https://gtfs.mot.gov.il/ServiceAlerts/gtfs_rt_alerts.pb")
API_KEY          = os.getenv("API_KEY", "")
PORT             = int(os.getenv("PORT", 5000))
HOST             = os.getenv("HOST", "0.0.0.0")
CACHE_TTL        = 10   # שניות — זמני הגעה
CACHE_TTL_ALERTS = 300  # שניות — התראות שירות
CACHE_TTL_ROUTES = 300  # שניות — רשימת קווים (משתנה לאט)
