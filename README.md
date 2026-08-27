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

## Deploy

Situs statis murni — tidak ada backend, tidak ada proses yang jalan di server.
Yang perlu naik cuma `index.html` + `assets/`. **Jalankan `npm run css` dan
`npm test` dulu**; `assets/tailwind.css` ikut di-commit, jadi server tidak
perlu Node sama sekali.

```bash
rsync -avz --delete \
  --exclude 'assets/logo.webp' --exclude 'assets/tailwind.src.css' \
  --exclude '*:Zone.Identifier' \
  index.html assets root@SERVER:/var/www/sarthlutions/
```

(~480 KB. `assets/logo.webp` master dan `tailwind.src.css` tidak dipakai halaman.)

Blok nginx minimal:

```nginx
server {
  listen 80;
  server_name sarthlutions.id www.sarthlutions.id;
  root /var/www/sarthlutions;
  index index.html;
  location ~* \.(css|js|png|webp)$ { expires 30d; add_header Cache-Control "public"; }
}
```

Lalu `certbot --nginx -d sarthlutions.id -d www.sarthlutions.id` untuk HTTPS —
`canonical`, `og:url`, dan `og:image` di `<head>` sudah menunjuk
`https://www.sarthlutions.id/`, jadi domain lain berarti mengganti ketiganya
sekaligus (`check.mjs` gagal kalau ketiganya tidak seasal).

## Isi berkas

```
index.html               seluruh halaman — semua section ada di sini
assets/tailwind.src.css  sumber build: @import + token @theme
assets/tailwind.css      HASIL BUILD — jangan disunting tangan
assets/style.css         CSS tulisan tangan: gradien, divider, kartu, marquee
assets/app.js            menu, form, sakelar bahasa, marquee, garis bawah nav
assets/clients/          logo klien        assets/certs/  lencana sertifikasi
CLAUDE.md                catatan teknis lengkap dan alasan di balik keputusan
TODO.md                  temuan audit; dua butir masih menunggu data klien
```

Halaman ini dwibahasa (ID/EN). Teks Indonesia ada di HTML, versi Inggrisnya di
atribut `data-en` pada elemen yang sama — **menambah paragraf berarti menambah
`data-en`-nya sekaligus**, kalau tidak ia akan tetap berbahasa Indonesia saat
halaman dialihkan ke Inggris.

Yang masih butuh data dari klien sebelum rilis ada di `TODO.md`.
