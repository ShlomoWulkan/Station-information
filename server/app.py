"""
שרת proxy לממשק משרד התחבורה (SIRI API).
מריץ: python app.py
דורש: pip install flask requests
"""
from flask import Flask, jsonify, request, abort
import requests

from config import API_URL, API_KEY, PORT, HOST, CACHE_TTL, RADIUS_METERS
from xml_parser import parse_arrivals, parse_stations
import cache

app = Flask(__name__)


def _siri_request(body: str) -> str:
    """שולח בקשת POST ל-API ומחזיר XML."""
    resp = requests.post(
        API_URL,
        data=body,
        headers={"Content-Type": "application/xml", "Authorization": API_KEY},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.text


def _arrivals_body(station_code: str) -> str:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Siri xmlns="http://www.siri.org.uk/siri" version="2.0">
  <ServiceRequest>
    <StopMonitoringRequest>
      <MonitoringRef>{station_code}</MonitoringRef>
    </StopMonitoringRequest>
  </ServiceRequest>
</Siri>"""


def _nearby_body(lat: float, lon: float) -> str:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Siri xmlns="http://www.siri.org.uk/siri" version="2.0">
  <ServiceRequest>
    <StopDiscoveryRequest>
      <BoundingBox>
        <UpperLeft><Longitude>{lon - 0.001}</Longitude><Latitude>{lat + 0.001}</Latitude></UpperLeft>
        <LowerRight><Longitude>{lon + 0.001}</Longitude><Latitude>{lat - 0.001}</Latitude></LowerRight>
      </BoundingBox>
    </StopDiscoveryRequest>
  </ServiceRequest>
</Siri>"""


@app.route("/arrivals/<station_code>")
def arrivals(station_code: str):
    """GET /arrivals/34512 — זמני הגעה לתחנה."""
    cached = cache.get(f"arr:{station_code}", CACHE_TTL)
    if cached is not None:
        return jsonify(cached)

    try:
        xml = _siri_request(_arrivals_body(station_code))
        data = parse_arrivals(xml)
    except Exception as e:
        return jsonify({"error": str(e)}), 502

    cache.set(f"arr:{station_code}", data)
    return jsonify(data)


@app.route("/nearby")
def nearby():
    """GET /nearby?lat=32.08&lon=34.78 — תחנות קרובות."""
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    if lat is None or lon is None:
        abort(400, "נדרשים lat ו-lon")

    key = f"nearby:{round(lat,4)}:{round(lon,4)}"
    cached = cache.get(key, CACHE_TTL)
    if cached is not None:
        return jsonify(cached)

    try:
        xml = _siri_request(_nearby_body(lat, lon))
        data = parse_stations(xml)
    except Exception as e:
        return jsonify({"error": str(e)}), 502

    cache.set(key, data)
    return jsonify(data)


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    print(f"🚌 שרת מידע תחנה מופעל על {HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=False)
