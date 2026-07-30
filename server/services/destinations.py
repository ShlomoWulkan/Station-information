"""
תרגום יעד הנסיעה משם קוד לשם תחנה.

SIRI של משרד התחבורה שולח `DestinationRef` — קוד תחנה — ולא `DestinationName`.
הפרסר חיפש את השם, לא מצא אותו, והחזיר מחרוזת ריקה בכל שורה; העמודה במסך
הייתה ריקה תמיד. התרגום נעשה כאן ולא ב-xml_parser כדי שהפיענוח יישאר טהור
ובלי תלות בנתוני GTFS.
"""
import logging

from services.gtfs_client import get_stop_name

log = logging.getLogger(__name__)


def resolve(arrivals: list[dict]) -> list[dict]:
    """
    ממלא `destination` מתוך `destinationRef`, ומסיר את ה-ref מהתשובה.

    ה-ref עצמו הוא פרט פנימי של SIRI ואין ללקוח שימוש בו.
    """
    unresolved = 0

    for arrival in arrivals:
        ref = arrival.pop("destinationRef", "")

        # אם SIRI כן שלח שם — הוא עדיף על תרגום שלנו.
        if arrival.get("destination"):
            continue

        if not ref:
            continue

        name = get_stop_name(ref)
        if name:
            arrival["destination"] = name
        else:
            # תחנת יעד שאינה ב-GTFS שנטען, או ש-GTFS עוד לא מוכן.
            unresolved += 1

    if unresolved:
        log.info("%d יעדים לא נמצאו ב-GTFS", unresolved)

    return arrivals
