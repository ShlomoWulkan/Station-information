"""בדיקות ל-/health, כולל דיווח הקשר למשרד התחבורה."""
import pytest

import config
from services import upstream_status


@pytest.fixture(autouse=True)
def _reset_status(monkeypatch):
    monkeypatch.setattr(upstream_status, "_reachable", None)
    monkeypatch.setattr(upstream_status, "_reason", None)
    # ה-.env של הסביבה עשוי להכיל את המציין מ-.env.example, ואז check() נעצר
    # לפני שהוא מגיע ל-SIRI. הבדיקות כאן בוחנות את נתיב הרשת, לא את השער.
    monkeypatch.setattr(config, "API_KEY", "test-key")


def test_reports_status_ok(client):
    assert client.get("/health").get_json()["status"] == "ok"


def test_siri_unknown_before_the_probe_finishes(client):
    """null ולא false — "עוד לא נבדק" אינו "לא זמין"."""
    body = client.get("/health").get_json()
    assert body["siriReachable"] is None
    assert body["siriReason"] is None


def test_siri_failure_is_reported(client, monkeypatch):
    """
    הפער שאיפשר ל-502 לחיות בשקט: /health דיווח רק על GTFS, ולכן "האם זמני
    הגעה עובדים" לא היה שאלה שנענית מבחוץ.
    """
    def boom(_code):
        raise ConnectionError("connection refused")

    monkeypatch.setattr(upstream_status, "fetch_arrivals", boom)
    upstream_status.check()

    body = client.get("/health").get_json()
    assert body["siriReachable"] is False
    assert "ConnectionError" in body["siriReason"]


def test_siri_reason_hides_the_api_key(client, monkeypatch):
    """הסיבה גלויה ב-/health, ולכן חייבת לעבור דרך redact."""
    monkeypatch.setattr(upstream_status, "PROBE_STATION", "1")
    monkeypatch.setattr("services.probe.API_KEY", "TOP-SECRET")

    def boom(_code):
        raise ConnectionError("url ?Key=TOP-SECRET failed")

    monkeypatch.setattr(upstream_status, "fetch_arrivals", boom)
    upstream_status.check()

    assert "TOP-SECRET" not in client.get("/health").get_json()["siriReason"]


def test_siri_success_is_reported(client, monkeypatch):
    monkeypatch.setattr(upstream_status, "fetch_arrivals", lambda _code: "<Siri/>")
    upstream_status.check()

    body = client.get("/health").get_json()
    assert body["siriReachable"] is True
    assert body["siriReason"] is None


def test_health_does_not_leak_upstream_urls(client):
    body = client.get("/health").get_json()
    assert not any("mot.gov.il" in str(v) for v in body.values())
