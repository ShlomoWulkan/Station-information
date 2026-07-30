"""
בדיקות למפענח SIRI.

זו הבדיקה החשובה ביותר בשרת: משרד התחבורה מאשר קריאות מ-IP של ה-VPS בלבד, ולכן
אין שום דרך אחרת לבדוק את הפיענוח ממכונת פיתוח בלי לפרוס לייצור.
"""

from xml_parser import parse_arrivals

NS = 'xmlns="http://www.siri.org.uk/siri"'


def _visit(line: str, dest: str = "", expected: str = "", aimed: str = "") -> str:
    times = ""
    if expected:
        times += f"<ExpectedArrivalTime>{expected}</ExpectedArrivalTime>"
    if aimed:
        times += f"<AimedArrivalTime>{aimed}</AimedArrivalTime>"
    return f"""<MonitoredStopVisit><MonitoredVehicleJourney>
        <PublishedLineName>{line}</PublishedLineName>
        <DestinationName>{dest}</DestinationName>
        <MonitoredCall>{times}</MonitoredCall>
      </MonitoredVehicleJourney></MonitoredStopVisit>"""


def _doc(*visits: str) -> str:
    return f"<Siri {NS}><ServiceDelivery><StopMonitoringDelivery>{''.join(visits)}" \
           "</StopMonitoringDelivery></ServiceDelivery></Siri>"


FUTURE = "2099-01-01T00:00:00+02:00"
LATER = "2099-06-01T00:00:00+02:00"


def test_extracts_line_and_destination():
    (row,) = parse_arrivals(_doc(_visit("5", "בת ים", expected=FUTURE)))
    assert row["lineNumber"] == "5"
    assert row["destination"] == "בת ים"


def test_does_not_claim_real_time():
    """
    היה כאן שדה isRealTime שנגזר מעצם קיומו של ExpectedArrivalTime.

    מדידה על 232 שורות בשמונה תחנות מצאה אותו true ב-100% מהן: משרד התחבורה
    שולח את השדה תמיד, וכשגם AimedArrivalTime קיים השניים זהים — כלומר הזמן
    הוא לוח הזמנים ולא תחזית. הבדיקה הזאת שומרת שהסימון לא יחזור בלי אות
    שבאמת משתנה. ראה CLAUDE.md.
    """
    rows = parse_arrivals(_doc(_visit("5", expected=FUTURE), _visit("6", aimed=FUTURE)))

    assert rows, "צריכות להיות נסיעות"
    for row in rows:
        assert "isRealTime" not in row
        assert "isTracked" not in row


def test_sorted_soonest_first():
    rows = parse_arrivals(_doc(_visit("far", expected=LATER), _visit("near", expected=FUTURE)))
    assert [r["lineNumber"] for r in rows] == ["near", "far"]


def test_unparseable_time_drops_the_row():
    """
    שורה בלי זמן קריא מושמטת ולא מוצגת עם זמן שגוי.

    קודם _minutes_until החזירה -1 גם לכשל וגם כזמן, כך שהמספר הזה שימש לשני
    דברים ושינוי פורמט היה מסתיר נסיעות בשקט.
    """
    rows = parse_arrivals(_doc(_visit("5", expected="NOT-A-DATE"), _visit("6", expected=FUTURE)))
    assert [r["lineNumber"] for r in rows] == ["6"]


def test_visit_with_no_time_at_all_is_dropped():
    assert parse_arrivals(_doc(_visit("5"))) == []


def test_past_arrival_clamps_to_zero():
    rows = parse_arrivals(_doc(_visit("5", expected="2000-01-01T00:00:00+02:00")))
    assert rows[0]["minutesUntilArrival"] == 0


def test_empty_document_is_empty_list():
    assert parse_arrivals(_doc()) == []
