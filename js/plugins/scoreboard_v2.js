//=============================================================================
// TRW_Leaderboard.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Leaderboard / papan skor kustom yang tampil di sisi layar. (v1.4 - skor permanen, tidak hilang saat New Game)
 * @author Claude
 *
 * @help TRW_Leaderboard.js
 * ==========================================================================
 * LEADERBOARD HUD PLUGIN
 * ==========================================================================
 * Plugin ini menampilkan papan skor (leaderboard) di sisi layar saat berada
 * di peta (map). Mulai v1.4, data skor disimpan secara PERMANEN di
 * localStorage (bukan di dalam save file), jadi leaderboard TIDAK akan
 * hilang/reset walau pemain kalah, kembali ke Title, lalu mulai New Game
 * untuk pemain berikutnya -- cocok untuk sesi pameran di mana banyak orang
 * bergantian coba dari awal. Skor akan tetap tersimpan sampai kamu sendiri
 * yang menghapusnya lewat Plugin Command "Hapus Semua Skor".
 *
 * CARA PAKAI
 * --------------------------------------------------------------------------
 * 1. Taruh file ini di folder project kamu: js/plugins/TRW_Leaderboard.js
 * 2. Buka Plugin Manager, tambahkan plugin ini, lalu aktifkan (ON).
 * 3. Atur parameter di bawah sesuai selera (posisi, lebar, jumlah baris, dll).
 * 4. Untuk menambah skor baru, panggil Plugin Command "Tambah Skor" dari
 *    event kamu. Contoh dipakai persis setelah minigame Theatrhythm selesai
 *    dan pemain MENANG:
 *
 *      Plugin Command: TRW_Leaderboard -> Tambah Skor
 *        Nama  : Player          (atau pakai \p[1] untuk nama anggota
 *                                 party urutan ke-1 -- ini yang PALING
 *                                 AMAN dipakai kalau karakter awal bisa
 *                                 beda-beda ID tergantung pilihan
 *                                 gender/kelas, karena \p[x] ikut posisi
 *                                 di party, bukan ID Actor yang tetap.
 *                                 \n[x] cuma dipakai kalau kamu yakin
 *                                 ID Actor-nya selalu sama.)
 *        Skor  : \v[1]           (otomatis ambil dari variable 1, sesuai
 *                                 "Variable ID (Store)" di setup
 *                                 MOG_Theatrhythm kamu)
 *
 * 5. Leaderboard otomatis tampil begitu masuk map (kalau parameter
 *    "Tampil Sejak Awal" = true). Untuk kontrol manual, pakai:
 *      - Plugin Command "Tampilkan Leaderboard"
 *      - Plugin Command "Sembunyikan Leaderboard"
 *      - Plugin Command "Toggle Tampil/Sembunyi"
 * 6. Untuk reset seluruh data (misal sebelum sesi pameran baru dimulai),
 *    pakai Plugin Command "Hapus Semua Skor".
 *
 * CATATAN
 * --------------------------------------------------------------------------
 * - Kode \v[x] di field Nama/Skor akan otomatis diganti isi variable x.
 * - Kode \n[x] di field Nama akan otomatis diganti nama actor x.
 * - Daftar otomatis diurutkan dari skor tertinggi ke terendah, dan
 *   dipangkas sesuai "Jumlah Baris Ditampilkan".
 * - Plugin ini hanya menampilkan window di scene Map (peta), bukan di
 *   menu atau battle.
 *
 * Bebas dipakai & diedit untuk proyek pameran kamu.
 * ==========================================================================
 *
 * @param maxEntries
 * @text Jumlah Baris Ditampilkan
 * @type number
 * @min 1
 * @max 20
 * @default 10
 *
 * @param title
 * @text Judul Leaderboard
 * @type string
 * @default TOP SCORE
 *
 * @param windowWidth
 * @text Lebar Window
 * @type number
 * @default 240
 *
 * @param marginRight
 * @text Jarak dari Tepi Kanan Layar
 * @type number
 * @default 16
 *
 * @param marginTop
 * @text Jarak dari Tepi Atas Layar
 * @type number
 * @default 16
 *
 * @param fontSize
 * @text Ukuran Font
 * @type number
 * @default 22
 *
 * @param windowOpacity
 * @text Opacity Background Window (0-255)
 * @type number
 * @min 0
 * @max 255
 * @default 220
 *
 * @param startVisible
 * @text Tampil Sejak Awal?
 * @type boolean
 * @default true
 *
 * @param highlightColor
 * @text Warna Ranking #1 (Emas)
 * @type string
 * @default #ffd700
 *
 * @param rank2Color
 * @text Warna Ranking #2 (Perak)
 * @type string
 * @default #d7d7e0
 *
 * @param rank3Color
 * @text Warna Ranking #3 (Perunggu)
 * @type string
 * @default #cd8032
 *
 * @param titleFontSize
 * @text Ukuran Font Judul
 * @type number
 * @default 26
 *
 * @param scoreSuffix
 * @text Teks Setelah Angka Skor
 * @type string
 * @default  pts
 *
 * @param zebraStripe
 * @text Baris Selang-seling (Zebra)?
 * @type boolean
 * @default true
 *
 * @param zebraColor
 * @text Warna Baris Zebra
 * @type string
 * @default rgba(255,255,255,0.06)
 *
 * @param useCustomTone
 * @text Pakai Warna Window Sendiri?
 * @type boolean
 * @default false
 * @desc Kalau true, window leaderboard TIDAK ikut "Window Color" global
 * di Database, dan pakai Tone R/G/B di bawah ini sendiri.
 *
 * @param toneR
 * @text Tone Merah (-255 s/d 255)
 * @type number
 * @min -255
 * @max 255
 * @default 0
 *
 * @param toneG
 * @text Tone Hijau (-255 s/d 255)
 * @type number
 * @min -255
 * @max 255
 * @default 0
 *
 * @param toneB
 * @text Tone Biru (-255 s/d 255)
 * @type number
 * @min -255
 * @max 255
 * @default -60
 * @desc Nilai negatif mengurangi warna biru pada skin window. Naikkan
 * ke arah -100/-150 kalau masih terlihat biru.
 *
 * @param customWindowSkin
 * @text Windowskin Khusus (opsional)
 * @type file
 * @dir img/system
 * @default
 * @desc Kosongkan untuk pakai skin default project. Isi kalau kamu
 * punya file skin sendiri (misal versi putih) di img/system.
 *
 * @command addScore
 * @text Tambah Skor
 * @desc Menambahkan skor baru ke leaderboard (otomatis diurutkan & dipangkas).
 *
 * @arg name
 * @text Nama
 * @type string
 * @default Player
 * @desc Bisa pakai \v[x] (variable) atau \n[x] (nama actor x).
 *
 * @arg score
 * @text Skor
 * @type string
 * @default 0
 * @desc Angka biasa, atau \v[x] untuk ambil nilai dari variable x.
 *
 * @arg accumulate
 * @text Akumulasi ke Nama yang Sama?
 * @type boolean
 * @default false
 * @desc Kalau true: skor ditambahkan ke baris lama dengan nama sama
 * (dijumlahkan), bukan bikin baris baru tiap menang.
 *
 * @command clearScores
 * @text Hapus Semua Skor
 * @desc Mengosongkan seluruh data leaderboard.
 *
 * @command showBoard
 * @text Tampilkan Leaderboard
 *
 * @command hideBoard
 * @text Sembunyikan Leaderboard
 *
 * @command toggleBoard
 * @text Toggle Tampil/Sembunyi Leaderboard
 */

(() => {
    "use strict";

    const pluginName = "TRW_Leaderboard";
    const params = PluginManager.parameters(pluginName);

    const MAX_ENTRIES   = Number(params.maxEntries || 10);
    const TITLE          = String(params.title || "TOP SCORE");
    const WIN_WIDTH       = Number(params.windowWidth || 240);
    const MARGIN_R        = Number(params.marginRight || 16);
    const MARGIN_T         = Number(params.marginTop || 16);
    const FONT_SIZE         = Number(params.fontSize || 22);
    const WIN_OPACITY        = Number(params.windowOpacity || 220);
    const START_VISIBLE       = params.startVisible !== "false";
    const HILITE_COLOR         = String(params.highlightColor || "#ffd700");
    const RANK2_COLOR           = String(params.rank2Color || "#d7d7e0");
    const RANK3_COLOR            = String(params.rank3Color || "#cd8032");
    const TITLE_FONT_SIZE          = Number(params.titleFontSize || 26);
    const SCORE_SUFFIX               = String(params.scoreSuffix || " pts");
    const ZEBRA_STRIPE                 = params.zebraStripe !== "false";
    const ZEBRA_COLOR                    = String(params.zebraColor || "rgba(255,255,255,0.06)");
    const USE_CUSTOM_TONE                  = params.useCustomTone === "true";
    const TONE_R                             = Number(params.toneR || 0);
    const TONE_G                              = Number(params.toneG || 0);
    const TONE_B                               = Number(params.toneB || -60);
    const CUSTOM_SKIN                            = String(params.customWindowSkin || "");

    //-------------------------------------------------------------------
    // Helper: ganti \v[x] dan \n[x] dalam sebuah teks
    //-------------------------------------------------------------------
    function resolveText(text) {
        let result = String(text);
        result = result.replace(/\\[Vv]\[(\d+)\]/g, (_, id) => {
            return String($gameVariables.value(Number(id)));
        });
        result = result.replace(/\\[Nn]\[(\d+)\]/g, (_, id) => {
            const actor = $gameActors.actor(Number(id));
            return actor ? actor.name() : "";
        });
        result = result.replace(/\\[Pp]\[(\d+)\]/g, (_, pos) => {
            const member = $gameParty.members()[Number(pos) - 1];
            return member ? member.name() : "";
        });
        return result;
    }

    function resolveScore(text) {
        const resolved = resolveText(text);
        const num = Number(resolved);
        return isNaN(num) ? 0 : Math.round(num);
    }

    //-------------------------------------------------------------------
    // Penyimpanan skor PERMANEN lewat localStorage.
    // SENGAJA tidak disimpan di $gameSystem/save data, supaya leaderboard
    // TIDAK ikut ter-reset saat pemain kalah -> kembali ke Title -> New
    // Game untuk pemain berikutnya. Data ini nempel di komputer/browser
    // yang dipakai, jadi tetap ada lintas sesi permainan sampai dihapus
    // manual lewat Plugin Command "Hapus Semua Skor".
    //-------------------------------------------------------------------
    const STORAGE_KEY = "TRW_Leaderboard_Data";

    let _leaderboardData = [];

    function loadLeaderboardData() {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            _leaderboardData = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            _leaderboardData = [];
        }
    }

    function saveLeaderboardData() {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(_leaderboardData));
        } catch (e) {
            // Kalau localStorage tidak tersedia, skor cuma bertahan
            // selama game belum ditutup (fallback diam-diam).
        }
    }

    loadLeaderboardData();

    //-------------------------------------------------------------------
    // Game_System - visibilitas leaderboard (boleh ikut save, tidak masalah)
    //-------------------------------------------------------------------
    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._leaderboardVisible = START_VISIBLE;
    };

    Game_System.prototype.leaderboardList = function() {
        return _leaderboardData;
    };

    Game_System.prototype.isLeaderboardVisible = function() {
        if (this._leaderboardVisible === undefined) {
            this._leaderboardVisible = START_VISIBLE;
        }
        return this._leaderboardVisible;
    };

    Game_System.prototype.setLeaderboardVisible = function(value) {
        this._leaderboardVisible = value;
    };

    Game_System.prototype.addLeaderboardScore = function(name, score, accumulate) {
        const existing = accumulate ? _leaderboardData.find(e => e.name === name) : null;
        if (existing) {
            existing.score += score;
        } else {
            _leaderboardData.push({ name: name, score: score });
        }
        _leaderboardData.sort((a, b) => b.score - a.score);
        _leaderboardData.length = Math.min(_leaderboardData.length, MAX_ENTRIES);
        saveLeaderboardData();
    };

    Game_System.prototype.clearLeaderboard = function() {
        _leaderboardData = [];
        saveLeaderboardData();
    };

    //-------------------------------------------------------------------
    // Plugin Commands
    //-------------------------------------------------------------------
    PluginManager.registerCommand(pluginName, "addScore", args => {
        const name = resolveText(args.name);
        const score = resolveScore(args.score);
        const accumulate = args.accumulate === "true";
        $gameSystem.addLeaderboardScore(name, score, accumulate);
    });

    PluginManager.registerCommand(pluginName, "clearScores", () => {
        $gameSystem.clearLeaderboard();
    });

    PluginManager.registerCommand(pluginName, "showBoard", () => {
        $gameSystem.setLeaderboardVisible(true);
    });

    PluginManager.registerCommand(pluginName, "hideBoard", () => {
        $gameSystem.setLeaderboardVisible(false);
    });

    PluginManager.registerCommand(pluginName, "toggleBoard", () => {
        $gameSystem.setLeaderboardVisible(!$gameSystem.isLeaderboardVisible());
    });

    //-------------------------------------------------------------------
    // Window_Leaderboard
    //-------------------------------------------------------------------
    function Window_Leaderboard() {
        this.initialize(...arguments);
    }

    Window_Leaderboard.prototype = Object.create(Window_Base.prototype);
    Window_Leaderboard.prototype.constructor = Window_Leaderboard;

    Window_Leaderboard.prototype.initialize = function() {
        const lineH = FONT_SIZE + 10;
        const width = WIN_WIDTH;
        const titleAreaH = TITLE_FONT_SIZE + 18;
        const height = titleAreaH + MAX_ENTRIES * lineH + 24;
        const x = Graphics.boxWidth - width - MARGIN_R;
        const y = MARGIN_T;
        const rect = new Rectangle(x, y, width, height);
        Window_Base.prototype.initialize.call(this, rect);
        if (CUSTOM_SKIN) {
            this.windowskin = ImageManager.loadSystem(CUSTOM_SKIN);
        }
        this._lineH = lineH;
        this.opacity = WIN_OPACITY;
        this._lastDataKey = "";
        this.refresh();
    };

    Window_Leaderboard.prototype.updateTone = function() {
        if (USE_CUSTOM_TONE) {
            this.setTone(TONE_R, TONE_G, TONE_B);
        } else {
            Window_Base.prototype.updateTone.call(this);
        }
    };

    Window_Leaderboard.prototype.lineHeight = function() {
        return this._lineH || (FONT_SIZE + 10);
    };

    Window_Leaderboard.prototype.dataKey = function() {
        return JSON.stringify($gameSystem.leaderboardList()) +
            String($gameSystem.isLeaderboardVisible());
    };

    Window_Leaderboard.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        const key = this.dataKey();
        if (key !== this._lastDataKey) {
            this._lastDataKey = key;
            this.refresh();
        }
        this.visible = $gameSystem.isLeaderboardVisible();
    };

    Window_Leaderboard.prototype.rankColor = function(i) {
        if (i === 0) return HILITE_COLOR;
        if (i === 1) return RANK2_COLOR;
        if (i === 2) return RANK3_COLOR;
        return ColorManager.normalColor();
    };

    Window_Leaderboard.prototype.refresh = function() {
        this.contents.clear();

        // Judul, dibuat lebih besar & bold
        this.contents.fontSize = TITLE_FONT_SIZE;
        this.contents.fontBold = true;
        this.changeTextColor(ColorManager.normalColor());
        this.drawText(TITLE, 0, 0, this.contentsWidth(), "center");
        this.contents.fontBold = false;
        this.contents.fontSize = FONT_SIZE;

        // Garis pemisah di bawah judul
        const lineY = TITLE_FONT_SIZE + 8;
        this.contents.fillRect(0, lineY, this.contentsWidth(), 2, "rgba(255,255,255,0.25)");

        const startY = lineY + 10;
        const rowH = this.lineHeight();
        const list = $gameSystem.leaderboardList();

        for (let i = 0; i < MAX_ENTRIES; i++) {
            const y = startY + i * rowH;

            // Baris zebra (selang-seling) supaya lebih mudah dibaca
            if (ZEBRA_STRIPE && i % 2 === 1) {
                this.contents.fillRect(0, y, this.contentsWidth(), rowH, ZEBRA_COLOR);
            }

            const entry = list[i];
            const rankColor = this.rankColor(i);

            this.changeTextColor(rankColor);
            this.drawText(`${i + 1}.`, 4, y, 36, "left");

            if (entry) {
                this.changeTextColor(rankColor);
                this.drawText(entry.name, 44, y, this.contentsWidth() - 44 - 80, "left");
                this.changeTextColor(ColorManager.normalColor());
                this.drawText(entry.score + SCORE_SUFFIX, this.contentsWidth() - 80, y, 80, "right");
            } else {
                this.changeTextColor(ColorManager.textColor(8));
                this.drawText("---", 44, y, this.contentsWidth() - 44, "left");
            }
        }
        this.resetTextColor();
    };

    //-------------------------------------------------------------------
    // Scene_Map integration
    //-------------------------------------------------------------------
    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this.createLeaderboardWindow();
    };

    Scene_Map.prototype.createLeaderboardWindow = function() {
        this._leaderboardWindow = new Window_Leaderboard();
        this.addWindow(this._leaderboardWindow);
    };
})();
