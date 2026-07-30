"""
בדיקות לנתיב האבחון.

הבדיקה החשובה כאן היא שהכלי שנועד לאבחן דליפה לא מדליף בעצמו: str() של חריגת
requests מכיל את ה-URL המלא, ובו ?Key=<המפתח>.
"""
import config
from services import probe


def test_redact_removes_the_api_key(monkeypatch):
    monkeypatch.setattr(probe, "API_KEY", "SUPER-SECRET-KEY")

    text = "HTTPSConnectionPool: url: /xml?Key=SUPER-SECRET-KEY&MonitoringRef=1"
    result = probe.redact(text)

    assert "SUPER-SECRET-KEY" not in result
    assert probe.REDACTED in result


def test_redact_is_safe_when_no_key_configured(monkeypatch):
    monkeypatch.setattr(probe, "API_KEY", "")
    assert probe.redact("nothing to hide") == "nothing to hide"


def test_route_absent_without_token(client):
    """ברירת המחדל: אין DIAG_TOKEN בבדיקות, ולכן הנתיב לא נרשם בכלל."""
    assert client.get("/diagnostics/upstream").status_code == 404


def test_route_absent_with_wrong_token(client):
    assert client.get("/diagnostics/upstream?token=guess").status_code == 404


def test_token_is_empty_by_default():
    """ברירת מחדל בטוחה — הנתיב לא נחשף אלא אם מגדירים אותו במפורש."""
    assert config.DIAG_TOKEN == ""


def test_attempt_reports_exception_without_leaking(monkeypatch):
    monkeypatch.setattr(probe, "API_KEY", "LEAKY")

    def boom(*_args, **_kwargs):
        raise ValueError("failed for url ?Key=LEAKY")

    monkeypatch.setattr(probe.requests, "get", boom)

    result = probe._attempt("https://example.test", {"Key": "LEAKY"}, 1, True)

    assert result["outcome"] == "exception"
    assert result["type"] == "ValueError"
    assert "LEAKY" not in result["message"]
