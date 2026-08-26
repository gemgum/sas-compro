// Sakelar bahasa. Teks Indonesia tetap di HTML; versi Inggrisnya menumpang di
// atribut data-en, jadi tidak ada markup yang digandakan. Pilihan disimpan di
// localStorage supaya bertahan antar halaman-muat.
const langButtons = document.querySelectorAll('[data-lang]');
if (langButtons.length) {
  const nodes = [...document.querySelectorAll('[data-en]')].map(el => ({ el, idn: el.innerHTML }));
  const apply = lang => {
    document.documentElement.lang = lang;
    nodes.forEach(n => { n.el.innerHTML = lang === 'en' ? n.el.dataset.en : n.idn; });
    langButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    try { localStorage.setItem('lang', lang); } catch { /* mode privat */ }
  };
  langButtons.forEach(b => b.addEventListener('click', () => apply(b.dataset.lang)));
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch { /* mode privat */ }
  if (saved === 'en') apply('en');
}

// Deretan logo (klien & sertifikasi): jalan terus tanpa berhenti, tapi bisa ditarik kiri-kanan
// dengan klik-tahan (hanya selama ditarik jalannya ditunda).
// Daftar logo ditulis dua kali di HTML, jadi setengah scrollWidth = satu putaran.
document.querySelectorAll('.marquee').forEach(marquee => {
  let pos = 0, drag = null;
  const put = v => {
    const loop = marquee.scrollWidth / 2 || 1;
    pos = ((v % loop) + loop) % loop;
    marquee.scrollLeft = pos;
  };

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const step = () => { if (!drag) put(pos + 0.5); requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

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
// "More" dipetakan ke induknya (#alur, tujuan tautan More), supaya selalu ada
// tepat satu yang aktif. About Us berdiri sendiri.
// Urutan kunci = urutan section di halaman; .pop() di bawah bergantung padanya.
const OWNER = { top: '#top', tentang: '#tentang', layanan: '#layanan', alur: '#alur',
                klien: '#klien', keunggulan: '#alur', sertifikat: '#alur',
                teknologi: '#alur', faq: '#alur', kontak: '#kontak' };
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
