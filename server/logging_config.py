"""
הגדרת לוגים.

הפרויקט השתמש ב-print בכל מקום. תחת systemd זה הגיע ל-journal בלי חותמות זמן,
בלי רמות, ובלי דרך להנמיך רעש. הכשל הכי בעייתי היה בטעינת קווים ברקע: הוא
הודפס ל-stdout ונעלם, וכל /routes החזיר 503 בלי שאף אחד ידע למה.
"""
import logging
import os

_FORMAT = "%(asctime)s %(levelname)-7s %(name)s — %(message)s"


def configure_logging() -> None:
    level = os.getenv("LOG_LEVEL", "INFO").upper()

    logging.basicConfig(
        level=getattr(logging, level, logging.INFO),
        format=_FORMAT,
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # urllib3 מדבר יותר מדי ב-DEBUG, וההודעות שלו לא שלנו.
    logging.getLogger("urllib3").setLevel(logging.WARNING)
