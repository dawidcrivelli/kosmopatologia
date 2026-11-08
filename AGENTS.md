# Agents

- `js/*.js`: classic scripts sharing one global scope; order in `index.html` matters. New file → add to `index.html` and `CORE` in `sw.js`, bump `VERSION`.
- Test: `tools/check.sh` (no console errors, screenshot in `tmp/`).
- `tools/`: committed scripts. `tmp/`: outputs only, not committed.
