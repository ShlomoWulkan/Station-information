"""
HTTP client לממשק SIRI של משרד התחבורה.
GET /2.8/xml?Key=<API_KEY>&MonitoringRef=<stop_code>
"""
import requests
import urllib3
from config import SIRI_BASE_URL, API_KEY

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def fetch_arrivals(station_code: str) -> str:
    """מחזיר XML של זמני הגעה לתחנה."""
    url = f"{SIRI_BASE_URL}/xml"
    response = requests.get(
        url,
        params={"Key": API_KEY, "MonitoringRef": station_code},
        timeout=10,
        verify=False,
    )
    response.raise_for_status()
    return response.text
