# פריסה

> **קרא קודם:** משרד התחבורה מאשר קריאות SIRI מ-**204.168.150.129** בלבד.
> מפתח ה-API קשור ל-IP הזה. החלפת מכונה מחייבת רישום IP חדש מולם — אם אחרי
> פריסה למכונה אחרת `/arrivals` יחזיר 401, זו הסיבה, והמפתח לא פג.
> ראה `docs/SECRETS.md`.

## מה רץ איפה

```
[אפליקציה]  ──HTTPS──>  [Caddy :443]  ──HTTP──>  [gunicorn 127.0.0.1:5000]  ──HTTPS──>  [mot.gov.il]
```

Caddy הוא היחיד שמאזין לאינטרנט. gunicorn מאזין ל-127.0.0.1 בלבד, ולכן `HOST`
בברירת מחדל הוא לוקאלי ולא `0.0.0.0`.

## 1. תת-דומיין

תעודת TLS מונפקת לשם, לא ל-IP חשוף. תת-דומיין DuckDNS חינמי ומספיק:

1. הירשם ב-duckdns.org (חשבון גוגל).
2. צור תת-דומיין, למשל `midaa-tachana`.
3. הגדר את ה-IP ל-`204.168.150.129`.
4. עדכן את השם ב-`Caddyfile`.

## 2. המשתמש והקוד

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin midaa
sudo mkdir -p /opt/midaa-tachana
sudo chown midaa:midaa /opt/midaa-tachana

sudo -u midaa git clone https://github.com/ShlomoWulkan/Station-information.git /opt/midaa-tachana
cd /opt/midaa-tachana/server
sudo -u midaa python3 -m venv venv
sudo -u midaa ./venv/bin/pip install -r requirements.txt
```

## 3. הסודות

```bash
sudo -u midaa cp .env.example .env
sudo -u midaa nano .env      # הכנס את API_KEY האמיתי
sudo chmod 600 .env
```

`HOST` ו-`PORT` יכולים להישאר בברירת המחדל (`127.0.0.1:5000`).

## 4. השירות

```bash
sudo cp deploy/midaa-tachana.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now midaa-tachana
sudo systemctl status midaa-tachana
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

## אם `/arrivals` מחזיר SSLError

`verify=False` הוסר מ-`siri_client.py` במכוון — הקריאה נושאת את מפתח ה-API,
וכיבוי אימות התעודה אפשר לכל מי שיכול להתייצב בדרך להתחזה ולקצור אותו.

אם התעודה של `moran.mot.gov.il` באמת בעייתית (שרשרת חסרה קורה בשרתים
ממשלתיים), **אל תחזיר `verify=False`**. במקום זה:

```bash
openssl s_client -showcerts -connect moran.mot.gov.il:443 </dev/null \
  > /opt/midaa-tachana/server/certs/mot-ca.pem
```

והוסף ל-`.env`:

```
SIRI_CA_BUNDLE=/opt/midaa-tachana/server/certs/mot-ca.pem
```

כך האימות נשאר פעיל ומצומצם למי שאתה סומך עליו, במקום כבוי מול כל העולם.

## לוגים

```bash
sudo journalctl -u midaa-tachana -f
sudo journalctl -u midaa-tachana --since "1 hour ago" -p warning
```

`LOG_LEVEL=DEBUG` ב-`.env` מרחיב. כישלון בטעינת הקווים נרשם עם traceback —
זה הכשל שהיה נעלם בשקט ומשאיר את `/routes` על 503 לנצח.

## עדכון

```bash
cd /opt/midaa-tachana && sudo -u midaa git pull
sudo -u midaa ./server/venv/bin/pip install -r server/requirements.txt
sudo systemctl restart midaa-tachana
```
