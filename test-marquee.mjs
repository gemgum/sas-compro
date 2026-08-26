/* Menjalankan assets/app.js di atas DOM tiruan seadanya, lalu memeriksa perilaku
   deretan logo yang tidak kelihatan salah sampai dipakai di layar atau setelan
   tertentu — persis tiga temuan D di TODO.md:

   D1  berhenti menjadwalkan frame begitu deretannya keluar layar
   D2  menghormati prefers-reduced-motion, termasuk saat diubah selagi terbuka
   D3  track digandakan sampai setengahnya menutupi lebar wadah, kalau tidak
       scrollLeft mentok di ujung dan deretannya mandek lalu meloncat

   Jalankan: node test-marquee.mjs        (keluar 1 kalau ada yang gagal)  */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const SRC = readFileSync(new URL('./assets/app.js', import.meta.url), 'utf8');
const LI_WIDTH = 148;      // logo + gap, kira-kira seperti di halaman
const LOGOS = 17;
const COPIES_IN_HTML = 2;  // daftar ditulis dua kali di index.html

const leaf = () => ({
  setAttribute() {},
  querySelectorAll: () => [],
  cloneNode() { return leaf(); },
});

/** Jalankan app.js dengan satu deretan tiruan. Mengembalikan kendali untuk
 *  mengatur visibilitas, memutar frame, dan mengintip keadaannya. */
function run({ width = 1440, reduce = false } = {}) {
  const children = Array.from({ length: LOGOS * COPIES_IN_HTML }, leaf);
  const track = { get children() { return children; }, append: (el) => children.push(el) };
  const marquee = {
    clientWidth: width,
    scrollLeft: 0,
    get scrollWidth() { return children.length * LI_WIDTH; },
    querySelector: () => track,
    classList: { add() {}, remove() {} },
    addEventListener() {},
    setPointerCapture() {},
  };

  const frames = new Map();
  let nextId = 1, setVisible = null, motionListener = null;
  const media = {
    matches: reduce,
    addEventListener: (_, fn) => { motionListener = fn; },
  };

  const stub = {
    document: {
      querySelectorAll: (sel) => (sel === '.marquee' ? [marquee] : []),
      querySelector: () => null,
      getElementById: () => null,
      documentElement: {},
    },
    matchMedia: () => media,
    IntersectionObserver: class {
      constructor(cb) { this.cb = cb; }
      observe(el) { setVisible = (v) => this.cb([{ isIntersecting: v, target: el }]); }
    },
    requestAnimationFrame(fn) { frames.set(nextId, fn); return nextId++; },
    cancelAnimationFrame(id) { frames.delete(id); },
    addEventListener() {},
    localStorage: { getItem: () => null, setItem() {} },
  };
  stub.window = stub;
  new Function(...Object.keys(stub), SRC)(...Object.values(stub));

  return {
    marquee,
    children,
    pending: () => frames.size,
    show: (v = true) => setVisible(v),
    setReduce: (v) => { media.matches = v; motionListener?.(); },
    tick(n = 1) {
      for (let i = 0; i < n; i++) {
        const [id, fn] = frames.entries().next().value ?? [];
        if (fn === undefined) return;
        frames.delete(id);
        fn();
      }
    },
  };
}

let failed = 0;
const it = (name, fn) => {
  try { fn(); console.log('ok    ' + name); }
  catch (e) { failed++; console.log('GAGAL ' + name + '\n      ' + e.message); }
};

// ── D3 ────────────────────────────────────────────────────────────────────
for (const width of [360, 768, 1440, 2560, 3840, 6000]) {
  it(`D3 · lebar ${width}px: setengah track menutupi wadahnya`, () => {
    const m = run({ width });
    const half = m.marquee.scrollWidth / 2;
    const maxScroll = m.marquee.scrollWidth - m.marquee.clientWidth;
    assert.ok(half <= maxScroll,
      `setengah track ${half} > scroll maksimum ${maxScroll} — deretan akan mandek`);
    assert.equal(m.children.length % (LOGOS * COPIES_IN_HTML), 0,
      'salinannya tidak utuh — sambungan putaran akan meloncat');
  });
}

it('D3 · posisi terbungkus, berputar berulang tanpa keluar rentang', () => {
  const m = run();
  m.show();
  const half = m.marquee.scrollWidth / 2;
  let wraps = 0, prev = 0, peak = 0;
  for (let i = 0; i < half * 6; i++) {          // cukup untuk ~3 putaran penuh
    m.tick();
    if (m.marquee.scrollLeft < prev) wraps++;   // turun = baru saja membungkus
    prev = m.marquee.scrollLeft;
    peak = Math.max(peak, m.marquee.scrollLeft);
  }
  assert.ok(peak < half, `scrollLeft mencapai ${peak}, keluar dari [0, ${half})`);
  assert.ok(wraps >= 2, `hanya membungkus ${wraps} kali — putarannya tidak berulang`);
});

// ── D1 ────────────────────────────────────────────────────────────────────
it('D1 · diam sampai deretannya masuk layar', () => {
  const m = run();
  assert.equal(m.pending(), 0, 'frame dijadwalkan padahal deretannya belum terlihat');
  m.show();
  assert.ok(m.pending() > 0, 'tidak mulai jalan padahal sudah terlihat');
});

it('D1 · berhenti menjadwalkan frame setelah keluar layar', () => {
  const m = run();
  m.show();
  m.tick(50);
  const restingAt = m.marquee.scrollLeft;
  m.show(false);
  assert.equal(m.pending(), 0, 'masih ada frame terjadwal padahal sudah di luar layar');
  m.tick(50);
  assert.equal(m.marquee.scrollLeft, restingAt, 'masih bergerak di luar layar');
  m.show(true);
  assert.ok(m.pending() > 0, 'tidak jalan lagi setelah kembali terlihat');
});

// ── D2 ────────────────────────────────────────────────────────────────────
it('D2 · tidak beranimasi saat prefers-reduced-motion aktif sejak awal', () => {
  const m = run({ reduce: true });
  m.show();
  assert.equal(m.pending(), 0, 'tetap beranimasi padahal gerak diminta dikurangi');
});

it('D2 · ikut berhenti dan jalan lagi saat setelan diubah selagi halaman terbuka', () => {
  const m = run();
  m.show();
  m.tick(10);
  m.setReduce(true);
  assert.equal(m.pending(), 0, 'tidak berhenti saat gerak diminta dikurangi');
  m.setReduce(false);
  assert.ok(m.pending() > 0, 'tidak jalan lagi saat setelan dikembalikan');
});

it('D1+D2 · setelan gerak diubah selagi di luar layar tidak membangunkannya', () => {
  const m = run();
  m.show();
  m.tick(10);
  m.show(false);
  m.setReduce(true);
  m.setReduce(false);          // dikembalikan, tapi deretannya masih di luar layar
  assert.equal(m.pending(), 0, 'mulai beranimasi padahal masih di luar layar');
  m.show(true);
  assert.ok(m.pending() > 0, 'tidak jalan lagi setelah kembali terlihat');
});

console.log(failed ? `\n${failed} gagal` : '\nsemua lolos');
process.exit(failed ? 1 : 0);
