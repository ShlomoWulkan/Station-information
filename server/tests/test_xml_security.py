"""
בדיקות אבטחה לפיענוח ה-XML.

ה-XML מגיע מגורם חיצוני, ולכן defusedxml ולא ElementTree של הספרייה התקנית.
"""
import pytest

from xml_parser import parse_arrivals


def test_malformed_xml_raises_value_error():
    with pytest.raises(ValueError):
        parse_arrivals("<not closed")


def test_entity_expansion_is_blocked():
    """
    billion laughs. ה-XML מגיע מגורם חיצוני, ולכן defusedxml ולא ElementTree.
    """
    bomb = (
        '<?xml version="1.0"?><!DOCTYPE x ['
        '<!ENTITY a "aaaaaaaaaa">'
        '<!ENTITY b "&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;">'
        ']><x>&b;</x>'
    )
    with pytest.raises(ValueError):
        parse_arrivals(bomb)
