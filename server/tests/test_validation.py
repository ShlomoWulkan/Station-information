"""
בדיקות אימות קלט על /stops, /routes ו-/route-stops.

נדחים בשער, לפני שהבקשה מגיעה לנתונים או לשירות חיצוני, ולכן בדיקים בלי GTFS.
"""


def test_stops_requires_all_bounds(client):
    assert client.get("/stops?min_lat=32&max_lat=33").status_code == 400


def test_stops_rejects_reversed_bounds(client):
    response = client.get("/stops?min_lat=33&max_lat=32&min_lon=34&max_lon=35")
    assert response.status_code == 400


def test_stops_rejects_oversized_bounding_box(client):
    response = client.get("/stops?min_lat=0&max_lat=80&min_lon=0&max_lon=80")
    assert response.status_code == 400


def test_stops_clamps_limit_instead_of_failing(client):
    """limit גדול מדי מצומצם בשקט — בקשה סבירה עם מספר גדול אינה שגיאה."""
    response = client.get("/stops?min_lat=32&max_lat=32.1&min_lon=34&max_lon=34.1&limit=999999")
    assert response.status_code == 200
    assert isinstance(response.get_json(), list)


def test_routes_returns_503_while_warming_up(client):
    """
    ה-GTFS נטען ברקע. 503 ולא 500 — מצב חולף, והאפליקציה ממפה אותו להודעה
    "נסה שוב בעוד רגע" ולא לשגיאה.
    """
    response = client.get("/routes/12345")
    assert response.status_code == 503
    assert "error" in response.get_json()


def test_route_stops_returns_503_while_warming_up(client):
    assert client.get("/route-stops/12345/5").status_code == 503


def test_route_stops_rejects_bad_line_number(client):
    assert client.get("/route-stops/12345/" + "x" * 40).status_code == 400


def test_station_not_found_is_404_with_json(client):
    response = client.get("/station/9999999")
    assert response.status_code == 404
    assert "error" in response.get_json()
