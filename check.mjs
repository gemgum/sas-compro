/* Pemeriksaan struktur untuk index.html.

   Tidak ada yang di-compile dengan tangan di proyek ini, jadi kesalahan
   struktur gagal tanpa suara. Skrip ini menangkap yang benar-benar pernah
   terjadi. Jalankan setelah menyunting index.html:

       node check.mjs        (keluar 1 kalau ada yang gagal)  */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const HTML = read('index.html');
const APP = read('assets/app.js');

const fails = [];
const check = (label, bad, hint = '') => {
  const list = [...bad];
  console.log(`${list.length ? 'GAGAL' : 'ok  '}  ${label}: ${list.length ? list.join(', ') : '-'}`);
  if (list.length) fails.push(label + (hint ? ' — ' + hint : ''));
};

const all = (re, s = HTML) => [...s.matchAll(re)].map((m) => m[1]);

// ── id ganda & anchor yang tidak menuju ke mana-mana ──────────────────────
const ids = all(/\bid="([^"]+)"/g);
const seen = new Map();
for (const id of ids) seen.set(id, (seen.get(id) ?? 0) + 1);
check('id ganda', [...seen].filter(([, n]) => n > 1).map(([id]) => id));
check('anchor mati', [...new Set(all(/href="#([a-z-]+)"/g))].sort().filter((a) => !ids.includes(a)));

// ── tag tidak seimbang ────────────────────────────────────────────────────
const VOID = new Set(('area base br col embed hr img input link meta param source track wbr ' +
  'use path circle rect ellipse polygon line stop iframe').split(' '));
{
  const stack = [], bad = [];
  // komentar dan isi <svg> tetap ikut diperiksa; hanya komentar yang dilewati.
  const body = HTML.replace(/<!--[\s\S]*?-->/g, '');
  for (const m of body.matchAll(/<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g)) {
    const [, closing, tag, selfClosing] = m;
    const name = tag.toLowerCase();
    if (VOID.has(name) || selfClosing) continue;
    if (!closing) stack.push(name);
    else if (stack.at(-1) === name) stack.pop();
    else bad.push(name);
  }
  check('tag belum ditutup', stack);
  check('tag tidak cocok', bad);
}

// ── data-en yang akan menimpa markup di dalamnya ──────────────────────────
// app.js menukar innerHTML, jadi elemen ber-data-en tidak boleh memuat elemen
// lain yang ingin dipertahankan. Alamat kantor sengaja dikecualikan: <br>-nya
// ikut ditulis di dalam atribut.
check('data-en menimpa markup',
  [...HTML.matchAll(/<(\w+)[^>]*data-en="[^"]*"[^>]*>([\s\S]*?)<\/\1>/g)]
    .filter((m) => m[2].includes('<') && !m[2].includes('Sarana Artha Solusi<br>'))
    .map((m) => m[2].slice(0, 40).replace(/\n/g, ' ')));

// ── berkas lokal yang dirujuk tapi tidak ada ──────────────────────────────
check('berkas hilang', all(/(?:src|href)="(assets\/[^"]+)"/g).filter((f) => !existsSync(join(ROOT, f))));

// ── OWNER di app.js ↔ section di halaman ─────────────────────────────────
const own = all(/(\w+): '#/g, APP);
const sections = new Set(all(/<section[^>]*id="([a-z]+)"/g));
check('section tanpa OWNER', [...sections].filter((s) => !own.includes(s)).sort());
check('OWNER tanpa target', own.filter((k) => !HTML.includes(`id="${k}"`)));
const inOrder = own.every((k, i) => i === 0 || HTML.indexOf(`id="${k}"`) > HTML.indexOf(`id="${own[i - 1]}"`));
check('OWNER tidak urut dokumen', inOrder ? [] : own, '.pop() di app.js bergantung pada urutan kunci');

// Nilai OWNER dicocokkan dengan href .nav-link lewat perbandingan string; kalau
// href di nav diganti, garis bawahnya mati tanpa error apa pun.
const navHrefs = new Set(all(/<a href="([^"]+)"[^>]*class="[^"]*nav-link/g));
const ownVals = new Set(all(/\w+: '(#\w+)'/g, APP));
check('OWNER menunjuk nav-link yang tidak ada', [...ownVals].filter((v) => !navHrefs.has(v)).sort(),
  'garis bawah nav tidak akan pernah menyala untuk section itu');
check('nav-link tanpa OWNER', [...navHrefs].filter((v) => !ownVals.has(v)).sort(),
  'item nav itu tidak akan pernah bergaris bawah');

// ── URL absolut di <head> harus seasal ───────────────────────────────────
// canonical, og:url, dan og:image wajib absolut (crawler tidak menjalankan JS
// dan tidak menebak domain). Kalau situs pindah domain dan salah satunya
// tertinggal, pratinjau WhatsApp/LinkedIn menunjuk berkas yang tidak ada.
{
  const head = HTML.slice(0, HTML.indexOf('</head>'));
  const urls = [...head.matchAll(/(?:href|content)="(https?:\/\/[^"]+)"/g)]
    .map((m) => m[1])
    .filter((u) => !/fonts\.(googleapis|gstatic)\.com/.test(u));
  const origins = [...new Set(urls.map((u) => new URL(u).origin))];
  check('domain di <head> tidak seasal', origins.length > 1 ? origins : [],
    'canonical, og:url, dan og:image harus menunjuk domain yang sama');
}

// ── kelas Tailwind yang belum ikut ter-build ─────────────────────────────
// Sejak Tailwind dibangun sekali lewat CLI, kelas baru tidak berefek apa pun
// sampai `npm run css` dijalankan lagi. Ini kegagalan paling senyap di repo.
if (existsSync(join(ROOT, 'assets/tailwind.css'))) {
  const css = read('assets/tailwind.css');
  const hand = read('assets/style.css');
  const used = new Set(all(/class="([^"]+)"/g).flatMap((a) => a.split(/\s+/)).filter(Boolean));
  const unbuilt = [...used]
    .filter((c) => !css.includes(c.replace(/([^\w-])/g, '\\$1')) && !hand.includes('.' + c))
    .sort();
  check('kelas belum ter-build', unbuilt.slice(0, 12), 'jalankan `npm run css`');
}

// ── deretan logo: tiap daftar harus ditulis dua kali ──────────────────────
for (const m of HTML.matchAll(/<div class="marquee[^"]*"[^>]*>([\s\S]*?)<\/div>/g)) {
  const n = (m[1].match(/<li/g) ?? []).length;
  check(`marquee ${n} <li> (harus genap)`, n && n % 2 === 0 ? [] : [String(n)],
    'setengah scrollWidth = satu putaran, jadi daftarnya wajib ganda');
}

console.log();
if (fails.length) {
  console.log(`${fails.length} gagal:`);
  for (const f of fails) console.log(' -', f);
  process.exit(1);
}
console.log('semua lolos');
