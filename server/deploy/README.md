# פריסה

> **קרא קודם:** משרד התחבורה מאשר קריאות SIRI מ-**204.168.150.129** בלבד.
> מפתח ה-API קשור ל-IP הזה. החלפת מכונה מחייבת רישום IP חדש מולם — אם אחרי
> פריסה למכונה אחרת `/arrivals` יחזיר 401, זו הסיבה, והמפתח לא פג.
> ראה `docs/SECRETS.md`.

> **המכונה החיה מותקנת תחת השמות הישנים.** ההוראות כאן מתארות התקנה חדשה בשם
> `station-info`, אבל 204.168.150.129 הותקנה לפני שינוי השם: היוניט שם נקרא
> `midaa-tachana`, המשתמש `midaa`, והקוד ב-`/opt/midaa-tachana`. בעבודה על
> המכונה הקיימת — החלף בשמות האלה, במיוחד בפרק "עדכון" ובפקודות `journalctl`.

## מה רץ איפה

```
[אפליקציה]  ──HTTPS──>  [Caddy :443]  ──HTTP──>  [gunicorn 127.0.0.1:5000]  ──HTTPS──>  [mot.gov.il]
```

Caddy הוא היחיד שמאזין לאינטרנט. gunicorn מאזין ל-127.0.0.1 בלבד, ולכן `HOST`
בברירת מחדל הוא לוקאלי ולא `0.0.0.0`.

## 1. תת-דומיין

תעודת TLS מונפקת לשם, לא ל-IP חשוף. תת-דומיין DuckDNS חינמי ומספיק:

1. הירשם ב-duckdns.org (חשבון גוגל).
2. צור תת-דומיין, למשל `station-info`.
3. הגדר את ה-IP ל-`204.168.150.129`.
4. עדכן את השם ב-`Caddyfile`.

## 2. המשתמש והקוד

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin stationinfo
sudo mkdir -p /opt/station-info
sudo chown stationinfo:stationinfo /opt/station-info

sudo -u stationinfo git clone https://github.com/ShlomoWulkan/Station-information.git /opt/station-info
cd /opt/station-info/server
sudo -u stationinfo python3 -m venv venv
sudo -u stationinfo ./venv/bin/pip install -r requirements.txt
```

## 3. הסודות

```bash
sudo -u stationinfo cp .env.example .env
sudo -u stationinfo nano .env      # הכנס את API_KEY האמיתי
sudo chmod 600 .env
```

`HOST` ו-`PORT` יכולים להישאר בברירת המחדל (`127.0.0.1:5000`).

## 4. השירות

```bash
sudo cp deploy/station-info.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now station-info
sudo systemctl status station-info
```

העלייה לוקחת דקה או שתיים: מורידים 140MB של GTFS, טוענים ~35 אלף תחנות, ואז
מפענחים את הקווים ברקע. עד שזה נגמר `/routes` ו-`/route-stops` מחזירים 503,
וזה תקין.

```bash
curl 127.0.0.1:5000/health
# {"status":"ok","gtfsStopsLoaded":35245,"routesReady":true,...}
```

## 5. Caddy

```bash
sudo apt install -y caddy
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile          # עדכן את השם
sudo mkdir -p /var/log/caddy && sudo chown caddy:caddy /var/log/caddy
sudo systemctl reload caddy
```

פורטים 80 ו-443 צריכים להיות פתוחים בפיירוול — Let's Encrypt מאמת דרך 80.
**פורט 5000 צריך להיות סגור מבחוץ**; הוא נגיש רק ל-Caddy.

```bash
sudo ufw allow 80,443/tcp
sudo ufw deny 5000/tcp
```

## 6. אימות מבחוץ

```bash
curl https://<subdomain>.duckdns.org/health
curl https://<subdomain>.duckdns.org/arrivals/21472
```

הקריאה השנייה היא זו שמאשרת שהמפתח והאישור מול משרד התחבורה עובדים.

## 7. האפליקציה

עדכן ב-`mobile/eas.json` את `EXPO_PUBLIC_API_URL` בפרופילים `preview` ו-
`production` לכתובת ה-HTTPS. חשוב: `usesCleartextTraffic` פעיל רק כש-
`APP_VARIANT=development`, ולכן בילד production **חייב** HTTPS או שלא יתחבר
בכלל.

---

## תעודת SIRI — נדרש בכל התקנה, ושוב בכל חידוש תעודה

`moran.mot.gov.il` מציג את התעודה שלו אבל **לא את תעודת הביניים שחתמה עליו**,
ולכן הלקוח לא מצליח להשלים שרשרת עד שורש מוכר. השגיאה:

```
CERTIFICATE_VERIFY_FAILED: unable to get local issuer certificate
```

התקלה בצד שלהם. `verify=False` הוסר במכוון — הקריאה נושאת את מפתח ה-API,
וכיבוי האימות מאפשר לכל מי שיכול להתייצב בדרך להתחזות ולקצור אותו.
**אל תחזיר אותו.** במקום זה, מריצים פעם אחת:

```bash
cd ~/apps/Station-information/server
bash scripts/fetch-siri-ca.sh
```

הסקריפט קורא מתוך התעודה איפה להוריד את החוליה החסרה (הרחבת AIA), מוריד
אותה, משרשר עם שורשי המערכת, ומאמת מול השרת החי לפני שהוא מכריז על הצלחה.
בסוף הוא מדפיס שורה להעתקה ל-`.env`:

```
SIRI_CA_BUNDLE=/home/<user>/apps/Station-information/server/certs/mot-ca.pem
```

הפעל מחדש, ואמת:

```bash
curl -s localhost:5000/health    # "siriReachable": true
```

**להריץ שוב כשהתעודה מתחדשת.** התוקף של `*.mot.gov.il` נכון להיום הוא
דצמבר 2026; כשהיא תתחלף, `/health` יראה `siriReachable: false` עם אותה
שגיאה, וההרצה מחדש תפתור.

## לוגים

```bash
sudo journalctl -u station-info -f
sudo journalctl -u station-info --since "1 hour ago" -p warning
```

`LOG_LEVEL=DEBUG` ב-`.env` מרחיב. כישלון בטעינת הקווים נרשם עם traceback —
זה הכשל שהיה נעלם בשקט ומשאיר את `/routes` על 503 לנצח.

## עדכון

```bash
cd /opt/station-info && sudo -u stationinfo git pull
sudo -u stationinfo ./server/venv/bin/pip install -r server/requirements.txt
sudo systemctl restart station-info
```
