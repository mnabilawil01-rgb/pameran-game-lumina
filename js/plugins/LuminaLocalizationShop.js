/*:
 * @target MZ
 * @plugindesc Localizes player-facing Lumina text and clarifies native shop listings.
 * @author Lumina
 *
 * @help
 * Translates game terms, database descriptions, map messages, and choices at
 * runtime without changing event IDs, database IDs, or plugin battle logic.
 * The existing RPG Maker shop processing remains in use.
 */

(() => {
    const dialogue = {
        "male": "Laki-laki",
        "female": "Perempuan",
        "?????": "Pilih Karakter",
        "Level 7 selesai. Kembali ke istana?": "Fase 7 selesai. Kembali ke istana?",
        "select your character..": "Pilih karaktermu.",
        "is that your choice?": "Kamu yakin dengan pilihan ini?",
        "good luck out there....": "Semoga berhasil!",
        "Yes": "Ya",
        "No": "Tidak",
        "calendar": "Kalender",
        "Your age": "Usia",
        "????": "????",
        "what do we have here now.": "Apa yang kita temukan di sini?",
        "you shall die.": "Kau akan mati.",
        "You gain New weapon!": "Kamu memperoleh senjata baru!",
        "proceed to the next level?": "Lanjut ke fase berikutnya?",
        "Do you want to rest for a while?": "Kamu ingin beristirahat sejenak?",
        "doors now unlocked.": "Pintunya kini terbuka.",
        "this doors is locked tight.": "Pintu ini terkunci rapat.",
        "i should find the key.": "Aku harus mencari kuncinya.",
        "This door have riddle on it.": "Ada teka-teki di pintu ini.",
        "\\C[2]what goes up and never comes down?\\C[0]":
            "\\C[2]Apa yang selalu bertambah dan tak pernah berkurang?\\C[0]",
        "I think it's wrong.": "Sepertinya jawabanku salah.",
        "i need to find the clue.": "Aku harus mencari petunjuknya.",
        "\\C[2]Bingo.\\C[0]": "\\C[2]Benar.\\C[0]",
        "now i can enter the room.": "Sekarang aku bisa masuk ke ruangan ini.",
        "1F key door was found!": "Kunci pintu lantai 1 ditemukan!",
        "There was nothing...": "Tidak ada apa-apa...",
        "Who dared step to this place.": "Siapa yang berani menginjakkan kaki di sini?",
        "will suffer to death.": "Kalian akan menerima akibatnya.",
        "Now i can choose between go": "Sekarang aku bisa memilih untuk",
        "fight again or back to lumine's": "bertarung lagi atau kembali ke",
        "palace.": "Istana Lumina.",
        "the blue portal will take us to lumina's":
            "Portal biru akan membawa kita ke",
        "the red portal will take us to next lvl":
            "Portal merah akan membawa kita ke fase",
        "what goes up and never comes down?":
            "Apa yang selalu bertambah dan tak pernah berkurang?",
        "\\C[2]Your Age\\C[0] because its always":
            "\\C[2]Usia\\C[0], karena selalu bertambah",
        "goes up and never comes down": "dan tak pernah berkurang.",
        "I think i found something.": "Sepertinya aku menemukan sesuatu.",
        "......": "......",
        "Die.": "Mati.",
        "hmmmm": "Hmm...",
        "Welcome..": "Selamat datang.",
        "Feel free to look around": "Silakan melihat-lihat.",
        "Feel free to browse item..": "Silakan melihat-lihat barang kami.",
        "Hello..": "Halo.",
        "Welcome to Lumina's palace": "Selamat datang di Istana Lumina.",
        "This place is where you prepared for anything":
            "Di sinilah kamu bersiap menghadapi segala hal ",
        "that will happen": "yang mungkin terjadi.",
        "Your task is very simple.": "Tugasmu sederhana.",
        "Clear all the Opponent in the": "Kalahkan semua lawan di",
        "sanctum (Dungeon)": "ruang bawah tanah.",
        "You can buy or upgrade your stuff in":
            "Kamu bisa membeli atau meningkatkan perlengkapan di ",
        "the available shops around here.": "toko-toko di sekitar sini.",
        "Good luck..": "Semoga berhasil.",
        "do you want to proceed to level 8?": "Mau lanjut ke fase 8?",
        "do you want to proceed to level 7?": "Mau lanjut ke fase 7?",
        "do you want to proceed to level 6?": "Mau lanjut ke fase 6?",
        "do you want to proceed to level 5?": "Mau lanjut ke fase 5?",
        "do you want to proceed to level 4?": "Mau lanjut ke fase 4?",
        "do you want to proceed to level 3?": "Mau lanjut ke fase 3?",
        "do you want to proceed to level 2?": "Mau lanjut ke fase 2?",
        "do you want to proceed to level 1?": "Mau lanjut ke fase 1?",
        "30\\G were found!": "Ditemukan 30\\G!",
        "Congratulations.": "Selamat.",
        "you made it this far.": "Kamu berhasil sampai sejauh ini.",
        "but sadly.": "Namun, sayangnya...",
        "This is the end.": "Inilah akhirnya.",
        "the bridge seems broken.": "Sepertinya jembatan ini rusak.",
        "we need to find a way around.": "Kita harus mencari jalan lain.",
        "touch this crystal?": "Sentuh kristal ini?",
        "tch....": "Cih....",
        "since when u got here huh.": "Sejak kapan kau sampai di sini?",
        "Its locked.": "Terkunci.",
        "we need to light 2 crystal in order": "Kita harus menyalakan dua kristal",
        "to open this.": "untuk membuka pintu ini.",
        "The right and left side.": "Kristal di sisi kanan dan kiri.",
        "Chose where to next.": "Pilih tujuan berikutnya.",
        "chose where to next.": "Pilih tujuan berikutnya.",
        "fight the boss.": "Kalahkan bos.",
        "Go inside.": "Masuklah.",
        "try open the door.": "Coba buka pintu.",
        "Find the key.": "Temukan kunci.",
        "fight the unknown.": "Hadapi lawan misterius.",
        "push forward.": "Terus maju.",
        "Find a clue.": "Temukan petunjuk.",
        "open the door.": "Buka pintu.",
        "move forward.": "Terus bergerak.",
        "fight the bos.": "Kalahkan bos.",
        "Fight the bos.": "Kalahkan bos.",
        "Go to red teleportal to start.": "Gunakan portal merah untuk memulai.",
        "find a way around.": "Cari jalan lain.",
        "go forward.": "Terus maju."
    };

    const choiceTranslations = {
        ...dialogue,
        "Yes": "Ya",
        "No": "Tidak"
    };

    const itemData = {
        1: ["Barang Pemulihan", "Kategori barang pemulihan."],
        6: ["Barang Pemulihan", "Kategori barang pemulihan."],
        7: ["Ramuan", "Memulihkan 50% HP maksimum."],
        8: ["Ramuan Super", "Memulihkan 1.500 HP."],
        9: ["Ramuan Penuh", "Memulihkan seluruh HP."],
        10: ["Air Sihir", "Memulihkan 300 MP."],
        11: ["Stimulan", "Menghidupkan kembali satu anggota dan memulihkan setengah HP-nya."],
        12: ["Herba Penawar", "Menghapus semua kondisi negatif. Tidak dapat menghidupkan anggota yang gugur."],
        13: ["Penawar Racun", "Menyembuhkan racun atau kelumpuhan."],
        14: ["Tetesan Ajaib", "Memulihkan setengah HP dan MP."],
        15: ["Eliksir", "Memulihkan seluruh HP dan MP."],
        17: ["Barang Khusus", "Kategori barang khusus."],
        18: ["Pengurang Pertemuan", "Mengurangi jumlah musuh yang ditemui untuk sementara."],
        19: ["Peningkat Hadiah", "Meningkatkan barang dan uang yang didapat dari pertarungan untuk sementara."],
        22: ["Barang Peningkat", "Kategori barang peningkat."],
        23: ["Peningkat HP", "Meningkatkan HP maksimum sebesar 50."],
        24: ["Peningkat MP", "Meningkatkan MP maksimum sebesar 10."],
        25: ["Peningkat Serangan", "Meningkatkan Serangan sebesar 3."],
        26: ["Peningkat Pertahanan", "Meningkatkan Pertahanan sebesar 3."],
        27: ["Peningkat Sihir", "Meningkatkan Serangan Sihir sebesar 3."],
        28: ["Peningkat Resistansi", "Meningkatkan Pertahanan Sihir sebesar 3."],
        29: ["Peningkat Kelincahan", "Meningkatkan Kelincahan sebesar 3."],
        30: ["Peningkat Keberuntungan", "Meningkatkan Keberuntungan sebesar 3."],
        39: ["Barang Kunci", "Kategori barang kunci."],
        40: ["Kunci Fase 1", "Kunci untuk membuka sebuah pintu."],
        41: ["Ikan", ""]
    };

    const weaponNames = {
        1: "Pedang Pendek", 2: "Pedang Panjang", 3: "Pedang Falchion",
        4: "Pedang Mithril", 5: "Pedang Naga",
        7: "Tongkat Kayu", 8: "Tongkat Sihir", 9: "Tongkat Kekuatan",
        10: "Tongkat Mithril", 11: "Tongkat Naga",
        13: "Cambuk Batu", 14: "Cambuk Perunggu", 15: "Bintang Fajar",
        16: "Cambuk Mithril", 17: "Cambuk Naga",
        19: "Kapak Genggam", 20: "Kapak Perang", 21: "Kapak Bardiche",
        22: "Kapak Mithril", 23: "Kapak Naga",
        25: "Tombak Pendek", 26: "Tombak Panjang", 27: "Tombak Kapak",
        28: "Tombak Mithril", 29: "Tombak Naga",
        31: "Sarung Tangan Cestus", 32: "Buku Lima", 33: "Cakar Besi",
        34: "Cakar Mithril", 35: "Cakar Naga",
        37: "Busur Pendek", 38: "Busur Panjang", 39: "Busur Silang",
        40: "Busur Mithril", 41: "Busur Naga",
        43: "Pisau", 44: "Belati", 45: "Golok", 46: "Belati Mithril",
        47: "Belati Naga", 50: "Senjata Khusus",
        51: "Pedang Suci", 52: "Pedang Hakuji", 53: "Pedang Sutra",
        54: "Pedang Putih", 59: "Senjata Fase",
        60: "Sabetan Aether I", 61: "Taring Bayangan II",
        62: "Pembelah Kekosongan III", 63: "Pemuas Darah IV",
        64: "Tulang Punggung Surgawi V", 65: "Pemecah Badai VI",
        66: "Mata Pedang Neraka VII", 67: "Gigitan Embun Beku VIII",
        68: "Penuai Jiwa IX", 69: "Bisikan Malapetaka X"
    };

    const armorNames = {
        1: "Zirah", 2: "Pakaian Linen", 3: "Rompi Kulit",
        4: "Pakaian Petualang", 5: "Kulit Keras", 6: "Zirah Brigandine",
        8: "Zirah Kain", 9: "Zirah Kulit", 10: "Baju Zirah Perunggu",
        11: "Baju Zirah Besi", 12: "Baju Zirah Mithril",
        13: "Baju Zirah Naga", 15: "Zirah Perunggu", 16: "Zirah Besi",
        17: "Zirah Mithril", 18: "Zirah Naga", 20: "Jubah Katun",
        21: "Jubah Sutra", 22: "Jubah Ahli Taktik", 23: "Jubah Sage",
        24: "Jubah Elemental", 26: "Perisai",
        27: "Perisai Kecil", 28: "Perisai Bundar", 29: "Perisai Berduri",
        30: "Perisai Mithril", 31: "Perisai Naga", 33: "Perisai Kayu",
        34: "Perisai Perunggu", 35: "Perisai Besi",
        36: "Perisai Mithril", 37: "Perisai Naga",
        39: "Gelang Kayu", 40: "Gelang Perunggu", 41: "Gelang Besi",
        42: "Gelang Mithril", 43: "Gelang Naga", 45: "Pelindung Kepala",
        46: "Ikat Kepala", 47: "Ikat Kepala Kulit", 48: "Topi Kulit",
        49: "Serban", 50: "Topi Berbulu", 52: "Topi Kulit",
        53: "Topi Kayu", 54: "Topi Perunggu", 55: "Topi Besi",
        56: "Topi Mithril", 57: "Topi Naga", 59: "Penutup Kepala Rantai",
        60: "Helm Perunggu", 61: "Helm Besi", 62: "Helm Mithril",
        63: "Helm Naga", 65: "Topi Lancip", 66: "Mahkota Kecil",
        67: "Mahkota Perak", 68: "Mahkota Emas",
        69: "Mahkota Mithril", 70: "Mahkota Master",
        72: "Aksesori", 73: "Batu Pelindung", 74: "Cincin Pelindung",
        75: "Batu Kekuatan", 76: "Cincin Kekuatan",
        77: "Batu Kecepatan", 78: "Cincin Kecepatan",
        79: "Batu Keberuntungan", 80: "Cincin Keberuntungan",
        81: "Batu Sihir", 82: "Cincin Sihir",
        83: "Batu Penembak", 84: "Cincin Penembak",
        85: "Batu Master", 86: "Cincin Master",
        88: "Cincin Pelindung Racun", 89: "Cincin Antiracun Mutlak",
        91: "Cincin Pelindung Mental", 92: "Cincin Pelindung Mental Mutlak",
        94: "Radar Musuh", 95: "Lonceng Peringatan",
        96: "Penyimpan TP", 97: "Cincin Semangat", 98: "Penghemat MP",
        99: "Pelindung Elemen", 100: "Kacamata"
    };

    const armorDescriptions = {
        85: "Azimat yang mengurangi biaya MP sebesar 20%.",
        86: "Cincin yang mengurangi biaya MP sebesar 50%.",
        88: "Cincin yang membantu mencegah racun dan kelumpuhan.",
        89: "Cincin yang sepenuhnya mencegah racun dan kelumpuhan.",
        91: "Cincin yang membantu mencegah tidur, bisu, bingung, pesona, dan amuk.",
        92: "Cincin yang sepenuhnya mencegah tidur, bisu, bingung, pesona, dan amuk.",
        94: "Meningkatkan peluang untuk menyerang lebih dahulu.",
        95: "Mencegah serangan kejutan.",
        96: "Menyimpan TP agar tetap terbawa ke pertarungan berikutnya.",
        97: "Meningkatkan laju pengisian TP.",
        98: "Mengurangi biaya MP.",
        99: "Mengurangi setengah kerusakan dari serangan api, air, angin, dan tanah.",
        100: "Mempertajam penglihatan dan meningkatkan akurasi."
    };

    const weaponGroups = {
        1: "pedang", 2: "pedang", 3: "pedang", 4: "pedang", 5: "pedang",
        7: "tongkat", 8: "tongkat", 9: "tongkat", 10: "tongkat", 11: "tongkat",
        13: "cambuk", 14: "cambuk", 15: "cambuk", 16: "cambuk", 17: "cambuk",
        19: "kapak", 20: "kapak", 21: "kapak", 22: "kapak", 23: "kapak",
        25: "tombak", 26: "tombak", 27: "tombak", 28: "tombak", 29: "tombak",
        31: "sarung tangan", 32: "cakar", 33: "cakar", 34: "cakar", 35: "cakar",
        37: "busur", 38: "busur", 39: "busur silang", 40: "busur silang", 41: "busur",
        43: "pisau", 44: "belati", 45: "belati", 46: "belati", 47: "belati"
    };

    const stateNames = {
        1: "Gugur", 2: "Bertahan", 3: "Kebal", 4: "Racun",
        5: "Buta", 6: "Bisu", 7: "Amuk", 8: "Bingung",
        9: "Terpesona", 10: "Tidur", 12: "Lumpuh", 13: "Pingsan",
        15: "Pemulihan HP", 16: "Pemulihan MP", 17: "Pemulihan TP",
        18: "Pantulan Sihir", 19: "Perlindungan", 20: "Provokasi",
        21: "Bersembunyi", 22: "Serangan Balik",
        23: "Kebal Kondisi Negatif", 24: "Pengurangan Biaya MP",
        25: "Kekuatan Api", 26: "Kekuatan Es", 27: "Kekuatan Petir",
        29: "Pertemuan Berkurang", 30: "Hadiah Pertempuran Ganda"
    };

    const classNames = {
        1: "Pendekar Pedang",
        2: "Penyihir",
        3: "Pendeta",
        4: "Ksatria",
        5: "Petarung",
        6: "Pendekar Sihir",
        7: "Pemburu",
        8: "Perampok"
    };

    const skillNames = {
        1: "Serang", 2: "Bertahan", 3: "Keahlian",
        11: "Musuh", 12: "Serangan Ganda", 13: "Serangan Kembar",
        14: "Serangan Tiga Kali", 15: "Kabur", 16: "Amati",
        17: "Sedot Darah", 18: "Meditasi", 19: "Penenang",
        20: "Bantingan", 21: "Kejutan", 22: "Lendir",
        23: "Racun Bisa", 24: "Teriakan", 25: "Tarian Aneh",
        26: "Membatu", 27: "Tusuk Mata", 28: "Badai Pasir",
        29: "Kilat", 30: "Kabut Beracun", 31: "Lagu Pengantar Tidur",
        32: "Melodi Pemikat", 33: "Lagu Pembungkam", 34: "Gelombang Suara",
        35: "Lempar Batu", 36: "Angin Puyuh", 37: "Napas Api",
        38: "Napas Es", 39: "Gempa Bumi", 40: "Tsunami", 41: "Cakar",
        51: "Sihir Dasar", 52: "Pulih I", 53: "Pulih II", 54: "Pulih III",
        56: "Pemulihan I", 57: "Pemulihan II", 58: "Pemulihan III",
        60: "Penawar I", 61: "Penawar II", 62: "Penawar III",
        64: "Bangkit I", 65: "Bangkit II", 71: "Racun", 72: "Buta",
        73: "Bingung", 74: "Bisu", 75: "Tidur", 76: "Lumpuh",
        81: "Berkat Senjata", 82: "Kutukan Senjata",
        83: "Berkat Zirah", 84: "Kutukan Zirah",
        85: "Berkat Roh", 86: "Kutukan Roh",
        87: "Berkat Ilahi", 88: "Kutukan Ilahi",
        89: "Percepat Gerak", 90: "Perlambat Gerak",
        91: "Sedot Nyawa", 92: "Sedot Mana",
        99: "Api I", 100: "Api II", 101: "Api III",
        103: "Semburan Api I", 104: "Semburan Api II", 105: "Semburan Api III",
        107: "Es I", 108: "Es II", 109: "Es III",
        111: "Badai Salju I", 112: "Badai Salju II", 113: "Badai Salju III",
        115: "Petir I", 116: "Petir II", 117: "Petir III",
        119: "Kilat I", 120: "Kilat II", 121: "Kilat III",
        123: "Air I", 124: "Air II", 126: "Gelombang I", 127: "Gelombang II",
        129: "Batu I", 130: "Batu II", 132: "Gempa I", 133: "Gempa II",
        135: "Angin I", 136: "Angin II", 138: "Tornado I", 139: "Tornado II",
        141: "Cahaya I", 142: "Cahaya II", 144: "Cahaya Bintang I",
        145: "Cahaya Bintang II", 147: "Bayangan I", 148: "Bayangan II",
        150: "Kegelapan I", 151: "Kegelapan II", 153: "Ledakan I",
        154: "Ledakan II", 156: "Nuklir I", 157: "Nuklir II",
        171: "Keahlian Pendekar Pedang", 172: "Serangan Kuat",
        173: "Tebasan", 174: "Serangan Ganda", 175: "Tekad",
        176: "Pertolongan Pertama", 177: "Kuda-Kuda Perawan",
        178: "Hantaman Putar", 185: "Keahlian Pendeta & Penyihir",
        186: "Perisai Sihir", 187: "Penguat Mantra", 188: "Seruan",
        189: "Meteor", 190: "Senjata Api", 191: "Senjata Es",
        192: "Senjata Petir", 193: "Cermin Sihir",
        195: "Keahlian Ksatria", 196: "Lindungi",
        197: "Tusukan Elang", 198: "Tusukan Ganda",
        199: "Pembelah Zirah", 200: "Teriakan Perang",
        201: "Kincir Angin", 202: "Pikiran Jernih", 203: "Tusukan Liar",
        205: "Keahlian Bandit", 206: "Tusuk Mata", 207: "Pemanasan",
        208: "Kobaran", 209: "Mata Waspada", 210: "Panggil Angin",
        211: "Bersembunyi", 215: "Keahlian Petarung",
        216: "Sapu", 217: "Qigong", 218: "Tendangan Memutar",
        219: "Tarian Harimau", 225: "Keahlian Pemburu",
        226: "Tembakan Jitu", 227: "Tembakan Pemingsan",
        228: "Tembakan Tim", 229: "Hujan Tembakan"
    };

    const skillDescriptionTranslations = {
        "Absorbs HP from an enemy.": "Menyerap HP dari satu lawan.",
        "Absorbs MP from an enemy.": "Menyerap MP dari satu lawan.",
        "Attacks all enemies.": "Menyerang semua lawan.",
        "Automatically protects allies with low HP for 1 turn.":
            "Melindungi otomatis sekutu dengan HP rendah selama 1 giliran.",
        "Increases items and money gained from battle for a while.":
            "Meningkatkan barang dan uang yang diperoleh dari pertarungan untuk sementara.",
        "Bestows Fire-type for 5 turns.": "Memberi elemen api selama 5 giliran.",
        "Bestows Ice-type for 5 turns.": "Memberi elemen es selama 5 giliran.",
        "Bestows Thunder-type for 5 turns.": "Memberi elemen petir selama 5 giliran.",
        "Blinds all enemies.": "Membutakan semua lawan.",
        "Blinds an enemy.": "Membutakan satu lawan.",
        "Charms all enemies.": "Memikat semua lawan.",
        "Confuses all enemies.": "Membingungkan semua lawan.",
        "Covers an enemy in slime and lowers their Agility.":
            "Menyelimuti satu lawan dengan lendir dan menurunkan Kelincahannya.",
        "Cures an ally's Poison, Paralysis, or Sleep state.":
            "Menyembuhkan racun, kelumpuhan, atau tidur pada satu sekutu.",
        "Cures an ally's status ailments other than Dead.":
            "Menghapus kondisi negatif dari satu sekutu, kecuali gugur.",
        "Cures all allies' status ailments other than Dead.":
            "Menghapus kondisi negatif semua sekutu, kecuali gugur.",
        "Glares at an enemy and paralyzes them.": "Menatap satu lawan hingga lumpuh.",
        "Cures the user from being weakened.":
            "Memulihkan pengguna dari efek pelemahan.",
        "Increases all allies' Defense and M.Defense. Usable up to 2 times in a row.":
            "Meningkatkan Pertahanan dan Pertahanan Sihir semua sekutu. Dapat digunakan dua kali berturut-turut.",
        "Decreases all enemies' Agility. Usable up to 2 times in a row.":
            "Menurunkan Kelincahan semua lawan. Dapat digunakan dua kali berturut-turut.",
        "Decreases all enemies' Attack. Usable up to 2 times in a row.":
            "Menurunkan Serangan semua lawan. Dapat digunakan dua kali berturut-turut.",
        "Decreases all enemies' Defense. Usable up to 2 times in a row.":
            "Menurunkan Pertahanan semua lawan. Dapat digunakan dua kali berturut-turut.",
        "Decreases all enemies' M.Attack. Usable up to 2 times in a row.":
            "Menurunkan Serangan Sihir semua lawan. Dapat digunakan dua kali berturut-turut.",
        "Decreases all enemies' M.Defense. Usable up to 2 times in a row.":
            "Menurunkan Pertahanan Sihir semua lawan. Dapat digunakan dua kali berturut-turut.",
        "Decreases an enemy's Attack and Defense.":
            "Menurunkan Serangan dan Pertahanan satu lawan.",
        "Greatly increases the user's M.Attack for 5 turns.":
            "Meningkatkan Serangan Sihir pengguna secara drastis selama 5 giliran.",
        "Increases an ally's Agility. Usable up to 2 times in a row.":
            "Meningkatkan Kelincahan satu sekutu. Dapat digunakan dua kali berturut-turut.",
        "Increases an ally's Attack. Usable up to 2 times in a row.":
            "Meningkatkan Serangan satu sekutu. Dapat digunakan dua kali berturut-turut.",
        "Increases an ally's Defense. Usable up to 2 times in a row.":
            "Meningkatkan Pertahanan satu sekutu. Dapat digunakan dua kali berturut-turut.",
        "Increases an ally's M.Attack. Usable up to 2 times in a row.":
            "Meningkatkan Serangan Sihir satu sekutu. Dapat digunakan dua kali berturut-turut.",
        "Increases an ally's M.Defense. Usable up to 2 times in a row.":
            "Meningkatkan Pertahanan Sihir satu sekutu. Dapat digunakan dua kali berturut-turut.",
        "Increases the user's Agility.": "Meningkatkan Kelincahan pengguna.",
        "Inflicts damage and causes all enemies to lose balance.":
            "Melukai semua lawan dan membuat mereka kehilangan keseimbangan.",
        "Inflicts damage and causes an enemy to lose balance.":
            "Melukai satu lawan dan membuatnya kehilangan keseimbangan.",
        "Inflicts damage on all enemies 2 times.":
            "Menyerang semua lawan dua kali.",
        "Inflicts damage on an enemy 5 times.":
            "Menyerang satu lawan lima kali.",
        "Inflicts damage on an enemy regardless of Defense.":
            "Menyerang satu lawan tanpa terpengaruh Pertahanan.",
        "Inflicts damage on all enemies regardless of Defense.":
            "Menyerang semua lawan tanpa terpengaruh Pertahanan.",
        "Inflicts huge damage on all enemies.":
            "Memberikan kerusakan besar kepada semua lawan.",
        "Inflicts Thunder-type damage and Paralysis state.":
            "Memberikan kerusakan petir dan melumpuhkan lawan.",
        "Performs a powerful attack on all enemies.":
            "Melancarkan serangan kuat kepada semua lawan.",
        "Performs a powerful attack on an enemy.":
            "Melancarkan serangan kuat kepada satu lawan.",
        "Performs a super powerful attack on an enemy.":
            "Melancarkan serangan sangat kuat kepada satu lawan.",
        "Performs an attack on an enemy faster than anyone else.":
            "Menyerang satu lawan lebih cepat daripada siapa pun.",
        "Performs an attack on an enemy twice.":
            "Menyerang satu lawan dua kali.",
        "Randomly performs 4 attacks on 4 enemies.":
            "Melancarkan empat serangan acak kepada empat lawan.",
        "Shoots at the footing of all enemies and causes them to lose balance.":
            "Menembak kaki semua lawan hingga mereka kehilangan keseimbangan.",
        "Slightly increases the user's TP.":
            "Sedikit meningkatkan TP pengguna.",
        "Rouses all allies' fighting spirit and increases Attack. Usable up to 2 times in a row.":
            "Membangkitkan semangat semua sekutu dan meningkatkan Serangan. Dapat digunakan dua kali berturut-turut.",
        "Rouses the user's fighting spirit and increases Attack. Usable up to 2 times in a row.":
            "Membangkitkan semangat pengguna dan meningkatkan Serangan. Dapat digunakan dua kali berturut-turut.",
        "Rouses the user's fighting spirit and fortifies their abilities.":
            "Membangkitkan semangat pengguna dan memperkuat kemampuannya.",
        "Sprays an enemy with venom and inflicts Poison state.":
            "Menyemprotkan bisa kepada satu lawan dan meracuninya.",
        "Stabs an enemy with paralyzing needles.":
            "Menusuk satu lawan dengan jarum pelumpuh.",
        "Inflicts damage on an enemy.": "Memberikan kerusakan kepada satu lawan.",
        "Makes the user harder to target.": "Membuat pengguna lebih sulit dijadikan sasaran.",
        "Performs a double attack on a random enemy.":
            "Menyerang satu lawan acak dua kali.",
        "Performs a series of attacks on an enemy.":
            "Melancarkan serangkaian serangan kepada satu lawan.",
        "Performs a triple attack on a random enemy.":
            "Menyerang satu lawan acak tiga kali.",
        "Poisons all enemies.": "Meracuni semua lawan.",
        "Paralyzes all enemies.": "Melumpuhkan semua lawan.",
        "Puts all enemies to sleep.": "Membuat semua lawan tertidur.",
        "Raises an ally from the dead.": "Menghidupkan kembali satu sekutu.",
        "Raises an ally from the dead and greatly restores their HP.":
            "Menghidupkan kembali satu sekutu dan memulihkan banyak HP.",
        "Reflects M.Attack aimed at the user for 5 turns.":
            "Memantulkan Serangan Sihir yang mengarah ke pengguna selama 5 giliran.",
        "Restores all allies' HP.": "Memulihkan HP semua sekutu.",
        "Restores an ally's HP.": "Memulihkan HP satu sekutu.",
        "Restores the user's HP.": "Memulihkan HP pengguna.",
        "Seals all enemies' magic.": "Membungkam sihir semua lawan.",
        "The user flees from battle.": "Pengguna melarikan diri dari pertarungan.",
        "Waits to see what happens.": "Menunggu untuk melihat situasi."
    };

    const elementTranslations = {
        Fire: "api",
        Ice: "es",
        Thunder: "petir",
        Water: "air",
        Earth: "tanah",
        Wind: "angin",
        Light: "cahaya",
        Darkness: "kegelapan"
    };

    const translateSkillDescription = description => {
        const normalized = description
            .replace(/\s+/g, " ")
            .replace(/\u2019/g, "'")
            .trim();
        if (skillDescriptionTranslations[normalized]) {
            return skillDescriptionTranslations[normalized];
        }
        const elemental = normalized.match(
            /^Inflicts (Fire|Ice|Thunder|Water|Earth|Wind|Light|Darkness)-type damage on (an enemy|all enemies)\.$/
        );
        if (elemental) {
            const target = elemental[2] === "an enemy" ? "satu lawan" : "semua lawan";
            return `Memberikan kerusakan elemen ${elementTranslations[elemental[1]]} kepada ${target}.`;
        }
        return description;
    };

    const translateRecords = (records, translations) => {
        for (const [id, values] of Object.entries(translations)) {
            const record = records[Number(id)];
            if (record) {
                record.name = values[0];
                if (values[1] !== undefined) {
                    record.description = values[1];
                }
            }
        }
    };

    const localizeTerms = system => {
        const terms = system.terms;
        const basic = ["Level", "Lv", "HP", "HP", "MP", "MP", "TP", "TP", "EXP", "EXP"];
        const commands = [
            "Bertarung", "Kabur", "Serang", "Bertahan", "Barang", "Keahlian",
            "Perlengkapan", "Status", "Formasi", "Simpan", "Keluar",
            "Pengaturan", "Senjata", "Zirah", "Barang Penting", "Pasang",
            "Optimalkan", "Lepas", "Mulai", "Lanjutkan", null, "Ke Layar Judul",
            "Kembali", null, "Beli", "Jual"
        ];
        const params = [
            "HP Maks", "MP Maks", "Serangan", "Pertahanan", "Serangan Sihir",
            "Pertahanan Sihir", "Kelincahan", "Keberuntungan", "Akurasi", "Hindar"
        ];
        [basic, commands, params].forEach((values, index) => {
            const key = ["basic", "commands", "params"][index];
            values.forEach((value, itemIndex) => {
                if (value !== null) {
                    terms[key][itemIndex] = value;
                }
            });
            const systemArrays = {
                armorTypes: ["", "Zirah Umum", "Zirah Sihir", "Zirah Ringan", "Zirah Berat", "Perisai Kecil", "Perisai Besar"],
                elements: ["", "Fisik", "Api", "Es", "Petir", "Air", "Tanah", "Angin", "Cahaya", "Kegelapan"],
                equipTypes: ["", "Senjata", "Perisai", "Kepala", "Tubuh", "Aksesori"],
                skillTypes: ["", "Sihir", "Khusus"],
                weaponTypes: ["", "Belati", "Pedang", "Gada Rantai", "Kapak", "Cambuk", "Tongkat", "Busur", "Busur Silang", "Senapan", "Cakar", "Sarung Tangan", "Tombak"]
            };
            for (const [key, values] of Object.entries(systemArrays)) {
                values.forEach((value, index) => {
                    if (value) {
                        system[key][index] = value;
                    }
                });
            }
        });
        Object.assign(terms.messages, {
            alwaysDash: "Selalu Berlari",
            commandRemember: "Ingat Perintah",
            touchUI: "Kontrol Sentuh",
            bgmVolume: "Volume Musik",
            bgsVolume: "Volume Suasana",
            meVolume: "Volume Efek Musik",
            seVolume: "Volume Efek Suara",
            possession: "Dimiliki",
            expTotal: "Total %1",
            expNext: "Menuju %1 Berikutnya",
            saveMessage: "Pilih berkas untuk menyimpan.",
            loadMessage: "Pilih berkas untuk memuat permainan.",
            file: "Berkas",
            autosave: "Simpan Otomatis",
            partyName: "Kelompok %1",
            emerge: "%1 muncul!",
            preemptive: "%1 menyerang lebih dahulu!",
            surprise: "%1 disergap!",
            escapeStart: "%1 mulai melarikan diri!",
            escapeFailure: "Namun, upaya melarikan diri gagal!",
            victory: "%1 memenangkan pertarungan!",
            defeat: "%1 dikalahkan.",
            obtainExp: "%1 memperoleh %2 EXP!",
            obtainGold: "Mendapatkan %1\\G!",
            obtainItem: "Mendapatkan %1!",
            levelUp: "%1 naik ke %2 %3!",
            obtainSkill: "%1 mempelajari %2!",
            useItem: "%1 menggunakan %2!",
            criticalToEnemy: "Serangan telak!",
            criticalToActor: "Serangan yang menyakitkan!",
            actorDamage: "%1 menerima %2 kerusakan!",
            actorRecovery: "%1 memulihkan %2 %3!",
            actorGain: "%1 memperoleh %2 %3!",
            actorLoss: "%1 kehilangan %2 %3!",
            actorDrain: "%1 kehilangan %2 %3!",
            actorNoDamage: "%1 tidak menerima kerusakan!",
            actorNoHit: "Meleset! %1 tidak menerima kerusakan.",
            enemyDamage: "%1 menerima %2 kerusakan!",
            enemyRecovery: "%1 memulihkan %2 %3!",
            enemyGain: "%1 memperoleh %2 %3!",
            enemyLoss: "%1 kehilangan %2 %3!",
            enemyDrain: "%1 kehilangan %2 %3!",
            enemyNoDamage: "%1 tidak menerima kerusakan!",
            enemyNoHit: "Meleset! %1 tidak menerima kerusakan.",
            evasion: "%1 menghindari serangan!",
            magicEvasion: "%1 meniadakan sihir!",
            magicReflection: "%1 memantulkan sihir!",
            counterAttack: "%1 melakukan serangan balik!",
            substitute: "%1 melindungi %2!",
            buffAdd: "%1 mengalami peningkatan %2!",
            debuffAdd: "%1 mengalami penurunan %2!",
            buffRemove: "%1: %2 kembali normal!",
            actionFailure: "Tidak berpengaruh pada %1!"
        });
        system.gameTitle = "Petualangan Lumina";
    };

    const _DataManager_onLoad = DataManager.onLoad;
    DataManager.onLoad = function(object) {
        _DataManager_onLoad.call(this, object);
        if (object === $dataSystem) {
            localizeTerms(object);
        } else if (object === $dataItems) {
            translateRecords($dataItems, itemData);
        } else if (object === $dataWeapons) {
            const translations = {};
            for (const [id, name] of Object.entries(weaponNames)) {
                const group = weaponGroups[id];
                translations[id] = [
                    name,
                    group
                        ? `Senjata jenis ${group} untuk menyerang lawan.`
                        : "Senjata khusus dengan kekuatan unik."
                ];
            }
            translateRecords($dataWeapons, translations);
        } else if (object === $dataArmors) {
            const translations = {};
            for (const [id, name] of Object.entries(armorNames)) {
                const description =
                    armorDescriptions[id] ||
                    (Number(id) >= 73 && Number(id) <= 100
                        ? "Aksesori yang meningkatkan status sesuai jenisnya."
                        : Number(id) >= 27 && Number(id) <= 37
                          ? "Perisai untuk membantu menahan serangan."
                          : "Perlengkapan pelindung untuk petualangan.");
                translations[id] = [name, description];
            }
            translateRecords($dataArmors, translations);
        } else if (object === $dataStates) {
            for (const [id, name] of Object.entries(stateNames)) {
                if ($dataStates[Number(id)]) {
                    $dataStates[Number(id)].name = name;
                }
            }
        } else if (object === $dataClasses) {
            for (const [id, name] of Object.entries(classNames)) {
                if ($dataClasses[Number(id)]) {
                    $dataClasses[Number(id)].name = name;
                }
            }
        } else if (object === $dataSkills) {
            const categoryIds = new Set([3, 11, 51, 171, 185, 195, 205, 215, 225]);
            for (const skill of $dataSkills) {
                if (!skill) {
                    continue;
                }
                if (skillNames[skill.id]) {
                    skill.name = skillNames[skill.id];
                } else if (skill.name.startsWith("-----")) {
                    skill.name = skill.name.replace(/[-\s]/g, "");
                }
                if (categoryIds.has(skill.id)) {
                    skill.description = "";
                } else if (skill.description) {
                    skill.description = translateSkillDescription(skill.description);
                }
            }
        } else if (object === $dataMap) {
            const mapNames = {
                "?????": "Pilih Karakter",
                "gender select": "Pilih Karakter",
                "Level 1": "Fase 1",
                "level 1": "Fase 1",
                "level 6": "Fase 6",
                "level 5": "Fase 5",
                "level 3": "Fase 3",
                "level 7": "Fase 7",
                "level 9": "Fase 9",
                "level 8": "Fase 8",
                "lvl 1 phase 1": "Fase 1",
                "lvl 1 phase 2": "Fase 2",
                "lvl 1 phase 3": "Fase 3",
                "lvl 1 phase 4": "Fase 4",
                "lvl 1 phase 5": "Fase 5",
                "lvl 1 phase 6": "Fase 6",
                "lvl 1 phase 7": "Fase 7",
                "lvl 1 phase 8": "Fase 8",
                "lvl 1 phase 9": "Wilayah Lama",
                "lvl 10": "Wilayah Lama",
                "Weapon Shop": "Toko Senjata",
                "Armor Shop": "Toko Zirah",
                "Item Shop": "Toko Barang",
                "main": "Istana Lumina",
                "ending": "Akhir",
                "Lumina's palace": "Istana Lumina"
            };
            object.displayName = mapNames[object.displayName] || object.displayName;
            for (const event of object.events || []) {
                if (!event) {
                    continue;
                }
                for (const page of event.pages) {
                    for (const command of page.list) {
                        if (command.code === 357) {
                            const args = command.parameters[3];
                            if (args && typeof args === "object") {
                                for (const [key, value] of Object.entries(args)) {
                                    if (typeof value === "string") {
                                        args[key] = dialogue[value.trim()] || value;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    const _Game_Message_add = Game_Message.prototype.add;
    Game_Message.prototype.add = function(text) {
        const translated =
            typeof text === "string"
                ? dialogue[text] || dialogue[text.trim()] || text
                : text;
        return _Game_Message_add.call(this, translated);
    };

    const _Game_Message_setChoices = Game_Message.prototype.setChoices;
    Game_Message.prototype.setChoices = function(choices, defaultType, cancelType) {
        const localizedChoices = choices.map(choice => choiceTranslations[choice] || choice);
        return _Game_Message_setChoices.call(this, localizedChoices, defaultType, cancelType);
    };

    class Window_LuminaPurchaseConfirm extends Window_Command {
        windowHeight() {
            return this.fittingHeight(5);
        }

        makeCommandList() {
            this.addCommand("Ya, beli", "confirm");
            this.addCommand("Tidak, kembali", "cancel");
        }

        setPurchase(item, quantity, unitPrice) {
            this._purchaseItem = item;
            this._purchaseQuantity = quantity;
            this._purchaseUnitPrice = unitPrice;
            this.refresh();
        }

        itemRect(index) {
            const rect = super.itemRect(index);
            rect.y += this.lineHeight() * 2;
            return rect;
        }

        drawAllItems() {
            this.contents.clear();
            this.resetFontSettings();
            this.drawText("Konfirmasi pembelian?", 0, 0, this.innerWidth, "center");
            this.drawText(
                this._purchaseItem
                    ? `${this._purchaseItem.name} - ${this._purchaseQuantity} x ${this._purchaseUnitPrice} G`
                    : "",
                0,
                this.lineHeight(),
                this.innerWidth,
                "center"
            );
            for (let i = 0; i < this.maxItems(); i++) {
                this.drawItem(i);
            }
        }
    }

    const _Scene_Shop_create = Scene_Shop.prototype.create;
    Scene_Shop.prototype.create = function() {
        _Scene_Shop_create.call(this);
        const width = Math.min(560, Graphics.boxWidth - 32);
        const height = this.calcWindowHeight(5, true);
        const rect = new Rectangle(
            (Graphics.boxWidth - width) / 2,
            (Graphics.boxHeight - height) / 2,
            width,
            height
        );
        this._luminaPurchaseConfirmWindow = new Window_LuminaPurchaseConfirm(rect);
        this._luminaPurchaseConfirmWindow.setHandler(
            "confirm",
            this.onLuminaPurchaseConfirmed.bind(this)
        );
        this._luminaPurchaseConfirmWindow.setHandler(
            "cancel",
            this.onLuminaPurchaseCancelled.bind(this)
        );
        this._luminaPurchaseConfirmWindow.hide();
        this._luminaPurchaseConfirmWindow.deactivate();
        this.addWindow(this._luminaPurchaseConfirmWindow);
    };

    const _Scene_Shop_onNumberOk = Scene_Shop.prototype.onNumberOk;
    Scene_Shop.prototype.onNumberOk = function() {
        if (this._commandWindow.currentSymbol() !== "buy") {
            _Scene_Shop_onNumberOk.call(this);
            return;
        }
        const quantity = this._numberWindow.number();
        this._luminaPurchaseConfirmWindow.setPurchase(
            this._item,
            quantity,
            this._buyWindow.price(this._item)
        );
        this._numberWindow.deactivate();
        this._luminaPurchaseConfirmWindow.show();
        this._luminaPurchaseConfirmWindow.activate();
        this._luminaPurchaseConfirmWindow.select(0);
    };

    Scene_Shop.prototype.onLuminaPurchaseConfirmed = function() {
        this._luminaPurchaseConfirmWindow.hide();
        this._luminaPurchaseConfirmWindow.deactivate();
        _Scene_Shop_onNumberOk.call(this);
    };

    Scene_Shop.prototype.onLuminaPurchaseCancelled = function() {
        this._luminaPurchaseConfirmWindow.hide();
        this._luminaPurchaseConfirmWindow.deactivate();
        this._numberWindow.activate();
    };

    Window_ShopBuy.prototype.drawItem = function(index) {
        const item = this.itemAt(index);
        if (!item) {
            return;
        }
        const rect = this.itemLineRect(index);
        const priceWidth = this.priceWidth();
        const ownedWidth = 80;
        const price = this.price(item);
        const priceX = rect.x + rect.width - priceWidth;
        const ownedX = priceX - ownedWidth;
        const nameWidth = ownedX - rect.x;

        this.changePaintOpacity(this.isEnabled(item));
        this.drawItemName(item, rect.x, rect.y, nameWidth);
        this.drawText(`Ada ${$gameParty.numItems(item)}`, ownedX, rect.y, ownedWidth, "right");
        this.drawText(price, priceX, rect.y, priceWidth, "right");
        this.changePaintOpacity(true);
    };

    document.title = "Petualangan Lumina";
})();
