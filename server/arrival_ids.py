"""
מזהה ייחודי לכל נסיעה בתגובת SIRI.

קיים כי המסך היה בונה מפתח משדות תצוגה — קו, יעד ודקות — וזה אינו ייחודי:
שני אוטובוסים של אותו קו שמגיעים באותה דקה זה מצב רגיל, וכשהיעד ריק המפתח
מתנוון לגמרי. React מתלונן על מפתחות כפולים ועלול להשמיט או לשכפל שורות.
"""
from siri_xml import first_text, tag


def journey_id(visit, journey, line: str, timestamp: str) -> str:
    """
    מזהה לנסיעה בודדת, ממה ש-SIRI כבר נותן.

    משרד התחבורה שולח `ItemIdentifier` בפועל, אז זה הנתיב הרגיל. הגיבוי נשען
    על חותמת הזמן **המלאה** ולא על הדקות המעוגלות, כדי ששתי נסיעות באותה דקה
    עדיין ייבדלו.
    """
    identifier = (
        visit.findtext(tag("ItemIdentifier"), "")
        or first_text(journey, "VehicleRef", "DatedVehicleJourneyRef")
        or journey.findtext(f".//{tag('DatedVehicleJourneyRef')}", "")
    )
    return identifier or f"{line}|{timestamp}"


def ensure_unique(rows: list) -> None:
    """
    מוסיף סיומת למזהים שחוזרים על עצמם. משנה את הרשימה במקום.

    זו הערובה בפועל: היא אינה תלויה בשאלה אילו שדות SIRI שלח, ולכן מפתחות
    כפולים לא יכולים לחזור גם אם הפורמט ישתנה.
    """
    seen: dict = {}
    for row in rows:
        base = row["id"]
        count = seen.get(base, 0)
        seen[base] = count + 1
        if count:
            row["id"] = f"{base}#{count}"
