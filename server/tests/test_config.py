"""
בדיקות לזיהוי מפתח שלא הוזן.

הרקע: ה-.env נוצר מהעתקת .env.example והמפתח מעולם לא מולא. bool() על
"YOUR_API_KEY_HERE" מחזיר True, ולכן /health דיווח apiKeyConfigured=true
בזמן ש-/arrivals לא יכול היה לעבוד — בדיוק במקום שאמור היה לתפוס את זה.
"""
import pytest

import config


@pytest.mark.parametrize(
    "value",
    ["YOUR_API_KEY_HERE", "your_api_key_here", "CHANGE_ME", "TODO", "", "   "],
)
def test_placeholders_are_not_real(monkeypatch, value):
    monkeypatch.setattr(config, "API_KEY", value)
    assert config.api_key_is_real() is False


@pytest.mark.parametrize("value", ["abc123", "SV978593", "a-real-looking-key-42"])
def test_real_values_pass(monkeypatch, value):
    monkeypatch.setattr(config, "API_KEY", value)
    assert config.api_key_is_real() is True


def test_health_reports_placeholder_as_not_configured(client, monkeypatch):
    monkeypatch.setattr(config, "API_KEY", "YOUR_API_KEY_HERE")
    assert client.get("/health").get_json()["apiKeyConfigured"] is False


def test_upstream_check_fails_fast_without_a_real_key(monkeypatch):
    """לא יוצאים לרשת בלי מפתח — השגיאה משם לא הייתה מרמזת על הסיבה."""
    from services import upstream_status

    monkeypatch.setattr(config, "API_KEY", "YOUR_API_KEY_HERE")

    def should_not_run(_code):
        raise AssertionError("לא אמורים לפנות ל-SIRI בלי מפתח")

    monkeypatch.setattr(upstream_status, "fetch_arrivals", should_not_run)

    assert upstream_status.check() is False
    assert "API_KEY" in upstream_status.status()["reason"]
