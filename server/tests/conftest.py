import sys
from pathlib import Path

import pytest

# השרת מיובא כמודולים שטוחים (config, cache, ...) ולא כחבילה, ולכן שורש השרת
# צריך להיות ב-sys.path כשמריצים pytest מכל מקום.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app  # noqa: E402


@pytest.fixture()
def client():
    """אפליקציה בלי טעינת GTFS — הבדיקות לא צריכות להוריד 140MB."""
    app = create_app(load_data=False)
    app.config.update(TESTING=True)
    return app.test_client()
