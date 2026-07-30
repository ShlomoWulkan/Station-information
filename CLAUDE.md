# מידע תחנה

אפליקציית זמני הגעת אוטובוסים בישראל. עברית, RTL.

## מבנה

```
mobile/   Expo SDK 54 · React Native 0.81 · expo-router v6 · zustand · pnpm
server/   Flask · Python 3.9 · venv
docs/     SECRETS.md — טיפול במפתחות
```

`mobile/` מדבר רק עם `server/`. `server/` הוא proxy אל משרד התחבורה, והוא קיים
כדי שמפתח ה-SIRI לא יהיה באפליקציה — משם כל אחד היה מחלץ אותו מה-APK.

## הרצה

```powershell
# שרת
cd server; .\venv\Scripts\activate
python app.py

# אפליקציה
cd mobile; pnpm start
```

## בדיקות ולינטרים — להריץ לפני קומיט

```powershell
cd server;  .\venv\Scripts\python.exe -m pytest tests/ -q
cd server;  .\venv\Scripts\python.exe -m ruff check .
cd mobile;  pnpm exec tsc --noEmit
cd mobile;  pnpm exec eslint .
```

## אילוץ שחוזר על עצמו: ה-IP

**משרד התחבורה מאשר קריאות SIRI מ-204.168.150.129 בלבד.**

לכן `/arrivals` **לא יכול לעבוד ממכונת פיתוח**. שתי דרכים:

1. `EXPO_PUBLIC_API_URL` מצביע על השרת החי (הפשוט ביותר).
2. מנהרה: `ssh -L 5001:127.0.0.1:5000 <user>@204.168.150.129`, ואז
   `EXPO_PUBLIC_API_URL=http://127.0.0.1:5001`.

כל שאר הנתיבים (`/nearby`, `/stops`, `/station`, `/routes`, `/route-stops`)
עובדים מקומית — הם מ-GTFS הסטטי ואינם צריכים מפתח.

החלפת מכונה מחייבת רישום IP חדש מולם. ראה `docs/SECRETS.md`.

## כללי קוד

- **אף קובץ מעל 100 שורות.** סטיילים ל-`X.styles.ts` צמוד, לוגיקה ל-hook,
  תת-רכיבים ל-`features/`.
- **טקסט גלוי למשתמש נכנס ל-`constants/strings/`**, לא ל-JSX.
- **קבועים ל-`constants/config.ts`**, לא צרובים.
- קריאות רשת עוברות דרך `services/api/` בלבד, שעובר דרך `services/http/`.
  אין `fetch` ישיר במסך.
- שגיאות מוצגות דרך `toUserMessage`. מסך לא מנסח הודעות בעצמו.
- zustand: **סלקטור ממוקד** (`useFavorites(s => s.favorites)`), לא הרס של
  כל ה-store — אחרת כל שינוי מרנדר את כל הצרכנים.
- הערות מסבירות **למה**, לא מה. במיוחד כשהקוד נראה מוזר בכוונה.

## דברים שנשברו כאן פעם — לא לחזור עליהם

- **אין fallback לנתונים מזויפים.** מסך התחנה החליף כל כשל בזמני אוטובוס
  קבועים, והמשתמש יצא לחכות לאוטובוס שלא קיים. כשל מוצג ככשל.
- **אין `verify=False`.** הקריאה ל-SIRI נושאת את המפתח. אם יש בעיית תעודה —
  `SIRI_CA_BUNDLE`, לא כיבוי אימות.
- **אין `str(e)` ללקוח.** טקסט החריגה מכיל את ה-URL, ובו המפתח.
- **אין `catch {}` ריק.** ESLint חוסם.
- **אין `Date.now()` בזמן רינדור.** `useNow`.
- **כל פרמטר מהלקוח מוגבל.** `radius` ו-`limit` היו ללא תקרה, ובקשה אחת
  הכריחה סריקה על כל 35 אלף התחנות.
- **סודות רק ב-`.env`.** מפתח Maps נדחף פעם לרפו ציבורי.

## שרת

- `services/gtfs/` — האינדקסים. `store.py` מחזיק אותם ומפרסם בהשמה אטומית
  אחת, כי thread רקע כותב בזמן ש-threads של בקשות קוראים.
- `cache.py` — LRU עם TTL, מוגן במנעול וחסום בגודל.
- `validators.py` — כל אימות הקלט.
- `errors.py` — כל תשובה היא JSON, גם 404 ו-500.
- ייצור: gunicorn `--workers 1 --threads 8` מאחורי Caddy. worker אחד כי כל
  תהליך מחזיק עותק משלו של 35 אלף תחנות. ראה `server/deploy/README.md`.
