"""פרימיטיבים לקריאת XML של SIRI, משותפים למפענח ולחישוב המזהים."""

NS = "http://www.siri.org.uk/siri"


def tag(name: str) -> str:
    """שם אלמנט עם ה-namespace של SIRI, כפי ש-ElementTree מצפה לו."""
    return f"{{{NS}}}{name}"


def first_text(element, *names: str) -> str:
    """
    הטקסט של השדה הראשון שקיים מבין השמות.

    SIRI מגדיר כמה חלופות לאותו מידע (Arrival מול Departure, Expected מול
    Aimed), ולא כל מפעיל שולח את כולן.
    """
    for name in names:
        text = element.findtext(tag(name), "")
        if text:
            return text
    return ""
