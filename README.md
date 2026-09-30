# sas-compro

Company profile satu halaman untuk **PT Sarana Artha Solusi** (Sarthlutions) —
keamanan siber, pengembangan perangkat lunak, agen AI, dan pengadaan TI.
*Secure. Smart. Scalable.*

Perkakasnya Node saja. Tidak butuh Python.

## Menjalankan

```bash
npm install      # sekali saja
npm run serve    # → http://localhost:8000
```

## Menyunting

| Yang diubah | Yang perlu dilakukan |
|---|---|
| `assets/style.css`, `assets/app.js` | refresh browser |
| `index.html` — teks, struktur | refresh browser |
| `index.html` — **kelas Tailwind baru** | `npm run css` dulu |
| token warna di `assets/tailwind.src.css` | `npm run css` |

Tailwind di-build sekali lewat CLI, bukan di-compile di browser. **Kelas Tailwind
baru tidak berefek apa pun sampai `npm run css` dijalankan.** Kalau sedang banyak
menyunting, biarkan `npm run css:watch` jalan di terminal terpisah.

Warna brand ditulis di **dua** tempat dan harus tetap sama — `:root` di
`assets/style.css` (dipakai kelas tulisan tangan) dan `@theme` di
`assets/tailwind.src.css` (dipakai utility Tailwind).

## Memeriksa

```bash
npm test
```

- `check.mjs` — id ganda, anchor mati, tag tidak seimbang, berkas hilang,
  peta `OWNER` di `app.js`, dan kelas Tailwind yang lupa di-build
- `test-marquee.mjs` — menjalankan `app.js` di atas DOM tiruan untuk menguji
  deretan logo: berhenti saat di luar layar, menghormati `prefers-reduced-motion`,
  dan tetap mulus di layar selebar apa pun

Keluar `1` kalau ada yang gagal. Jalankan sebelum commit.

## Deploy — GitHub Pages

Situs tayang di **https://sarthlutions.gemgum.fun/** lewat GitHub Pages, langsung
dari branch `main` (root). Tidak ada server, tidak ada build di sisi GitHub —
`assets/tailwind.css` ikut di-commit, jadi yang di-push itulah yang disajikan.

**Cara update kalau ada konten baru:**

```bash
# 1. sunting index.html / assets/style.css / assets/app.js
npm run css      # WAJIB kalau menambah kelas Tailwind baru di index.html
npm test         # harus hijau; check.mjs menangkap kelas yang belum di-build
git add -A && git commit -m "apa yang diubah" && git push
```

Push ke `main` = deploy. GitHub membangun ulang sekitar 1 menit; kalau halaman
masih lama, hard refresh (`Ctrl+Shift+R`). Status build ada di tab **Actions**
repo — merah berarti tidak tayang.

Yang tidak boleh disentuh saat update:

| Berkas | Kenapa |
|---|---|
| `CNAME` | isinya `sarthlutions.gemgum.fun`; mengubah/menghapusnya melepas domainnya |
| `.nojekyll` | mematikan pemrosesan Jekyll; tanpa ini Pages bisa menelan berkas tertentu |
| `assets/tailwind.css` | hasil build — `npm run css` yang menulisnya, bukan tangan |

Dua jebakan isi halaman: paragraf baru **wajib** ikut membawa `data-id`-nya (kalau
tidak, ia tetap Inggris saat disetel ke Indonesia), dan section baru ber-`id`
**wajib** didaftarkan di `OWNER` (`assets/app.js`) atau garis bawah nav macet.
`npm test` menangkap yang kedua, tidak yang pertama.

Kalau nanti pindah ke domain asli (`sarthlutions.id`): ganti isi `CNAME`, ganti
`canonical` + `og:url` + `og:image` di `<head>` bertiga sekaligus (`check.mjs`
gagal kalau tidak seasal), lalu arahkan DNS-nya — CNAME `www` → `gemgum.github.io`,
dan A `@` → `185.199.108–111.153`.

## Isi berkas

```
index.html               seluruh halaman — semua section ada di sini
assets/tailwind.src.css  sumber build: @import + token @theme
assets/tailwind.css      HASIL BUILD — jangan disunting tangan
assets/style.css         CSS tulisan tangan: gradien, divider, kartu, marquee
assets/app.js            menu, sakelar bahasa, marquee, garis bawah nav, garis progres
assets/clients/          logo klien        assets/certs/  lencana sertifikasi
CLAUDE.md                catatan teknis lengkap dan alasan di balik keputusan
TODO.md                  temuan audit; dua butir masih menunggu data klien
```

Halaman ini dwibahasa (EN/ID) dan **dibuka dalam bahasa Inggris**. Teks Inggris ada
di HTML, versi Indonesianya di atribut `data-id` pada elemen yang sama — **menambah
paragraf berarti menambah `data-id`-nya sekaligus**, kalau tidak ia akan tetap
berbahasa Inggris saat halaman dialihkan ke Indonesia.

Yang masih butuh data dari klien sebelum rilis ada di `TODO.md`.
