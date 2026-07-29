"""
לקוח GTFS סטטי — תחנות, קווים לתחנה, ותחנות המסלול. אינו דורש מפתח API.

היה קובץ אחד בן 258 שורות עם אחד־עשר גלובלים משתנים.
"""
from . import queries, store
from .models import RoutesIndex, StopsIndex

__all__ = ["queries", "store", "RoutesIndex", "StopsIndex"]
