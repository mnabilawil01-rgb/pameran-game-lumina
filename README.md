# Lumina Adventure

Lumina Adventure adalah game petualangan RPG 2D yang dibuat dengan **RPG Maker MZ**. Pemain menjelajahi istana Lumina, memasuki berbagai area yang disebut Sanctum/Dungeon, melawan musuh, menyelesaikan rintangan, dan membuka progres menuju tahap akhir.

> Status proyek: **masih dalam pengembangan**. Beberapa area dan alur masih berupa proses pengujian atau belum diberi isi cerita lengkap.

## Daftar Isi

- [Gambaran Game](#gambaran-game)
- [Cerita dan Tujuan](#cerita-dan-tujuan)
- [Alur Permainan](#alur-permainan)
- [Mekanika Utama](#mekanika-utama)
- [Karakter](#karakter)
- [Area dan Peta](#area-dan-peta)
- [Pengendalian](#pengendalian)
- [Sistem dan Fitur](#sistem-dan-fitur)
- [Menjalankan Game](#menjalankan-game)
- [Struktur Proyek](#struktur-proyek)
- [Pengembangan](#pengembangan)
- [Catatan Progres](#catatan-progres)
- [Lisensi dan Kredit Aset](#lisensi-dan-kredit-aset)

## Gambaran Game

| Detail | Informasi |
|---|---|
| Judul | Lumina Adventure |
| Mesin | RPG Maker MZ |
| Genre | RPG petualangan / dungeon |
| Mode | Pemain tunggal |
| Resolusi | 816 x 624 piksel |
| Mata uang | G |
| Sistem pertarungan | Turn-based RPG Maker MZ |

## Cerita dan Tujuan

Pemain berperan sebagai petualang yang datang ke **Lumina's Palace**. Di istana ini, pemain menerima tugas untuk membersihkan seluruh lawan yang berada di Sanctum. Setiap wilayah menghadirkan musuh, perangkap, pintu terkunci, puzzle, atau tantangan khusus.

Tujuan utamanya adalah:

1. Memilih karakter saat berada pada alur pemilihan karakter.
2. Berbicara dengan tokoh penjaga/pemandu di Lumina's Palace.
3. Memasuki level yang tersedia melalui pintu pusat istana.
4. Menyelesaikan musuh dan rintangan di setiap level.
5. Melanjutkan ke level berikutnya melalui portal atau event lanjutan.
6. Mengumpulkan senjata baru dan membuka jalur yang sebelumnya terkunci.
7. Melihat pencapaian/ending yang tersedia.

## Alur Permainan

### 1. Pembukaan

Game menggunakan **Level 1** sebagai titik awal pada konfigurasi saat ini (`startMapId` bernilai 3). Pemain mulai memasuki area dungeon dan dapat menjelajahi ruangan untuk menemukan musuh serta petunjuk.

Ada pula peta khusus bernama `gender select`. Peta tersebut menampilkan pilihan:

- `male`
- `female`

Setelah memilih, game memperlihatkan konfirmasi dan memindahkan karakter ke Lumina's Palace.

### 2. Lumina's Palace

Lumina's Palace berfungsi sebagai **hub utama**. Di sini pemain dapat:

- Mendapatkan arahan mengenai tugas Sanctum.
- Berjalan mengelilingi istana.
- Mengunjungi toko senjata.
- Mengunjungi toko armor.
- Mengunjungi toko item.
- Memilih pintu untuk memasuki level tertentu.

NPC di Nexus menjelaskan bahwa tugas pemain adalah mengalahkan lawan di dalam Sanctum. Pintu menuju beberapa level dapat digunakan setelah syarat atau progres tertentu terpenuhi.

### 3. Level 1

Level 1 adalah area dasar yang berisi:

- Eksplorasi ruangan.
- Pertemuan musuh.
- Treasure berupa kunci pintu lantai 1.
- Pintu yang awalnya terkunci.
- Sebuah puzzle riddle.
- Portal untuk kembali atau melanjutkan perjalanan.

Riddle yang ditemukan berkaitan dengan pertanyaan:

> "What goes up and never comes down?"

Petunjuk pada peta menunjuk ke jawaban **Your Age**. Memilih jawaban yang benar membebaskan atau membuka progres pintu. Jawaban yang salah dapat dipantulkan oleh dialog, dan pemain perlu mencari petunjuk pada peta.

Setelah kunci ditemukan dan pintu berhasil dibuka, pemain dapat menuju area lanjutan.

### 4. Progres Level

Pertarungan dan penyelesaian area dicatat melalui variabel progres, switch, dan dialog lanjutan. Contoh kondisi alur yang digunakan dalam data game:

- Switch `char` menandai pilihan karakter.
- Switch `rythm selesai` menandai penyelesaian tantangan tertentu.
- Switch `menang` menandai kemenangan.
- Switch `lanjut` mengendalikan opsi untuk melanjutkan.
- Switch `riddle1` menandai penyelesaian riddle.
- Switch `Doorlvl1` menandai pintu Level 1 terbuka.
- Switch `portal_muncul` menandai portal aktif.
- Switch `7 level selesai` menandai penyelesaian urutan tujuh level.
- Switch `kris_kiri_on` dan `kris_kanan_on` menandai dua kristal pada puzzle.
- Variabel `progres_lvl` menyimpan tahap progres level.

Alur level yang terhubung dari pintu istana meliputi:

| Level | Peta | Tipe tantangan/pembaruan |
|---|---|---|
| 1 | `Map003` | Riddle, kunci, pintu terkunci, musuh |
| 2 | `Map010` | Pertempuran lanjutan, pesan keberhasilan, senjata baru |
| 3 | `Map011` | Dua kristal kiri-kanan, pintu terkunci, musuh |
| 4 | `Map005` | Pertempuran level menengah |
| 5 | `Map004` | Pertempuran lanjutan |
| 6 | `Map002` | Pertempuran dan senjata baru |
| 7 | `Map012` | Pertempuran akhir area, pemberitahuan Level 7 selesai |
| 8 | `Map016` | Pertempuran dan pemenuhan progres |
| 9 | `Map013` | Perburuan musuh dan hadiah |
| 10 | `Map015` | Area level 10, masih dalam pengembangan/penyelesaian konten |

Urutan ini tidak harus dijalankan secara linear. Pintu di istana dapat mengirim pemain ke level yang tersedia sesuai state game.

### 5. Puzzle Kristal Level 3

Pada Level 3 terdapat dua kristal:

- Kristal kiri.
- Kristal kanan.

Pemain harus menyentuh kedua kristal. Setelah kristal kiri dan kanan menyala, pintu yang sebelumnya terkunci dapat terbuka. Dialog pintu menjelaskan bahwa dua sisi kristal harus dinyalakan.

### 6. Pertarungan dan Hadiah

Setiap level memiliki musuh atau enemy event. Saat musuh dikalahkan, pemain dapat:

- Mendapatkan EXP.
- Mendapatkan G atau barang.
- Memperoleh senjata baru.
- Membuka pilihan untuk melanjutkan.
- Kembali ke istana melalui portal.

Event tertentu juga menawarkan pilihan istirahat. Memilih istirahat membuka peluang pemulihan sesuai data dan plugin/map event RPG Maker.

### 7. Peluang Melanjutkan atau Kembali

Di beberapa area terdapat event bertuliskan `go lanjut` dan `rest`:

- `go lanjut` menanyakan apakah pemain ingin menuju level berikutnya.
- `rest` menanyakan apakah pemain ingin istirahat.
- Berbeda dengan rest, kembali ke istana dilakukan melalui portal atau event map tertentu.

### 8. Ending

Data proyek memiliki peta `ending` (`Map015`, nama internal menunjukkan level 10) dan pesan area lanjutan pada Level 2:

> "Congratulations. You made it this far. But sadly. This is the end."

Ending saat ini belum terhubung sebagai cutscene penuh pada semua jalur dan masih perlu diperluas.

## Mekanika Utama

### Pertarungan

- Pertarungan memakai sistem turn-based bawaan RPG Maker MZ.
- Pemain dapat menyerang, bertahan, menggunakan item, atau menggunakan skill.
- Pengaturan battle BGM menggunakan `Battle1`.
- Victory ME menggunakan `Victory1`.
- Defeat ME menggunakan `Defeat1`.

### Penjelajahan

- Peta dibuat dengan tileset RPG Maker MZ.
- Terdapat banyak transfer antar-peta.
- Beberapa pintu dikunci oleh switch atau variabel.
- Player dapat berlari dan menyimpan permainan.
- Autosave diaktifkan.

### Progress dan Save

- Autosave aktif.
- Menu Save tersedia dalam permainan.
- Progress disimpan dalam variabel dan switch RPG Maker MZ.
- Penyimpanan data dapat dikelola pada folder `save/`.

### Toko

Lumina's Palace memiliki tiga toko:

- Weapon Shop
- Armor Shop
- Item Shop

Toko membantu pemain menyiapkan perlengkapan sebelum masuk Sanctum.

## Karakter

Data aktor yang tersedia:

| Aktor | Nama | Kelas | Peran |
|---|---|---|---|
| 1 | Pyroxis | Class 1 | Karakter pilihan male / protagonis utama |
| 2 | Remielle | Class 1 | Karakter pilihan female / protagonis utama |
| 6 | Megu | Class 2 | Aktor pendukung |
| 7 | Zhong | Class 3 | Aktor pendukung |
| 9 | Nia | Class 8 | Aktor pendukung |
| 10 | Jack | Class 7 | Aktor pendukung |

Aktor lain masih kosong dan dapat digunakan untuk pengembangan lanjutan.

## Area dan Peta

| Peta | Nama | Fungsi |
|---|---|---|
| Map001 | Gender Select | Pemilihan karakter |
| Map003 | Level 1 Phase 1 | Area awal dan riddle |
| Map010 | Level 2 | Pertarungan lanjutan |
| Map011 | Level 3 | Puzzle dua kristal |
| Map005 | Level 1 Phase 4 | Area level 4 |
| Map004 | Level 1 Phase 5 | Area level 5 |
| Map002 | Level 1 Phase 6 | Area level 6 |
| Map012 | Level 7 | Penyelesaian level 7 |
| Map016 | Level 8 | Area level 8 |
| Map013 | Level 9 | Area level 9 |
| Map015 | Level 10 / Ending | Area akhir |
| Map008 | Lumina's Palace | Hub, NPC, toko, portal antar-level |

File map disimpan dalam format JSON pada folder `data/`.

## Pengendalian

Kontrol bawaan RPG Maker MZ bergantung pada perangkat dan mode bermain.

| Aksi | Keyboard | Arah |
|---|---|---|
| Bergerak | Tombol arah / WASD | Atas, bawah, kiri, kanan |
| Konfirmasi | Z, Enter, atau klik | - |
| Membatalkan/Buka menu | X, Esc, atau klik | - |
| Menu | X atau Esc | - |
| Berlari | Shift | Saat bergerak |

> Kontrol untuk versi desktop dapat berbeda jika binding RPG Maker MZ diubah.

## Sistem dan Fitur

- Pilihan karakter male/female.
- Sistem pertarungan turn-based.
- Beberapa item, senjata, armor, skill, dan state.
- Peta dungeon bertema.
- Puzzle riddle.
- Puzzle dua kristal.
- Pintu terkunci berbasis switch.
- Portal antar-area.
- Sistem XP, level, G, dan equipment.
- Hub utama berupa istana.
- Autosave.
- Toko senjata, armor, dan item.
- Musik latar, SE, battle BGM, victory/defeat ME.
- Efek visual Effekseer (`.efkefc`) untuk pertarungan dan skill.

## Menjalankan Game

Proyek ini merupakan game web RPG Maker MZ, sehingga dapat dijalankan menggunakan server lokal.

### Menggunakan VS Code

1. Buka folder proyek di VS Code.
2. Pasang ekstensi **Live Server**.
3. Klik kanan `index.html`.
4. Pilih **Open with Live Server**.
5. Buka alamat lokal yang ditampilkan Live Server.

### Menggunakan terminal

Pastikan Python tersedia, lalu jalankan:

```bash
python -m http.server 8080
```

Buka `http://localhost:8080` pada browser.

Sebagai alternatif, game dapat dijalankan melalui runtime desktop yang mendukung konfigurasi pada `package.json`, namun NW.js/runtime desktop tidak disertakan sebagai dependency pada proyek ini.

## Struktur Proyek

```text
.
├── index.html          # Entry point game
├── package.json        # Konfigurasi window/runtime
├── README.md           # Dokumentasi proyek
├── game.rmmzproject    # File proyek RPG Maker MZ
├── audio/              # BGM, BGS, ME, dan SE
├── css/                # Styling launcher/game
├── data/               # Data aktor, peta, item, skill, musuh, dan sistem
├── effects/            # Efek visual Effekseer
├── fonts/              # Font antarmuka
├── icon/               # Ikon aplikasi
├── img/                # Gambar, tileset, wajah, battle art, dan UI
├── js/                 # Mesin dan plugin RPG Maker MZ
├── movies/             # Video pendukung
└── save/               # Folder penyimpanan
```

## Pengembangan

Untuk mengubah game, buka `game.rmmzproject` menggunakan **RPG Maker MZ** yang sesuai.

Perubahan penting disimpan pada file/folder berikut:

- Peta dan event: `data/Map*.json`
- Urutan peta dan nama: `data/MapInfos.json`
- Aktor: `data/Actors.json`
- Musuh: `data/Enemies.json`
- Troop/battle: `data/Troops.json`
- Item: `data/Items.json`
- Senjata dan armor: `data/Weapons.json` dan `data/Armors.json`
- Skill dan state: `data/Skills.json` dan `data/States.json`
- Konfigurasi global: `data/System.json`

Saat mengedit melalui RPG Maker MZ, hindari mengubah JSON secara manual kecuali untuk debugging atau pengelolaan proyek.

## Catatan Progres

Beberapa bagian yang masih perlu disempurnakan:

- Penyelesaian ending dan cutscene akhir.
- Konsistensi urutan Level 1 sampai Level 10.
- Penyempurnaan isi cerita pada beberapa area.
- Pengujian seluruh path switch dan riddle.
- Pengisian peta/isi Level 10.
- Konsistensi nama dan teks dialog bahasa Inggris.
- Pengujian save/load pada setiap transfer map.
- Penyempurnaan karakter serta aktor yang masih kosong.
- Validasi data pengecekan musuh dan reward.

## Lisensi dan Kredit Aset

Proyek ini dibuat menggunakan RPG Maker MZ dan aset bawaan/pendukung dari ekosistem RPG Maker. Hak aset bawaan dan aset pihak ketiga dapat tunduk pada lisensi masing-masing.

Pastikan untuk memeriksa hak penggunaan aset audio, gambar, font, plugin, dan efek sebelum mempublikasikan atau mendistribusikan game secara komersial.

Jika bagian lisensi aset memiliki syarat khusus, tambahkan daftar kredit dan tautan lisensi aset pada bagian ini sebelum rilis publik.
