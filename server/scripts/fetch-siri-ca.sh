#!/usr/bin/env bash
#
# בונה את SIRI_CA_BUNDLE — שרשרת התעודות של שרת SIRI.
#
# למה: moran.mot.gov.il מציג את התעודה שלו אבל לא את התעודה של הגורם שחתם
# עליה, ולכן הלקוח לא מצליח להשלים את השרשרת עד שורש מוכר. השגיאה היא
# "unable to get local issuer certificate". התקלה בצד שלהם, אבל אפשר לפתור
# אותה כאן: מורידים את החוליה החסרה ומצרפים אותה למאגר.
#
# זו החלופה ל-verify=False, שהשתיק את הבדיקה במקום לתקן אותה — והקריאה הזאת
# נושאת את מפתח ה-API.
#
# שימוש (על ה-VPS):
#   bash scripts/fetch-siri-ca.sh
#   # ואז ב-.env:  SIRI_CA_BUNDLE=/absolute/path/to/certs/mot-ca.pem

set -euo pipefail

HOST="${1:-moran.mot.gov.il}"
OUT="${2:-certs/mot-ca.pem}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "==> מושך את התעודה של $HOST"
openssl s_client -connect "$HOST:443" -servername "$HOST" </dev/null 2>/dev/null \
  | openssl x509 -outform PEM > "$WORK/leaf.pem"

if [ ! -s "$WORK/leaf.pem" ]; then
  echo "שגיאה: לא התקבלה תעודה. מריצים מה-IP המאושר?" >&2
  exit 1
fi

echo "    נושא : $(openssl x509 -in "$WORK/leaf.pem" -noout -subject | sed 's/^subject=//')"
echo "    מנפיק: $(openssl x509 -in "$WORK/leaf.pem" -noout -issuer  | sed 's/^issuer=//')"
echo "    תוקף : $(openssl x509 -in "$WORK/leaf.pem" -noout -enddate | sed 's/^notAfter=//')"

# התעודה עצמה מצביעה על היכן להוריד את זו של המנפיק (הרחבת AIA).
AIA="$(openssl x509 -in "$WORK/leaf.pem" -noout -text \
        | grep -o 'CA Issuers - URI:[^ ]*' | head -1 | sed 's/^CA Issuers - URI://')"

if [ -z "$AIA" ]; then
  echo "שגיאה: אין ב-תעודה כתובת להורדת המנפיק (AIA)." >&2
  echo "יש להשיג את תעודת המנפיק ידנית ולשרשר אותה ל-$OUT" >&2
  exit 1
fi

echo "==> מוריד את תעודת המנפיק מ-$AIA"
curl -fsS "$AIA" -o "$WORK/issuer.bin"

# חלק מהגורמים מגישים DER וחלק PEM.
if ! openssl x509 -inform DER -in "$WORK/issuer.bin" -out "$WORK/issuer.pem" 2>/dev/null; then
  cp "$WORK/issuer.bin" "$WORK/issuer.pem"
fi
openssl x509 -in "$WORK/issuer.pem" -noout -subject >/dev/null

# המאגר צריך גם את שורשי המערכת, אחרת נאמין רק לחוליה שהורדנו ולא לשורש
# שחתם עליה.
ROOTS=""
for candidate in \
  "${REQUESTS_CA_BUNDLE:-}" \
  "$(venv/bin/python -c 'import certifi; print(certifi.where())' 2>/dev/null || true)" \
  "$(python3 -c 'import certifi; print(certifi.where())' 2>/dev/null || true)" \
  "$(python -c 'import certifi; print(certifi.where())' 2>/dev/null || true)" \
  /etc/ssl/certs/ca-certificates.crt \
  /etc/pki/tls/certs/ca-bundle.crt \
  /usr/ssl/certs/ca-bundle.crt \
  /mingw64/ssl/certs/ca-bundle.crt
do
  if [ -n "$candidate" ] && [ -s "$candidate" ]; then ROOTS="$candidate"; break; fi
done

if [ -z "$ROOTS" ]; then
  echo "שגיאה: לא נמצא מאגר שורשי המערכת." >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT")"
cat "$WORK/issuer.pem" "$ROOTS" > "$OUT"

echo "==> נכתב $OUT ($(wc -c < "$OUT") בייטים)"
echo "==> מאמת מול $HOST"
if openssl s_client -connect "$HOST:443" -servername "$HOST" -CAfile "$OUT" </dev/null 2>/dev/null \
     | grep -q "Verify return code: 0 (ok)"; then
  echo "    האימות עובר."
  echo
  echo "הוסף ל-.env:"
  echo "  SIRI_CA_BUNDLE=$(cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")"
  echo "ואז הפעל מחדש ובדוק:  curl -s localhost:5000/health"
else
  echo "    האימות עדיין נכשל — ייתכן שחסרה עוד חוליה בשרשרת." >&2
  exit 1
fi
