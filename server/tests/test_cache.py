"""בדיקות ל-cache: תוקף, חסם גודל, ובטיחות threads."""
import threading

import pytest

import cache
from config import CACHE_MAX_ENTRIES


@pytest.fixture(autouse=True)
def _clean():
    cache.clear()
    yield
    cache.clear()


def test_returns_stored_value_within_ttl():
    cache.put("k", [1, 2])
    assert cache.get("k", 60) == [1, 2]


def test_missing_key_is_none():
    assert cache.get("nope", 60) is None


def test_zero_ttl_never_serves():
    """ttl=0 פירושו "לא לשמור". קודם ההשוואה הייתה > ולכן ערך מאותו tick הוחזר."""
    cache.put("k", "v")
    assert cache.get("k", 0) is None


def test_expired_entry_is_dropped():
    cache.put("k", "v")
    cache.get("k", 0)
    assert cache.size() == 0


def test_size_is_bounded():
    """
    תיקון דליפה, לא ניקיון: מפתח ה-cache של /nearby מכיל קואורדינטות, ולכן לקוח
    שמזרים נקודות אקראיות הגדיל את המילון בלי גבול עד שהתהליך נהרג.
    """
    for i in range(CACHE_MAX_ENTRIES + 500):
        cache.put(f"k{i}", i)

    assert cache.size() == CACHE_MAX_ENTRIES
    assert cache.get("k0", 60) is None, "הישן ביותר היה צריך להיות מפונה"
    assert cache.get(f"k{CACHE_MAX_ENTRIES + 499}", 60) is not None


def test_reading_refreshes_lru_position():
    for i in range(CACHE_MAX_ENTRIES):
        cache.put(f"k{i}", i)

    cache.get("k0", 60)  # מרענן את המקום בתור
    cache.put("new", 1)

    assert cache.get("k0", 60) == 0, "מפתח שנקרא לא היה צריך להיות מפונה ראשון"


def test_concurrent_access_does_not_raise():
    """תחת gunicorn עם threads זה לא תיאורטי — קודם לא היה מנעול בכלל."""
    errors: list[Exception] = []

    def hammer(n: int) -> None:
        try:
            for i in range(2000):
                cache.put(f"t{n}-{i}", i)
                cache.get(f"t{n}-{i}", 60)
                cache.get(f"t{n}-{i}", 0)  # מפקיע — הנתיב שהתפוצץ ב-KeyError
        except Exception as e:  # noqa: BLE001
            errors.append(e)

    threads = [threading.Thread(target=hammer, args=(n,)) for n in range(8)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert not errors, errors[:3]
