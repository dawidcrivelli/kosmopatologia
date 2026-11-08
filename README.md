# Kosmopatologia

Dzienniki z rakiety, która ciągle się psuje. Prowadź statek z załogą przez awarie, obcych i dziwne zdarzenia.

**Zagraj:** https://dawidcrivelli.github.io/kosmopatologia/

Na telefonie: „Dodaj do ekranu głównego” — działa offline (`sw.js`), zapis gry w `localStorage`.

## Uruchomienie

Otwórz `index.html` w przeglądarce — bez budowania (grafika i dźwięk generowane w kodzie, bez plików).
Jeden plik (np. do artefaktu Claude): `node build.js` → `dist/kosmopatologia.html`.

## Struktura

`index.html` (układ), `css/app.css`, `js/*.js` — zwykłe skrypty (wspólny zasięg globalny), ładowane w kolejności z `index.html`:

| plik | linie |
|---|---|
| `js/init.js` | 41 |
| `js/floor_walls_hull.js` | 45 |
| `js/modules.js` | 98 |
| `js/characters.js` | 74 |
| `js/data.js` | 126 |
| `js/state.js` | 86 |
| `js/pathfinding.js` | 16 |
| `js/units.js` | 203 |
| `js/fx_helpers_world_px.js` | 19 |
| `js/systems.js` | 40 |
| `js/events.js` | 76 |
| `js/special_situations.js` | 45 |
| `js/render.js` | 197 |
| `js/sound_procedural.js` | 77 |
| `js/ui.js` | 204 |
| `js/new_combat_aliens_hive.js` | 147 |
| `js/main.js` | 2 |

Po zmianie listy plików zaktualizuj `CORE` i podbij `VERSION` w `sw.js`.

`tools/check.sh` — smoke test w headless Chrome (błędy JS z konsoli, zrzut `tmp/shot.png`). `tmp/` — poza repo.
