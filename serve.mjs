/* Server statis seadanya untuk melihat halaman ini di browser.

       node serve.mjs           → http://localhost:8000
       node serve.mjs 3000      → port lain

   Sengaja tanpa dependensi: satu-satunya yang dibutuhkan proyek ini adalah
   melayani berkas apa adanya dari folder ini. */
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, extname } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2]) || 8000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  // normalize() membuang ../ , jadi permintaan tidak bisa keluar dari folder ini
  const file = join(ROOT, normalize(path === '/' ? '/index.html' : path));

  // Bukan cuma di luar ROOT: .git dan node_modules juga tidak ada urusannya
  // dengan halaman ini, dan server dev tidak perlu membocorkannya.
  if (!file.startsWith(ROOT) || /(^|\/)\.|node_modules/.test(path)) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' }).end('403 Forbidden');
    return;
  }
  let stat;
  try {
    stat = statSync(file);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end(`404 ${path}`);
    return;
  }
  if (stat.isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end(`404 ${path}`);
    return;
  }
  res.writeHead(200, {
    'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'content-length': stat.size,
    'cache-control': 'no-cache',   // supaya hasil `npm run css` langsung kelihatan
  });
  createReadStream(file).pipe(res);
// Hanya localhost — jangan terbuka ke jaringan sekitar.
}).listen(PORT, '127.0.0.1', () => console.log(`http://localhost:${PORT}`));
