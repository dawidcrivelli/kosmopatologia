/* Offline: pliki gry z pamięci podręcznej, w tle odświeżane z sieci (stale-while-revalidate).
   Zmień VERSION przy wydaniu, żeby wyczyścić stare pliki. */
const VERSION = 'kosmopat-v1';
const CORE = ["./", "index.html", "css/app.css", "js/init.js", "js/floor_walls_hull.js", "js/modules.js", "js/characters.js", "js/data.js", "js/state.js", "js/pathfinding.js", "js/units.js", "js/fx_helpers_world_px.js", "js/systems.js", "js/events.js", "js/special_situations.js", "js/render.js", "js/sound_procedural.js", "js/ui.js", "js/new_combat_aliens_hive.js", "js/main.js", "manifest.json", "icon.svg"];
self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys()
  .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(e.request);
    const net = fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
