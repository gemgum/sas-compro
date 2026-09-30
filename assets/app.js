// Dipakai di dua tempat: gulir ke keterangan form, dan deretan logo di bawah.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Menu mobile: <details> tidak menutup sendiri saat salah satu tautannya
// dipilih, jadi panelnya menutupi section yang baru saja dituju.
const mobileMenu = document.querySelector('header details');
if (mobileMenu) {
  mobileMenu.addEventListener('click', e => {
    if (e.target.closest('a')) mobileMenu.open = false;
  });
}

// Dropdown "More" dibuka CSS lewat :hover/:focus-within — tidak ada state JS
// yang bisa ditutup, jadi Escape cukup melepas fokusnya.
document.querySelector('nav .group')?.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.activeElement?.blur();
});

// Home dan logo menuju #top, tapi alamatnya tidak perlu berbuntut "#top": gulir ke
// atas di sini dan buang hash-nya. Tanpa JS, href="#top" tetap bekerja seperti biasa.
// scrollTo tanpa behavior mengikuti CSS: halus, atau langsung kalau gerak dikurangi.
document.querySelectorAll('a[href="#top"]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo(0, 0);
  history.replaceState(null, '', location.pathname + location.search);
}));

// Sakelar bahasa. Situs dibuka dalam bahasa Inggris: teks Inggris ada di HTML,
// versi Indonesianya menumpang di atribut data-id, jadi tidak ada markup yang
// digandakan dan tanpa JS pun halamannya berbahasa Inggris. Pilihan disimpan di
// localStorage supaya bertahan antar halaman-muat.
// Pesan pembuka WhatsApp per tautan (a[data-wa="kunci"]; kosong = umum), dua bahasa.
const WA_TEXT = {
  '': {
    en: 'Hi Sarthlutions, I found you through your website and would like to discuss a consultation.',
    id: 'Halo Sarthlutions, saya menemukan Anda lewat website dan ingin berdiskusi soal konsultasi.',
  },
  cyber: {
    en: 'Hi Sarthlutions, I found you through your website and would like to discuss your Cyber Security services.',
    id: 'Halo Sarthlutions, saya menemukan Anda lewat website dan ingin berdiskusi soal layanan Cyber Security.',
  },
  software: {
    en: 'Hi Sarthlutions, I found you through your website and would like to discuss your Software Development services.',
    id: 'Halo Sarthlutions, saya menemukan Anda lewat website dan ingin berdiskusi soal layanan Software Development.',
  },
  ai: {
    en: 'Hi Sarthlutions, I found you through your website and would like to discuss your AI Agent Development services.',
    id: 'Halo Sarthlutions, saya menemukan Anda lewat website dan ingin berdiskusi soal layanan AI Agent Development.',
  },
  procurement: {
    en: 'Hi Sarthlutions, I found you through your website and would like to discuss your IT Procurement services.',
    id: 'Halo Sarthlutions, saya menemukan Anda lewat website dan ingin berdiskusi soal layanan IT Procurement.',
  },
};
const langButtons = document.querySelectorAll('[data-lang]');
if (langButtons.length) {
  const nodes = [...document.querySelectorAll('[data-id]')].map(el => ({ el, en: el.innerHTML }));
  const waLinks = document.querySelectorAll('a[data-wa]');
  const apply = lang => {
    document.documentElement.lang = lang;
    // Pesan pembuka WhatsApp ikut bahasa halaman; href di HTML membawa versi Inggris.
    waLinks.forEach(a => { const u = new URL(a.href); u.searchParams.set('text', (WA_TEXT[a.dataset.wa] || WA_TEXT[''])[lang]); a.href = u; });
    nodes.forEach(n => { n.el.innerHTML = lang === 'id' ? n.el.dataset.id : n.en; });
    langButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    try { localStorage.setItem('lang', lang); } catch { /* mode privat */ }
  };
  langButtons.forEach(b => b.addEventListener('click', () => apply(b.dataset.lang)));
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch { /* mode privat */ }
  if (saved === 'id') apply('id');
}

// Deretan logo (clients & certified expertise): jalan terus tanpa berhenti, tapi bisa ditarik
// kiri-kanan dengan klik-tahan (hanya selama ditarik jalannya ditunda).
// Satu putaran = setengah lebar track, jadi daftarnya ditulis dua kali di HTML.
document.querySelectorAll('.marquee').forEach(marquee => {
  const track = marquee.querySelector('.marquee__track');
  let pos = 0, drag = null, frame = 0, onScreen = false;

  // Putaran mulus menuntut setengah track >= lebar wadahnya; kalau tidak,
  // scrollLeft mentok di ujung dan deretannya mandek lalu meloncat. Dua salinan
  // dari HTML kurang pada layar sangat lebar, jadi digandakan lagi di sini —
  // menggandakan (bukan menambah satu salinan) menjaga setengah track tetap
  // berisi salinan utuh.
  const fill = () => {
    for (let i = 0; i < 4 && marquee.scrollWidth < marquee.clientWidth * 2; i++) {
      for (const li of [...track.children]) {
        const clone = li.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('img').forEach(img => { img.alt = ''; });
        track.append(clone);
      }
    }
  };

  const put = v => {
    const loop = marquee.scrollWidth / 2 || 1;
    pos = ((v % loop) + loop) % loop;
    marquee.scrollLeft = pos;
  };

  // Jalan hanya saat deretannya benar-benar terlihat: di luar itu rAF cuma
  // membakar frame untuk sesuatu yang tak seorang pun lihat.
  const step = () => { frame = 0; if (!drag) put(pos + 0.5); start(); };
  const start = () => {
    if (!frame && onScreen && !reduceMotion.matches) frame = requestAnimationFrame(step);
  };
  const stop = () => { cancelAnimationFrame(frame); frame = 0; };

  fill();
  addEventListener('resize', fill);
  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    onScreen ? start() : stop();
  }).observe(marquee);
  // Preferensi gerak bisa diubah selagi halaman terbuka.
  reduceMotion.addEventListener('change', () => (reduceMotion.matches ? stop() : start()));

  marquee.addEventListener('pointerdown', e => {
    drag = { x: e.clientX, pos };
    marquee.setPointerCapture(e.pointerId);
    marquee.classList.add('is-dragging');
  });
  marquee.addEventListener('pointermove', e => {
    if (drag) put(drag.pos - (e.clientX - drag.x));
  });
  const endDrag = () => { drag = null; marquee.classList.remove('is-dragging'); };
  marquee.addEventListener('pointerup', endDrag);
  marquee.addEventListener('pointercancel', endDrag);
});

// Garis bawah nav mengikuti section yang sedang dibaca. Section di dalam dropdown
// "More" dipetakan ke induknya (#why-us, tujuan tautan More), supaya selalu ada
// tepat satu yang aktif. About Us berdiri sendiri.
// Urutan kunci = urutan section di halaman; .pop() di bawah bergantung padanya.
const OWNER = { top: '#top', clients: '#clients', services: '#services', about: '#about',
                'why-us': '#why-us', 'certified-expertise': '#why-us', 'how-we-work': '#why-us',
                technology: '#why-us', faq: '#why-us', contact: '#contact' };
const navLinks = document.querySelectorAll('.nav-link');
const watched = Object.keys(OWNER).map(id => document.getElementById(id)).filter(Boolean);

if (navLinks.length && watched.length) {
  const visible = new Set();
  const io = new IntersectionObserver(entries => {
    for (const e of entries) e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id);
    const current = watched.filter(el => visible.has(el.id)).pop();   // terakhir dalam urutan dokumen
    if (!current) return;
    const href = OWNER[current.id];
    navLinks.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === href)));
  }, { rootMargin: '-72px 0px -70% 0px' });   // pita sempit di bawah header sticky
  watched.forEach(el => io.observe(el));
}

// Garis progres gulir: diisi dari kiri sesuai seberapa jauh halaman sudah digulir.
// Diperbarui paling banyak sekali per frame; resize ikut, karena tinggi halaman berubah.
const progress = document.querySelector('.scroll-progress span');
if (progress) {
  let queued = false;
  const paint = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 100;
    progress.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
  };
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  paint();
}

// Konten muncul satu per satu saat digulir (dan hero saat halaman dibuka).
// <head> sudah memasang .js-reveal kalau animasi boleh jalan; di sini tiap blok
// ditandai .reveal lalu diberi .is-in begitu masuk layar. Blok yang masuk
// bersamaan diberi jeda bertingkat 90ms, urut dokumen.
const root = document.documentElement;
if (root.classList?.contains('js-reveal')) {
  const REVEAL = [
    '#top .mx-auto > div:first-child > *', '#top .hero-art',
    'main section:not(#top) h2', 'main section:not(#top) h2 + p',
    '#about .mt-8 > p', '.iso-art', '#about dl > div', '#about > ul > li',
    '#about > div > .rounded-lg', '#about > div > h3', 'main ol > li',
    '.marquee', '.svc-card', '#why-us li', '#technology li', '.faq',
    '#contact > div > p:first-child', '#contact a',
  ].join(',');
  const io = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting)
      .map(e => e.target)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      .forEach((el, i) => {
        el.style.setProperty('--d', Math.min(i, 8) * 90 + 'ms');
        el.classList.add('is-in');
        io.unobserve(el);
      });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  document.querySelectorAll(REVEAL).forEach(el => { el.classList.add('reveal'); io.observe(el); });
  root.classList.add('reveal-ready');
}

// Globe titik di hero. Titik tersebar rata di bola (spiral Fibonacci) dan hanya
// yang jatuh di daratan yang digambar — peta benua dari LAND: bitmap 192×96
// equirectangular (1 bit = 1,875°), dibuat sekali dari world-atlas land-110m
// (Natural Earth). Penanda Jakarta berdenyut; busur data keluar dari Jakarta ke
// kota-kota lain. Globe berayun pelan ±55° di sekitar Jakarta (gelombang sinus, tanpa
// hentakan) — putaran penuh menyembunyikan Jakarta separuh waktu. Proyeksi ortografik;
// titik depan terang, belakang redup. Hanya berputar saat terlihat; gerak dikurangi
// = satu frame diam, menghadap Jakarta. Empat ikon layanan mengorbit di sekelilingnya.
const globe = document.querySelector('.hero-globe');
if (globe && globe.getContext) {
  const LAND = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
    'AAAAAAAAD/gA//AAAAAAAAAAAAAAAAAAAAAAAAAH//////+AAAAAAAAAAAAAAAAAAAAAAAAH/+////4AA/wAAAAAfgAAAAAA' +
    'AAAAAMhs/n////wAAdgAAAAAAwAAAAAAAAAAAf93/B////wAAAAAAfAA//gAeAAAAAAAA8E3/AB///gAAAAABgAf//wAGAAA' +
    'AAAAB/9+/4A///AAAAAAHA/////4PwAAAH/wOn/e//Af//AAAB+ABJ////////8ef////////////////4AP/xkAAAAAAAAA' +
    'H////////////////gA3gAMAAAAAAAAA3///////////////////////////////AP//////EDwHwAAAH9//////////////' +
    'Af/////8A+ADgAAAP9////////////fwAH0H///8A/4AAAAAH8///////////8YAAB4Af///gf4AAAAGD5//////////4B4A' +
    'AGAAP///8/+AAAAPDx//////////gB4AAAAAX///8//AAAAfn///////////+BwAAAAAD//////gAAAX////////////+BAA' +
    'AAAAD/////9gAAAB////////////+AAAAAAAB/////zwAAAD////////////+AAAAAAAA/////8AAAAB////z///////wAAA' +
    'AAAAA/////QAAAAB/v8Pn///////nAAAAAAAB////+AAAAAfy75jz//////8OAAAAAAAA////4AAAAAfiP//7//////4MAAA' +
    'AAAAA////wAAAAAfAZv/z/////44MAAAAAAAAf///wAAAAAO/AH///////+Y4AAAAAAAAf///gAAAAAP/AAf//////8b4AAA' +
    'AAAAAH///AAAAAAf/xg///////+GAAAAAAAAAD//+AAAAAAf//////////+AAAAAAAAAAD/9GAAAAAA/////3/////+AAAAA' +
    'AAAAAB/wDAAAAAB////f7/////+AAAAAAAAAAAvwCAAAAAD/////9/////8AAAAAAAAAAAXwGAAAAAH////v/w////6AAAAA' +
    'AAAAAAHwxgAAAAH////3/wf/f/AAAAAAAAAAAAD5wWAAAAH////3/gH8f6AAAAAAAAAAAAB/gmgAAAH////7/AH4P4CAAAAA' +
    'AAAAAAAf4AAAAAH////78AHwL8CAAAAAAAAAAAAB8AAAAAH/////wAHgD+DAAAAAAAAAAAAAcEAAAAH/////AADgD8AgAAAA' +
    'AAAAAAAAMf8AAAD/////4ADgCcFgAAAAAAAAAAAAH/8AAAB/////4ABwDABwAAAAAAAAAAAAA//AAAA/////4AAwBgIgAAAA' +
    'AAAAAAAAA//4AAAbH///wAAAHgcAAAAAAAAAAAAAA//4AAAAB///gAAADx4AAAAAAAAAAAAAB//4AAAAB///AAAABz7oAAAA' +
    'AAAAAAAAB///AAAAB//+AAAABz/DAAAAAAAAAAAAB///4AAAB//8AAAAA52L8AAAAAAAAAAAD///+AAAA//4AAAAAYHA/MAA' +
    'AAAAAAAAB////AAAA//4AAAAAPAAPgAAAAAAAAAAA////AAAAf/4AAAAABqwegAAAAAAAAAAA///+AAAAf/8AAAAAAAgAQAA' +
    'AAAAAAAAAf//8AAAAf/8AAAAAAADmAAAAAAAAAAAAf//8AAAA//8YAAAAAAXmAAAAAAAAAAAAf//8AAAA//94AAAAAB/3ADA' +
    'AAAAAAAAAD//4AAAA//x4AAAAAB//AAAAAAAAAAAAD//4AAAAf/hwAAAAAH//gAAAAAAAAAAAD//wAAAAf/hwAAAAAf//wCA' +
    'AAAAAAAAAD//gAAAAf/hwAAAAA///4AAAAAAAAAAAD/+AAAAAP/BgAAAAA///8AAAAAAAAAAAD/8AAAAAP/AAAAAAA///8AA' +
    'AAAAAAAAAD/8AAAAAH+AAAAAAAf//8AAAAAAAAAAAD/4AAAAAH8AAAAAAAf//8AAAAAAAAAAAD/wAAAAAH4AAAAAAAfh/4AA' +
    'AAAAAAAAAH/gAAAAADAAAAAAAAMA/4AIAAAAAAAAAH/AAAAAAAAAAAAAAAAAPwAEAAAAAAAAAH+AAAAAAAAAAAAAAAAAHgAG' +
    'AAAAAAAAAP4AAAAAAAAAAAAAAAAAAAAGAAAAAAAAAPwAAAAAAAAAAAAAAAAABgAYAAAAAAAAAPgAAAAAAAAAAAAAAAAAAAAw' +
    'AAAAAAAAAPAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAPgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAAAAAAAAAAAAQAAAAAAAAA' +
    'AAAAAAAAAPCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAA' +
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAHgADB/5//AAA' +
    'AAAAAAAAAAwAAAAAAAAj//g//////+AAAAAAAAAAAH4AAAAAP/////n///////+AAAAAAABwAP8AAAB////////////////g' +
    'AAAB//B///8AAAH////////////////AAAA///////gAAD////////////////8AAA///////wADB/////////////////8A' +
    'AGH//////wEPh/////////////////4AAAf///////8ff/////////////////4AAAP////////////////////////////g' +
    'AH/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  const W = 192, H = 96, bits = Uint8Array.from(atob(LAND), c => c.charCodeAt(0));
  const isLand = (lat, lon) => {
    const x = Math.min(W - 1, Math.floor((lon + 180) / 360 * W)), y = Math.min(H - 1, Math.floor((90 - lat) / 180 * H));
    return bits[y * (W / 8) + (x >> 3)] & (0x80 >> (x & 7));
  };
  const RAD = Math.PI / 180;
  const vec = (lat, lon) => [Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD), Math.cos(lat * RAD) * Math.cos(lon * RAD)];
  const N = 5200, GA = Math.PI * (3 - Math.sqrt(5)), dots = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - 2 * (i + 0.5) / N, lat = Math.asin(y) / RAD, lon = ((i * GA / RAD) % 360) - 180;
    if (isLand(lat, lon)) dots.push(vec(lat, lon));
  }
  const JKT = vec(-6.2, 106.8);
  const CITIES = [[1.35, 103.8], [3.6, 98.7], [-7.25, 112.75], [-5.15, 119.4], [-8.65, 115.2], [-2.5, 140.7],
                  [35.7, 139.7], [22.3, 114.2], [-33.9, 151.2], [25.2, 55.3], [51.5, -0.1], [50.1, 8.7],
                  [40.7, -74.0], [37.8, -122.4], [19.1, 72.9], [37.6, 127.0]].map(([a, b]) => vec(a, b));
  const TILT = 0.32, ct = Math.cos(TILT), st = Math.sin(TILT);
  const HOME = -106.8 * RAD;
  let rot = HOME, size = 0, frame = 0, onScreen = false, last = 0, clock = 0;
  const turn = ([x, y, z]) => {
    const c = Math.cos(rot), s = Math.sin(rot);
    const x1 = x * c + z * s, z1 = -x * s + z * c;
    return [x1, y * ct - z1 * st, y * st + z1 * ct];
  };
  const slerp = (a, b, u) => {
    const d = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), sd = Math.sin(d) || 1;
    const wa = Math.sin((1 - u) * d) / sd, wb = Math.sin(u * d) / sd, lift = 1 + 0.1 * Math.sin(Math.PI * u) * Math.min(1, d);
    return [(a[0] * wa + b[0] * wb) * lift, (a[1] * wa + b[1] * wb) * lift, (a[2] * wa + b[2] * wb) * lift];
  };
  const newArc = delay => ({ b: CITIES[(Math.random() * CITIES.length) | 0], t: -delay, v: 0.35 + Math.random() * 0.15 });
  const arcs = [0, 0.7, 1.4, 2.1].map(newArc);
  const ctx = globe.getContext('2d');
  const fit = () => {
    const d = window.devicePixelRatio || 1; size = globe.clientWidth;
    globe.width = size * d; globe.height = size * d; ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  // Empat layanan mengorbit globe sebagai satelit — ikon yang sama dengan kartu
  // Services (viewBox 120), hanya ikon tanpa tulisan. Cincin orbit dimiringkan;
  // separuh belakangnya digambar sebelum globe (tertutup badan bola), separuh
  // depannya sesudah. Satu putaran ±28 detik.
  const rr = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}a${r} ${r} 0 0 1 ${r} ${r}V${y + h - r}a${r} ${r} 0 0 1-${r} ${r}H${x + r}a${r} ${r} 0 0 1-${r}-${r}V${y + r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
  const dot = (cx, cy) => `M${cx + 2.4} ${cy}a2.4 2.4 0 1 1-4.8 0a2.4 2.4 0 1 1 4.8 0`;
  const ICONS = [
    { main: 'M60 15 98 29v21c0 23.5-15.4 41.5-38 55.5C37.4 91.5 22 73.5 22 50V29L60 15Z',
      acc: 'M60 30 84 39v15c0 15.8-9.8 27.8-24 37-14.2-9.2-24-21.2-24-37V39l24-9ZM48 60l9.5 9.5L76 51' },
    { main: rr(10, 26, 100, 68, 7) + 'M10 45h100' + dot(23, 35.5) + dot(32, 35.5) + dot(41, 35.5),
      acc: 'm43 61-9 9 9 9M77 61l9 9-9 9M67 56 53 84' },
    { main: rr(38, 38, 44, 44, 7) + 'M49 38V22M60 38V22M71 38V22M49 82v16M60 82v16M71 82v16M38 49H22M38 60H22M38 71H22M82 49h16M82 60h16M82 71h16',
      acc: 'm60 47 3.6 9.4L73 60l-9.4 3.6L60 73l-3.6-9.4L47 60l9.4-3.6L60 47Z' },
    { main: 'M60 26 102 48v34L60 104 18 82V48L60 26Zm-42 22 42 22 42-22M60 70v34',
      acc: 'M60 6v26m-8-9 8 9 8-9' },
  ].map(i => ({ main: new Path2D(i.main), acc: new Path2D(i.acc) }));
  const ORBIT = 1.3, OT = 0.42, OR = -0.3, cOT = Math.cos(OT), sOT = Math.sin(OT), cOR = Math.cos(OR), sOR = Math.sin(OR);
  const orbitAt = th => {
    const x = Math.cos(th) * ORBIT, z = Math.sin(th) * ORBIT, y = -z * sOT, z1 = z * cOT;
    return [x * cOR - y * sOR, x * sOR + y * cOR, z1];
  };
  // Terang-redup mengikuti kedalaman lewat kurva S — sama untuk sisi depan dan belakang,
  // jadi ikon tidak meloncat terang saat menyeberang dari belakang ke depan globe.
  const fade = z => { const t = Math.min(1, Math.max(0, (z / ORBIT + 0.45) / 0.9)); return t * t * (3 - 2 * t); };
  const drawOrbit = (front, R, c) => {
    // cincin: potongan pendek, hanya yang berada di sisi yang sedang digambar
    ctx.setLineDash([2, 6]); ctx.lineWidth = 1.2;
    for (let i = 0; i < 96; i++) {
      const a = orbitAt(i / 96 * Math.PI * 2), b = orbitAt((i + 1) / 96 * Math.PI * 2);
      if ((a[2] >= 0) !== front) continue;
      ctx.beginPath(); ctx.moveTo(c + a[0] * R, c - a[1] * R); ctx.lineTo(c + b[0] * R, c - b[1] * R);
      ctx.strokeStyle = `rgba(120,200,255,${0.12 + 0.36 * fade((a[2] + b[2]) / 2)})`; ctx.stroke();
    }
    ctx.setLineDash([]);
    const base = clock * Math.PI * 2 / 28;   // satu putaran ±28 detik
    ICONS.forEach((icon, i) => {
      const [x, y, z] = orbitAt(base + i * Math.PI / 2);
      if ((z >= 0) !== front) return;
      const k = (z / ORBIT + 1) / 2, s = 0.72 + 0.4 * k, px = c + x * R, py = c - y * R, r = 22 * s;
      ctx.globalAlpha = 0.25 + 0.75 * fade(z);
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(7,26,61,.92)'; ctx.fill();
      ctx.strokeStyle = 'rgba(24,168,232,.75)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.save(); ctx.translate(px, py); ctx.scale(s * 0.25, s * 0.25); ctx.translate(-60, -60);
      ctx.lineCap = ctx.lineJoin = 'round';
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke(icon.main);
      ctx.strokeStyle = '#18a8e8'; ctx.lineWidth = 7; ctx.stroke(icon.acc);
      ctx.restore(); ctx.globalAlpha = 1;
    });
  };
  const draw = dt => {
    if (!size) return;
    const R = size * 0.34, c = size / 2, P = ([x, y]) => [c + x * R, c - y * R];
    ctx.clearRect(0, 0, size, size);
    // atmosfer: pendar cyan di luar tepi bola
    let g = ctx.createRadialGradient(c, c, R * 0.96, c, c, R * 1.22);
    g.addColorStop(0, 'rgba(24,168,232,.38)'); g.addColorStop(1, 'rgba(24,168,232,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, R * 1.22, 0, Math.PI * 2); ctx.fill();
    drawOrbit(false, R, c);
    // badan bola: sedikit lebih terang dari latar, cahaya dari kiri atas
    g = ctx.createRadialGradient(c - R * 0.35, c - R * 0.4, R * 0.1, c, c, R);
    g.addColorStop(0, '#1a51a5'); g.addColorStop(1, '#071d44');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(120,200,255,.35)'; ctx.lineWidth = 1; ctx.stroke();
    // daratan
    for (const p of dots) {
      const q = turn(p); if (q[2] < -0.05) continue;
      const k = Math.max(0, q[2]), [x, y] = P(q);
      ctx.fillStyle = `rgba(${150 + 80 * k | 0},${215 + 30 * k | 0},255,${0.25 + 0.7 * k})`;
      ctx.fillRect(x - 0.9 - 0.5 * k, y - 0.9 - 0.5 * k, 1.8 + k, 1.8 + k);
    }
    // busur data dari Jakarta
    for (const arc of arcs) {
      arc.t += arc.v * dt;
      if (arc.t > 1.5) Object.assign(arc, newArc(0));
      if (arc.t <= 0) continue;
      const head = Math.min(arc.t, 1), tail = Math.max(0, arc.t - 0.45);
      ctx.beginPath(); let pen = false;
      for (let i = 0; i <= 28; i++) {
        const q = turn(slerp(JKT, arc.b, tail + (head - tail) * i / 28)), [x, y] = P(q);
        if (q[2] < 0) { pen = false; continue; }
        if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        pen = true;
      }
      ctx.strokeStyle = 'rgba(24,168,232,.9)'; ctx.lineWidth = 1.6; ctx.stroke();
      const q = turn(slerp(JKT, arc.b, head));
      if (q[2] > 0) {
        const [x, y] = P(q), done = arc.t > 1;
        ctx.beginPath(); ctx.arc(x, y, done ? 2 + 6 * (arc.t - 1) : 2.4, 0, Math.PI * 2);
        ctx.fillStyle = done ? `rgba(191,233,255,${Math.max(0, 1 - (arc.t - 1) * 2)})` : '#bfe9ff'; ctx.fill();
      }
    }
    // penanda Jakarta (tanpa label — dihapus atas permintaan)
    const j = turn(JKT);
    if (j[2] > 0) {
      const [x, y] = P(j), a = Math.min(1, j[2] * 2.5), pulse = (clock % 2) / 2;
      ctx.beginPath(); ctx.arc(x, y, 4 + 16 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(24,168,232,${a * (1 - pulse)})`; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
    }
    drawOrbit(true, R, c);
  };
  const step = now => {
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    clock += dt; rot = HOME + 0.95 * Math.sin(clock * 0.11); draw(dt);
    frame = requestAnimationFrame(step);
  };
  const start = () => { if (!frame && onScreen && !reduceMotion.matches) { last = 0; frame = requestAnimationFrame(step); } };
  const stop = () => { cancelAnimationFrame(frame); frame = 0; };
  fit(); draw(0);
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) { fit(); start(); } else stop(); }).observe(globe);
  reduceMotion.addEventListener('change', () => (reduceMotion.matches ? (stop(), draw(0)) : start()));
  window.addEventListener('resize', () => { fit(); draw(0); });
}
