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

// Form kontak belum punya backend: action="#" akan mem-POST ke URL yang sama
// dan me-reload halaman, menghapus semua isian. Tahan submitnya, tampilkan
// keterangan, biarkan isiannya utuh supaya masih bisa disalin.
const contactForm = document.querySelector('#kontak form');
const sendStatus = document.getElementById('kirim-status');
if (contactForm && sendStatus) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    sendStatus.hidden = false;
    sendStatus.scrollIntoView({ block: 'nearest',
      behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });
}

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

// Deretan logo (klien & sertifikasi): jalan terus tanpa berhenti, tapi bisa ditarik
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
