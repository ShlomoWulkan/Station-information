"""
בדיקות ליעד הנסיעה.

ה-XML כאן הוא תגובה אמיתית מ-moran.mot.gov.il לתחנה 42197. הוא נשמר כ-fixture
כי הבאג היה בדיוק אי-התאמה בין מה שהפרסר חיפש (DestinationName) לבין מה
שמשרד התחבורה שולח (DestinationRef), והוא עבר בשקט: המסך פשוט הציג עמודה
ריקה בכל שורה.
"""
from services import destinations
from xml_parser import parse_arrivals

REAL_RESPONSE = """<Siri xmlns="http://www.siri.org.uk/siri"><ServiceDelivery>
<StopMonitoringDelivery version="2.8">
<ResponseTimestamp>2026-07-30T19:14:44+03:00</ResponseTimestamp><Status>true</Status>
<MonitoredStopVisit>
  <RecordedAtTime>2026-07-30T03:31:21+03:00</RecordedAtTime>
  <ItemIdentifier>1026641417</ItemIdentifier>
  <MonitoringRef>42197</MonitoringRef>
  <MonitoredVehicleJourney>
    <LineRef>27978</LineRef><DirectionRef>2</DirectionRef>
    <FramedVehicleJourneyRef><DataFrameRef>2026-07-30</DataFrameRef>
      <DatedVehicleJourneyRef>585399014</DatedVehicleJourneyRef></FramedVehicleJourneyRef>
    <PublishedLineName>22</PublishedLineName>
    <OperatorRef>3</OperatorRef>
    <DestinationRef>49977</DestinationRef>
    <VehicleRef>23290002</VehicleRef>
    <MonitoredCall>
      <StopPointRef>42197</StopPointRef><Order>7</Order>
      <AimedArrivalTime>2099-07-30T19:39:00+03:00</AimedArrivalTime>
      <ExpectedArrivalTime>2099-07-30T19:39:00+03:00</ExpectedArrivalTime>
    </MonitoredCall>
  </MonitoredVehicleJourney>
</MonitoredStopVisit>
</StopMonitoringDelivery></ServiceDelivery></Siri>"""


def test_parses_the_real_response():
    (row,) = parse_arrivals(REAL_RESPONSE)
    assert row["lineNumber"] == "22"


def test_uses_item_identifier_from_the_real_response():
    (row,) = parse_arrivals(REAL_RESPONSE)
    assert row["id"] == "1026641417"


def test_extracts_destination_ref():
    """זה השדה שמשרד התחבורה שולח בפועל. DestinationName לא קיים בתגובה."""
    (row,) = parse_arrivals(REAL_RESPONSE)
    assert row["destinationRef"] == "49977"
    assert row["destination"] == ""


def test_resolve_fills_the_name_from_gtfs(monkeypatch):
    monkeypatch.setattr(destinations, "get_stop_name", lambda ref: "תחנה מרכזית" )

    (row,) = destinations.resolve(parse_arrivals(REAL_RESPONSE))

    assert row["destination"] == "תחנה מרכזית"


def test_resolve_removes_the_ref_from_the_response():
    """פרט פנימי של SIRI; אין ללקוח שימוש בו."""
    (row,) = destinations.resolve(parse_arrivals(REAL_RESPONSE))
    assert "destinationRef" not in row


def test_unknown_stop_leaves_destination_empty(monkeypatch):
    """תחנת יעד שאינה ב-GTFS, או GTFS שעוד לא נטען — לא קורסים."""
    monkeypatch.setattr(destinations, "get_stop_name", lambda ref: "")

    (row,) = destinations.resolve(parse_arrivals(REAL_RESPONSE))

    assert row["destination"] == ""


def test_existing_name_is_preferred_over_the_ref(monkeypatch):
    """אם SIRI כן ישלח שם ביום מן הימים, הוא עדיף על תרגום שלנו."""
    monkeypatch.setattr(destinations, "get_stop_name", lambda ref: "מ-GTFS")

    (row,) = destinations.resolve(
        [{"destination": "מ-SIRI", "destinationRef": "49977"}]
    )

    assert row["destination"] == "מ-SIRI"
