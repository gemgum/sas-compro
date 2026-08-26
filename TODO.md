# Temuan audit — 26 Agustus 2026

Hasil pemeriksaan `index.html`, `assets/app.js`, `assets/style.css`.
Yang lulus: HTML valid (tidak ada tag menggantung, id ganda, anchor mati),
`OWNER` di `app.js` sinkron dan urut dokumen, tidak ada kelas CSS tanpa pemakai.

Belum ada yang dikerjakan dari daftar di bawah.

## A. Bug fungsional

- [ ] **A1 — Menu mobile tidak menutup setelah link diklik** (`index.html:59`)
  `<details class="ml-3 lg:hidden">` tidak punya handler. Tap sebuah link →
  halaman meluncur ke section, panel menu tetap terbuka menutupi konten.
  Perbaikan: satu listener di `app.js` yang `removeAttribute('open')` saat
  ada `<a>` di dalamnya diklik.

- [ ] **A2 — Empat link sosial mati** (`index.html:570–573`)
  Instagram, GitHub, Telegram, WhatsApp semuanya `href="#"`. Butuh URL asli
  dari klien, atau ikonnya dicabut sampai akunnya ada.

- [ ] **A3 — Submit form merusak input** (`index.html:503`)
  `<form action="#" method="post">` mem-POST ke URL yang sama → halaman
  reload, isian hilang. Halaman sudah memberi tahu bahwa backend belum ada,
  tapi tombolnya tetap melakukan hal yang salah. Minimal `e.preventDefault()`
  plus pesan; idealnya sambungkan ke endpoint.

## B. Struktur & aksesibilitas

- [ ] **B1 — Tiga `<h1>`, level heading tidak konsisten**
  `index.html:81` (hero), `:99` (About Us), `:349` (Certificate).
  Lebih bermasalah: About Us memakai `h1 → h2` untuk Vision/Security First,
  sementara Our Services memakai `h2 → h3` untuk hal setara.
  Target: hero `h1`, semua judul section `h2`, isi kartu `h3`.

- [ ] **B2 — Tidak ada `<main>`, tidak ada skip link**
  Pengguna keyboard melewati seluruh nav di tiap kunjungan.

## C. Kesiapan produksi

- [ ] **C1 — Tailwind lewat CDN browser build** (`index.html:11`) ← dampak terbesar
  `@tailwindcss/browser@4` meng-compile CSS di dalam browser saat halaman
  dimuat. Dokumentasi Tailwind menyatakan ini bukan untuk produksi: unduhan
  besar, dan ada jeda saat gaya belum jadi. Ganti dengan Tailwind CLI sekali
  jalan → satu berkas `.css` statis. Ini satu perintah, bukan proyek.

- [ ] **C2 — 64 dari 64 `<img>` tanpa `width`/`height`**
  Tata letak bergeser tiap gambar selesai dimuat. Di deretan logo efeknya
  dobel: `scrollWidth` ikut berubah sehingga putarannya sempat meleset.

- [ ] **C3 — Berkas gambar kebesaran**
  `assets/clients` 772KB total — `bank_bni.png` 126KB dan `bank_mandiri.png`
  100KB ditampilkan setinggi 46–76px. `assets/logo.webp` 57KB (1298×1063px)
  untuk tampilan 48px. Dikecilkan ke ~2× ukuran tampil bisa turun ke bawah
  100KB total.

- [ ] **C4 — Tanpa favicon, tanpa Open Graph**
  Dibagikan di WhatsApp/LinkedIn tidak memunculkan gambar maupun judul.
  Logo sudah tersedia di `assets/logo.webp`.

- [ ] **C5 — Isian karangan masih hidup di halaman**
  Nomor telepon `+62 21 5021 8899` (`index.html:549`, ada komentar `DUMMY`)
  dan lima gambar `picsum.photos` di kolase About Us (`index.html:108–110`).
  Daftar placeholder selengkapnya ada di bagian *Placeholders* CLAUDE.md.

## D. Catatan kecil

- [ ] **D1** — Dua loop `requestAnimationFrame` di `app.js` berjalan terus,
  termasuk saat deretan logonya jauh di luar layar; tiap frame menulis
  `scrollLeft`. Bisa dijeda lewat `IntersectionObserver`.
- [ ] **D2** — `prefers-reduced-motion` dibaca sekali saat muat; kalau
  pengguna mengubahnya, halaman tidak ikut menyesuaikan.
- [ ] **D3** — Marquee mandek di ujung pada layar lebih lebar dari ~2500px
  (satu salinan daftar jadi lebih sempit dari viewport). Tidak akan kejadian
  di layar normal.

## Urutan kerja yang disarankan

`A1 → A2 → A3` (bug, cepat) → `C1` (dampak terbesar) → `B1` → `C2 → C3 → C4`.
`C5` menjelang rilis, saat data asli dari klien sudah masuk. `D` opsional.
