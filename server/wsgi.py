"""
נקודת כניסה ל-WSGI לייצור.

    gunicorn --workers 1 --threads 8 --bind 127.0.0.1:5000 wsgi:app

worker אחד בכוונה: כל worker הוא תהליך נפרד עם עותק משלו של ~45 אלף תחנות
ושל ה-cache. יותר מאחד מכפיל את הזיכרון ומפצל את ה-cache. במקום זה threads,
ולכן המצב המשותף מוגן במנעולים.
"""
from app import create_app

app = create_app()
