"""
HTTP client לממשק SIRI של משרד התחבורה.
אחראי על בניית בקשות XML ושליחתן ל-API.
"""
import requests
from config import API_URL, API_KEY, RADIUS_METERS


def _post(xml_body: str) -> str:
    """שולח בקשת POST ל-API ומחזיר XML גולמי."""
    response = requests.post(
        API_URL,
        data=xml_body.encode("utf-8"),
        headers={
            "Content-Type": "application/xml; charset=utf-8",
            "Authorization": f"ApiKey {API_KEY}",
        },
        timeout=10,
    )
    response.raise_for_status()
    return response.text


def fetch_arrivals(station_code: str) -> str:
    """מחזיר XML של זמני הגעה לתחנה."""
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Siri xmlns="http://www.siri.org.uk/siri" version="2.0">
  <ServiceRequest>
    <StopMonitoringRequest version="2.0">
      <MonitoringRef>{station_code}</MonitoringRef>
      <MaximumStopVisits>10</MaximumStopVisits>
    </StopMonitoringRequest>
  </ServiceRequest>
</Siri>"""
    return _post(xml)


def fetch_nearby(lat: float, lon: float) -> str:
    """מחזיר XML של תחנות קרובות לפי קואורדינטות."""
    delta = RADIUS_METERS / 111_000  # מטרים → מעלות (קירוב)
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Siri xmlns="http://www.siri.org.uk/siri" version="2.0">
  <ServiceRequest>
    <StopDiscoveryRequest version="2.0">
      <BoundingBox>
        <UpperLeft>
          <Longitude>{lon - delta}</Longitude>
          <Latitude>{lat + delta}</Latitude>
        </UpperLeft>
        <LowerRight>
          <Longitude>{lon + delta}</Longitude>
          <Latitude>{lat - delta}</Latitude>
        </LowerRight>
      </BoundingBox>
    </StopDiscoveryRequest>
  </ServiceRequest>
</Siri>"""
    return _post(xml)
