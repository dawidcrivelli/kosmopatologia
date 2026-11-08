#!/bin/bash
# Smoke test: ładuje grę w headless Chrome, wypisuje błędy JS z konsoli, zrzut ekranu -> tmp/shot.png.
cd "$(dirname "$0")/.."; mkdir -p tmp; PORT=${PORT:-8765}
python3 -m http.server $PORT >/dev/null 2>&1 & SP=$!; trap "kill $SP" EXIT; sleep 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --user-data-dir="$PWD/tmp/chrome-prof" \
  --enable-logging=stderr --v=0 --window-size=900,600 --virtual-time-budget=4000 --screenshot="$PWD/tmp/shot.png" \
  "http://localhost:$PORT/index.html" 2>&1 | grep CONSOLE && exit 1 || echo "OK, bez błędów; zrzut: tmp/shot.png"
