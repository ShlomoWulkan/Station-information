"""
בדיקות למזהה הייחודי של כל נסיעה.

הרקע: המסך השתמש במפתח שנבנה משדות תצוגה — קו, יעד ודקות. שני אוטובוסים של
אותו קו שמגיעים באותה דקה זה מצב לגיטימי, וכשהיעד ריק המפתח מתנוון לחלוטין,
ו-React מתלונן על מפתחות כפולים ועלול להשמיט או לשכפל שורות.
"""
from xml_parser import parse_arrivals

NS = 'xmlns="http://www.siri.org.uk/siri"'
FUTURE = "2099-01-01T00:00:00+02:00"
LATER = "2099-01-01T00:05:00+02:00"


def _visit(line: str, expected: str, item_id: str = "", vehicle: str = "") -> str:
    identifier = f"<ItemIdentifier>{item_id}</ItemIdentifier>" if item_id else ""
    vehicle_ref = f"<VehicleRef>{vehicle}</VehicleRef>" if vehicle else ""
    return f"""<MonitoredStopVisit>{identifier}<MonitoredVehicleJourney>
        <PublishedLineName>{line}</PublishedLineName>{vehicle_ref}
        <MonitoredCall><ExpectedArrivalTime>{expected}</ExpectedArrivalTime></MonitoredCall>
      </MonitoredVehicleJourney></MonitoredStopVisit>"""


def _doc(*visits: str) -> str:
    return (
        f"<Siri {NS}><ServiceDelivery><StopMonitoringDelivery>{''.join(visits)}"
        "</StopMonitoringDelivery></ServiceDelivery></Siri>"
    )


def test_every_arrival_has_an_id():
    rows = parse_arrivals(_doc(_visit("5", FUTURE)))
    assert rows[0]["id"]


def test_uses_item_identifier_when_present():
    (row,) = parse_arrivals(_doc(_visit("5", FUTURE, item_id="ITEM-7")))
    assert row["id"] == "ITEM-7"


def test_falls_back_to_vehicle_ref():
    (row,) = parse_arrivals(_doc(_visit("5", FUTURE, vehicle="BUS-42")))
    assert row["id"] == "BUS-42"


def test_falls_back_to_line_and_full_timestamp():
    """
    חותמת הזמן המלאה ולא הדקות המעוגלות — שתי נסיעות באותה דקה עדיין נבדלות.
    """
    (row,) = parse_arrivals(_doc(_visit("5", FUTURE)))
    assert row["id"] == f"5|{FUTURE}"


def test_same_line_same_minute_gets_distinct_ids():
    """המצב שנצפה בפועל: שתי נסיעות של קו 10 באותה דקה, בלי יעד."""
    rows = parse_arrivals(_doc(_visit("10", FUTURE), _visit("10", FUTURE)))

    assert len(rows) == 2
    assert rows[0]["id"] != rows[1]["id"]


def test_identical_item_identifiers_still_deduplicated():
    """ערובה אחרונה — גם אם המקור מחזיר מזהים זהים, אנחנו לא נחזיר."""
    rows = parse_arrivals(
        _doc(
            _visit("10", FUTURE, item_id="SAME"),
            _visit("10", LATER, item_id="SAME"),
        )
    )

    assert len({r["id"] for r in rows}) == len(rows)


def test_all_ids_unique_across_a_busy_stop():
    visits = [_visit(line, FUTURE) for line in ("10", "10", "10", "970", "970", "5")]
    rows = parse_arrivals(_doc(*visits))

    assert len({r["id"] for r in rows}) == len(rows) == 6
