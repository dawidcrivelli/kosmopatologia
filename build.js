#!/usr/bin/env node
/* Skleja index.html + css/app.css + js/*.js w jeden plik: dist/kosmopatologia.html (np. do artefaktu Claude).
   Użycie:  node build.js */
const fs = require('fs');
const path = require('path');
const root = __dirname;
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

const html = read('index.html')
  .replace('<link rel="stylesheet" href="css/app.css">', () => '<style>\n' + read('css/app.css') + '</style>')
  // JS w kolejności z index.html, w jednym <script> (wspólny zasięg jak w oryginale)
  .replace(/(<script src="js\/[\w-]+\.js"><\/script>\n)+/, m =>
    '<script>\n' + [...m.matchAll(/src="([^"]+)"/g)].map(([, f]) => read(f)).join('') + '</script>\n')
  // PWA działa tylko z serwera, w pojedynczym pliku zbędne
  .replace(/<link rel="(manifest|icon)"[^>]*>\n/g, '')
  .replace(/<script>if\('serviceWorker'.*<\/script>\n/, '');

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const out = path.join(root, 'dist', 'kosmopatologia.html');
fs.writeFileSync(out, html);
console.log('->', path.relative(root, out), (html.length / 1024).toFixed(0) + ' kB');
