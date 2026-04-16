#!/bin/bash
# Generates 11 OG images (1200x630 PNG) for Tracify pages using Chrome headless.
# Run from project root: bash scripts/og-generator/generate.sh

set -e

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TEMPLATE="file://$(cd "$(dirname "$0")" && pwd)/template.html"
OUT_DIR="$(cd "$(dirname "$0")/../../public/og" && pwd)"

mkdir -p "$OUT_DIR"

# Format: name|eyebrow|headline (HTML: <em> wraps gradient word)|description|badge
PAGES=(
  "home|Phone Tracker|Locate Any Phone, <em>Anywhere</em>|Real-time consent-based phone tracker. Works on every iPhone and Android — no install.|\$0.50 trial"
  "how-it-works|How It Works|Track a Phone Number in <em>3 Steps</em>|Enter the number. Send a consent SMS. Get precise GPS location in under 60 seconds.|Consent-based"
  "faq|FAQ|Phone Tracker <em>Questions</em> Answered|Everything you want to know — how it works, legality, privacy, devices, and pricing.|Consent-based"
  "contact|Support|<em>24/7</em> Support, Real Humans|Need help tracking a phone? Our support team is online around the clock.|Fast response"
  "privacy|Privacy|Your Privacy, <em>Protected</em>|How Tracify collects, uses, and encrypts your data. GDPR & CCPA compliant.|GDPR compliant"
  "terms|Legal|Terms of <em>Service</em>|The rules that govern your use of Tracify's consent-based phone tracker.|Consent-based"
  "blog|Blog|Phone Tracking <em>Guides</em> & Tips|Expert guides on how to track phones legally, find lost phones, and compare trackers.|Updated 2026"
  "blog-how-to|Guide|How to Track a <em>Phone Number</em>|Step-by-step guide to tracking any phone number legally using consent-based SMS.|2026 edition"
  "blog-comparison|Comparison|Best <em>Phone Trackers</em> Compared|Features, pricing, accuracy, and privacy — the top phone tracker apps side-by-side.|2026 edition"
  "blog-legality|Legal|Is Phone Tracking <em>Legal?</em>|Consent, privacy laws, GDPR, CCPA — everything explained in plain English.|Plain-English"
  "blog-find-lost|Guide|Find Your <em>Lost Phone</em> by Number|A practical step-by-step guide to recovering a lost phone using its number.|Works globally"
)

urlenc() {
  python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$1"
}

COUNT=0
for entry in "${PAGES[@]}"; do
  IFS='|' read -r name eyebrow headline desc badge <<< "$entry"
  E=$(urlenc "$eyebrow")
  H=$(urlenc "$headline")
  D=$(urlenc "$desc")
  B=$(urlenc "$badge")
  URL="${TEMPLATE}?e=${E}&h=${H}&d=${D}&b=${B}"
  OUT="${OUT_DIR}/${name}.png"

  echo "[$((++COUNT))/11] Generating ${name}.png..."
  RAW="/tmp/og-raw-${name}.png"
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --no-sandbox \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --virtual-time-budget=1500 \
    --window-size=1200,800 \
    --screenshot="$RAW" \
    "$URL" 2>/dev/null

  # Crop to 1200x630 (top-left origin)
  python3 -c "
from PIL import Image
img = Image.open('$RAW')
cropped = img.crop((0, 0, 1200, 630))
cropped.save('$OUT')
" 2>/dev/null || cp "$RAW" "$OUT"
  rm -f "$RAW"

  if [ -f "$OUT" ]; then
    SIZE=$(stat -f%z "$OUT" 2>/dev/null || stat -c%s "$OUT")
    echo "      ${name}.png (${SIZE} bytes)"
  else
    echo "      FAILED: ${name}.png"
  fi
done

echo ""
echo "=== DONE ==="
ls -la "$OUT_DIR/"
