# Temuan audit — status per 27 Agustus 2026

## Berhenti di sini — 28 Agustus

Semua temuan dikerjakan kecuali **C5**, yang Anda putuskan dibiarkan apa adanya:
**A1, A2, A3, B1, B2, C1–C4, D1–D3, E1, E2, F1–F6.** `npm test` hijau.

**Satu utang sadar yang tayang ke produksi (C5):** nomor telepon `+62 21 5021 8899`
masih karangan (komentar `DUMMY` di `index.html`) dan kolase About Us masih memakai
foto `picsum.photos`. Kirim nomor asli + 4–5 foto kapan saja, keduanya dipasang sekaligus.

## Cara melanjutkan

```bash
npm install      # kalau node_modules belum ada
npm run serve    # → http://localhost:8000
npm test         # sebelum commit
```

Kalau menyunting `index.html` dan menambah kelas Tailwind: **`npm run css` dulu**,
kalau tidak kelasnya mati tanpa suara. `check.mjs` menangkapnya.

Rincian tiap temuan dan apa yang dikerjakan ada di bawah.

## A. Bug fungsional

- [x] **A1 — Menu mobile tidak menutup setelah link diklik**
  `<details class="ml-3 lg:hidden">` tidak punya handler. Tap sebuah link →
  halaman meluncur ke section, panel menu tetap terbuka menutupi konten.

  **Selesai.** Listener terdelegasi di `app.js` menutup `<details>` header saat
  salah satu tautannya diklik. Dibatasi ke `header details`, jadi akordeon FAQ
  tidak ikut terpengaruh.

- [x] **A2 — Empat link sosial mati** (`index.html:583`, empat baris berurutan)
  Instagram, GitHub, Telegram, WhatsApp semuanya `href="#"`.
  **Selesai (28 Agustus): dicabut.** Anda memilih mencabutnya karena akunnya belum
  ada — link mati tidak ikut ke produksi. Seluruh kolom **Social Media** beserta sprite
  `<symbol>`-nya dihapus, grid footer jadi 3 kolom, dan ada komentar `<!-- SOSIAL -->`
  di tempatnya. Markup lamanya masih di commit `41456ce` kalau akunnya sudah jadi.

- [x] **A3 — Submit form merusak input**
  `<form action="#" method="post">` mem-POST ke URL yang sama → halaman
  reload, isian hilang. Halaman sudah memberi tahu bahwa backend belum ada,
  tapi tombolnya tetap melakukan hal yang salah. Minimal `e.preventDefault()`
  plus pesan; idealnya sambungkan ke endpoint.
  **Selesai.** Handler `submit` memanggil `preventDefault()`, memunculkan
  `#send-status` (`role="status"`, dua bahasa), dan membiarkan isian tetap di
  kolomnya supaya bisa disalin. Hapus handler ini hanya bersamaan dengan
  endpoint sungguhan.

## B. Struktur & aksesibilitas

- [x] **B1 — Tiga `<h1>`, level heading tidak konsisten**
  Lebih bermasalah: About Us memakai `h1 → h2` untuk Vision/Security First,
  sementara Our Services memakai `h2 → h3` untuk hal setara.
  Target: hero `h1`, semua judul section `h2`, isi kartu `h3`.
  **Selesai.** Sekarang tepat satu `<h1>` (hero). Semua heading di `#about`
  naik satu tingkat (h1→h2, h2→h3, h3→h4) dan Certificate jadi `h2`. Kerangka
  dokumen konsisten dari atas ke bawah.

- [x] **B2 — Tidak ada `<main>`, tidak ada skip link**
  Pengguna keyboard melewati seluruh nav di tiap kunjungan.
  **Selesai.** `<main id="content">` membungkus seluruh isi antara header dan
  footer, plus skip link `sr-only focus:not-sr-only` sebagai elemen pertama di
  `<body>` (dua bahasa).

## C. Kesiapan produksi

- [x] **C1 — Tailwind lewat CDN browser build** ← dampak terbesar
  `@tailwindcss/browser@4` meng-compile CSS di dalam browser saat halaman
  dimuat. Dokumentasi Tailwind menyatakan ini bukan untuk produksi: unduhan
  besar, dan ada jeda saat gaya belum jadi. Ganti dengan Tailwind CLI sekali
  jalan → satu berkas `.css` statis. Ini satu perintah, bukan proyek.
  **Selesai.** Tailwind tidak lagi di-compile di browser. Ada `package.json`
  (`npm run css` / `css:watch` / `serve`), `assets/tailwind.src.css` sebagai
  sumber token, dan `assets/tailwind.css` 30KB hasil build yang ikut di-commit.
  `node_modules/` masuk `.gitignore`.
  ⚠ **Kelas Tailwind baru di `index.html` tidak berefek sampai `npm run css`
  dijalankan lagi.** `check.mjs` menangkap kasus ini.

- [x] **C2 — 64 dari 64 `<img>` tanpa `width`/`height`**
  Tata letak bergeser tiap gambar selesai dimuat. Di deretan logo efeknya
  dobel: `scrollWidth` ikut berubah sehingga putarannya sempat meleset.
  **Selesai.** 64 dari 64 `<img>` kini punya `width`/`height` asli, diambil dari
  berkasnya (dan dari URL untuk picsum).

- [x] **C3 — Berkas gambar kebesaran**
  `assets/clients` 772KB total — `bank_bni.png` 126KB dan `bank_mandiri.png`
  100KB ditampilkan setinggi 46–76px. `assets/logo.webp` 57KB (1298×1063px)
  untuk tampilan 48px. Dikecilkan ke ~2× ukuran tampil bisa turun ke bawah
  100KB total.
  **Selesai.** Logo klien + sertifikat: **1.54 MB → 200 KB (88% lebih kecil)**,
  tinggi dibatasi 160px/200px (2× ukuran tampil) lalu dikuantisasi ke palet bila
  itu menghasilkan berkas lebih kecil. `assets/logo.webp` **dibiarkan utuh**
  sebagai master; halaman memakai turunan `assets/logo-nav.webp` (57KB → 6KB).

- [x] **C4 — Tanpa favicon, tanpa Open Graph**
  Dibagikan di WhatsApp/LinkedIn tidak memunculkan gambar maupun judul.
  Logo sudah tersedia di `assets/logo.webp`.
  **Selesai.** Favicon 32px dan apple-touch-icon 180px dibuat dari **perisainya
  saja** — wordmark tidak terbaca di 32px. Kartu OG 1200×630 memakai lockup penuh
  di atas krem. Meta `og:*`, `twitter:card`, `canonical`, dan `theme-color`
  ditambahkan. Cara membuat ulang ada di CLAUDE.md.

- [~] **C5 — Isian karangan masih hidup di halaman** (dibiarkan, keputusan Anda)
  Nomor telepon `+62 21 5021 8899` (`index.html:562`, ada komentar `DUMMY`)
  dan lima gambar `picsum.photos` di kolase About Us (`index.html:118` dst.).
  **Tidak dikerjakan: perlu data asli.** Nomor telepon justru Anda minta sebagai
  isian karangan sesi lalu, jadi menghapusnya sekarang bertentangan; ia tetap
  ada beserta komentar `DUMMY`. Kolase About Us butuh foto asli — kalau saya
  hapus tanpa pengganti, bagian About Us jadi setengah kosong. Kirim nomor
  telepon asli dan 4–5 foto, keduanya saya pasang sekaligus.
  Daftar placeholder selengkapnya ada di bagian *Placeholders* CLAUDE.md.

## D. Catatan kecil

- [x] **D1** — Dua loop `requestAnimationFrame` di `app.js` berjalan terus,
  termasuk saat deretan logonya jauh di luar layar; tiap frame menulis
  `scrollLeft`. Bisa dijeda lewat `IntersectionObserver`.
  **Selesai.** rAF dijadwalkan hanya selama deretannya berpotongan dengan
  viewport. Di luar itu frame yang tertunda dibatalkan dan tidak ada yang baru
  dijadwalkan; begitu masuk layar lagi, jalan dari posisi terakhir.

- [x] **D2** — `prefers-reduced-motion` dibaca sekali saat muat; kalau
  pengguna mengubahnya, halaman tidak ikut menyesuaikan.
  **Selesai.** `MediaQueryList` sekarang dipasangi listener `change`, jadi
  mengubah setelan gerak di OS langsung menghentikan atau menjalankan kembali
  keduanya tanpa reload. Menghidupkan gerak selagi deretannya di luar layar
  tidak membangunkannya — dua penjagaan itu digabung, bukan saling menimpa.

- [x] **D3** — Marquee mandek di ujung pada layar lebih lebar dari ~2500px
  (satu salinan daftar jadi lebih sempit dari viewport). Tidak akan kejadian
  di layar normal.
  **Selesai.** Akar masalahnya: putaran mulus menuntut setengah track >= lebar
  wadah, kalau tidak `scrollLeft` mentok lalu meloncat. `fill()` **menggandakan**
  track (bukan menambah satu salinan — itu merusak invarian "setengah track =
  salinan utuh") sampai `scrollWidth >= clientWidth * 2`, dan mengecek ulang
  saat jendela diubah ukurannya. Diuji sampai lebar 6000px.

## E. Kontras warna (pemeriksaan susulan, 27 Agustus)

Rasio dihitung dengan rumus WCAG 2.1; ambangnya 4.5:1 untuk teks normal,
3:1 untuk teks besar (>=24px, atau >=18.66px tebal).

- [x] **E1 — Teks sekunder dan aksen teal tidak terbaca di latar krem**
  `--soft` `#98a4a9` di krem cuma **2.5:1** — jauh di bawah ambang, padahal
  dipakai 50 kali untuk hampir seluruh body copy (deskripsi kartu, jawaban FAQ,
  label statistik). `text-teal` `#19b1b4` **2.6:1**, dipakai untuk nomor langkah
  01–05 dan tautan "Kirim pertanyaan Anda.". Placeholder form `text-blue/45`
  **2.5:1**.
  **Selesai.** `--soft` → `#69777d` (**4.54:1**), hue-nya sama, hanya lebih
  gelap. Teks teal pindah ke token baru `--color-teal-deep` `#21758b`
  (**5.17:1**) — `--color-teal` yang lama tetap dipakai untuk garis, border,
  dan squiggle, yang memang bukan teks. Placeholder → `text-blue/70`
  (**4.65:1**). Semua nilai baru diverifikasi ulang setelah diterapkan.
  ⚠ Ini mengubah tampilan: body copy sekarang lebih gelap di 50 tempat. Kalau
  terlalu kontras, satu token `--soft` yang perlu disetel — di **dua** berkas
  (`assets/style.css` dan `assets/tailwind.src.css`), lalu `npm run css`.

- [x] **E2 — Teks putih di ujung teal gradien footer**
  `.g-foot` berakhir di `#19b1b4`. Teks putih di sana cuma **2.6:1**, dan
  paragraf `text-white/85` **2.3:1**. Yang kena: kolom kanan footer (Social
  Media), sebagian baris hak cipta, dan sisi kanan blok CTA.
  **Tidak saya ubah sendiri** karena perbaikannya berarti menggelapkan gradien
  brand — blok yang sudah berkali-kali Anda setel. Tiga pilihan:
  **Selesai (28 Agustus): pilihan (a).** `.g-foot` berakhir di `#17808f`, bukan
  `#19b1b4` — masih teal, dan putih solid di atasnya **4.65:1**. Yang tidak terduga:
  `text-white/85` tetap gagal (3.84:1) walau latarnya sudah digelapkan, karena
  campuran putih-transparan ikut menaikkan luminansi latar. Jadi semua
  `text-white/85` dan `text-white/90` di blok CTA + footer dijadikan putih solid.
  `marker:text-white/45` dibiarkan — bulatan daftar, bukan teks.

## F. Sisir ulang 27 Agustus (semua sudah dikerjakan)

- [x] **F1 — Form berlabel Inggris di halaman Indonesia, dan label hilang saat diketik**
  Keempat label sebenarnya `sr-only`, jadi satu-satunya teks yang terlihat adalah
  placeholder berbahasa Inggris (`Your Name`, `Subject`, `Message`) yang tidak
  ikut sakelar bahasa. Begitu diketik, keterangan kolomnya lenyap.
  **Selesai.** Label dibuat terlihat dan dua bahasa; placeholder dihapus sama
  sekali. Ini menyelesaikan ketiga masalahnya tanpa perlu mesin penerjemah
  placeholder.

- [x] **F2 — `scrollIntoView` mengabaikan `prefers-reduced-motion`**
  CSS sudah mematikan `scroll-behavior: smooth`, tapi panggilan JS menimpanya.
  **Selesai.** `behavior` mengikuti `reduceMotion.matches`; konstantanya dinaikkan
  ke atas berkas karena kini dipakai dua bagian.

- [x] **F3 — Domain absolut di `<head>` bisa berpencar diam-diam**
  `canonical`, `og:url`, dan `og:image` mengunci `www.sarthlutions.id`. Deploy ke
  staging tanpa mengganti ketiganya → pratinjau WhatsApp/LinkedIn rusak.
  **Selesai.** Diberi penanda `<!-- DOMAIN -->`, dan `check.mjs` gagal kalau
  ketiganya tidak seasal.

- [x] **F4 — `theme-color` navy padahal puncak halaman krem**
  **Selesai.** Jadi `#fbfdfd`.

- [x] **F5 — Celah di `check.mjs` sendiri**
  Nilai `OWNER` dicocokkan dengan `href` nav lewat perbandingan string, tapi tak
  ada yang memverifikasi keduanya cocok. Ganti satu `href` → garis bawah nav mati
  tanpa error.
  **Selesai.** Dua pemeriksaan baru, diuji dengan mengganti `href` tombol More.

- [x] **F6 — Kecil-kecil**
  `aria-haspopup` di tombol More dan Escape untuk menutupnya (blur, karena
  dropdown-nya CSS murni — `aria-expanded` sengaja tidak dipakai, tidak ada state
  yang bisa dilaporkan jujur). `<noscript>` untuk form saat JS mati. Kelas
  `relative` mati dicabut dari `#clients`, `#certificate`, dan section CTA — di
  `<footer>` tetap, sprite `<svg class="absolute">` membutuhkannya.

## Sisa pekerjaan

1. **C5** — kirim nomor telepon asli (ganti yang berkomentar `DUMMY`) dan 4–5 foto
   untuk kolase About Us. Sampai itu masuk, keduanya tayang apa adanya.
2. **A2 (opsional)** — kalau akun sosial sudah jadi, kirim URL-nya; kolomnya dipasang
   lagi dari commit `41456ce`.
