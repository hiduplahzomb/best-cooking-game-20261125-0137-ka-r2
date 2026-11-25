# Ramen Rush — Kedai Mie Beruap

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/hiduplahzomb/best-cooking-game-20261125-0137-ka-r2/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/hiduplahzomb/best-cooking-game-20261125-0137-ka-r2/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Game memasak ramen di kedai kecil. Rebus mi di dua keranjang perebus, panggang
dan potong topping di stasiun panggangan, rakit mangkuk ramen berlapis, dan
sajikan pesanan sebelum kesabaran pelanggan habis.

## Cara main

- **Klik panci / tombol kaldu** — tuang kaldu Shoyu, Tonkotsu, atau Miso ke
  mangkuk aktif.
- **Klik keranjang mi kosong** — mi mulai direbus (±6 detik). Klik lagi saat
  **MATANG** untuk memasukkannya ke mangkuk; kalau kelamaan, mi gosong dan
  harus dibuang.
- **Klik tombol topping** — topping dimasak di salah satu dari dua slot
  panggangan. Klik topping yang sudah **SIAP** untuk memasukkannya ke mangkuk.
- **Klik mangkuk** (atau tombol `1` / `2`) — pilih mangkuk aktif.
- **Klik SAJIKAN** — antar mangkuk yang isinya sama persis dengan pesanan.

Sajian benar beruntun menaikkan kombo sampai **x4**. Capai **1000 poin**
untuk menang. Pelanggan yang kehabisan kesabaran pergi dan nyawa berkurang;
tiga kali gagal, kedai tutup.

## Kontrol

| Input | Fungsi |
| --- | --- |
| Mouse | Klik semua stasiun |
| `1` / `2` | Pilih mangkuk 1 / 2 |
| `M` | Bisu / nyalakan suara |
| `P` | Jeda |
| `R` | Main lagi (di layar akhir) |

## Teknologi

Canvas 2D murni, tanpa library dan tanpa permintaan jaringan. Semua gambar
(mangkuk ramen, kaldu, mi, topping, wajah pelanggan, uap) digambar dengan kode,
dan semua bunyi dibuat dengan WebAudio. Game berjalan offline dari file statis
di `game/`.

## Struktur kode

- `game/src/config.js` — semua angka konkret (waktu, skor, layout)
- `game/src/recipes.js` — kaldu, topping, sifat pelanggan, pembuat pesanan
- `game/src/stations.js` — mesin status keranjang mi, panggangan, mangkuk
- `game/src/particles.js` — uap dan teks skor mengambang
- `game/src/audio.js` — bunyi WebAudio + tombol bisu
- `game/src/renderer.js` — semua gambar dapur dan mangkuk ramen
- `game/src/input.js` — klik mouse dan keyboard ke stasiun
- `game/src/loop.js` — status permainan, kombo, menang/kalah
- `game/src/main.js` — titik masuk, loop 60 fps

## Menjalankan

```sh
node serve.ts
# buka http://localhost:8080
```

## Lisensi

MIT — lihat [LICENSE](LICENSE).
