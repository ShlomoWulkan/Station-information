"""
בדיקות ל-API: אימות קלט, קודי סטטוס, ו-JSON בכל תשובה.

הבדיקות האלה לא צריכות נתוני GTFS — הן בודקות את השער, שנסגר לפני שהבקשה
מגיעה לנתונים או לשירות חיצוני.
"""
import pytest


def test_health_reports_status(client):
    body = client.get("/health").get_json()
    assert body["status"] == "ok"


def test_health_does_not_leak_upstream_urls(client):
    """הכתובות היו כאן. זה מידע פנימי שאין סיבה לפרסם."""
    body = client.get("/health").get_json()
    assert not any("mot.gov.il" in str(v) for v in body.values())


def test_unknown_path_returns_json_not_html(client):
    """קודם Flask החזיר דף HTML ללקוח שמצפה ל-JSON."""
    response = client.get("/no-such-route")
    assert response.status_code == 404
    assert response.is_json
    assert "error" in response.get_json()


@pytest.mark.parametrize("code", ["abc", "", "12345678901234", "1;drop", "../etc"])
def test_arrivals_rejects_bad_station_code(client, code):
    """נדחה לפני יציאה לרשת, ולכן בדיק גם בלי גישה ל-SIRI."""
    assert client.get(f"/arrivals/{code}").status_code in (400, 404)


def test_nearby_requires_coordinates(client):
    assert client.get("/nearby").status_code == 400


@pytest.mark.parametrize(
    "query",
    ["lat=999&lon=34", "lat=32&lon=999", "lat=-91&lon=0", "lat=0&lon=181"],
)
def test_nearby_rejects_out_of_range_coordinates(client, query):
    assert client.get(f"/nearby?{query}").status_code == 400


def test_nearby_caps_radius(client):
    """
    בלי תקרה, radius=99999999 הכריח סריקת haversine על ~35 אלף תחנות והחזיר
    את כולן.
    """
    response = client.get("/nearby?lat=32.08&lon=34.78&radius=99999999")
    assert response.status_code == 400


def test_nearby_rejects_non_positive_radius(client):
    assert client.get("/nearby?lat=32.08&lon=34.78&radius=0").status_code == 400
