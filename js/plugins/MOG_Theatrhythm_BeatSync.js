//=============================================================================
// MOG_Theatrhythm_BeatSync.js
//=============================================================================
// TAMBAHAN untuk MOG_Theatrhythm.js -- membuat tombol muncul SESUAI KETUKAN
// (BPM) lagu yang dipilih, bukan random/interval tetap seperti bawaan.
//
// !! WAJIB: plugin ini ditaruh DI BAWAH MOG_Theatrhythm.js di Plugin Manager !!
//=============================================================================

/*:
 * @target MZ
 * @plugindesc (v1.0) Tambahan Beat-Sync untuk MOG_Theatrhythm - tombol muncul sesuai ketukan lagu.
 * @author Claude (add-on untuk plugin Moghunter)
 * @base MOG_Theatrhythm
 * @orderAfter MOG_Theatrhythm
 *
 * @param Songs
 * @text Daftar Lagu
 * @type struct<Song>[]
 * @desc Daftar lagu yang bisa dipilih lewat Plugin Command "Theatrhythm (Beat Sync)".
 * @default []
 *
 * @command TheatrhythmBeatSync
 * @text Theatrhythm (Beat Sync)
 * @desc Mulai minigame Theatrhythm dengan tombol yang sinkron ke ketukan lagu.
 *
 * @arg songKey
 * @text Kunci Lagu
 * @desc Harus sama persis dengan "Kunci Lagu" di parameter Daftar Lagu.
 * @default song1
 *
 * @arg enemyID
 * @text Enemy ID
 * @default 1
 * @type number
 * @min 1
 *
 * @arg travelTime
 * @text Waktu Tempuh Tombol (detik)
 * @desc Lama tombol melayang dari muncul sampai ke titik ketuk. Makin kecil = makin cepat/sulit. Coba 0.8 - 1.4.
 * @default 1.0
 * @type number
 * @decimals 2
 * @min 0.3
 * @max 3
 *
 * @arg animationID
 * @text Enemy Atk Animation ID
 * @default 1
 * @type number
 * @min 1
 *
 * @arg switch_id
 * @text Switch ID (ON saat menang)
 * @default 0
 * @type number
 * @min 0
 * @max 5000
 *
 * @arg variable_id
 * @text Variable ID (simpan skor)
 * @default 0
 * @type number
 * @min 0
 * @max 5000
 *
 * @help
 * =============================================================================
 * ♦♦♦ MOG Theatrhythm - Beat Sync Add-on (v1.0) ♦♦♦
 * =============================================================================
 * Plugin bawaan (MOG_Theatrhythm.js) memunculkan tombol berdasarkan parameter
 * "Speed" saja -- TIDAK mengikuti ketukan lagu apapun yang diputar. Plugin
 * tambahan ini menggantikan cara munculnya tombol: berdasarkan BPM (ketukan
 * per menit) lagu yang kamu masukkan di parameter "Daftar Lagu", supaya
 * tombol benar-benar pas dengan ketukan musik.
 *
 * -----------------------------------------------------------------------------
 * CARA PAKAI
 * -----------------------------------------------------------------------------
 * 1. Taruh file musik (.ogg/.m4a) di folder audio/bgm/ seperti biasa.
 * 2. Di parameter "Daftar Lagu", tambah 1 entri per lagu:
 *      - Kunci Lagu   : nama unik, bebas (contoh: "boss1")
 *      - File BGM     : pilih file musiknya
 *      - Volume       : 0-100
 *      - BPM          : ketukan per menit lagu itu (lihat cara cari BPM di bawah)
 *      - Offset Awal  : kalau lagunya punya intro sebelum beat pertama
 *                       mulai, isi disini (dalam milidetik). Kalau beat
 *                       pertama pas detik ke-0, isi 0.
 *      - Pola Ketukan : biarkan "1" untuk tombol muncul TIAP ketukan.
 *                       Isi "1,1,0.5,0.5" untuk pola lebih variatif
 *                       (diulang terus): ketuk, ketuk, ketuk-cepat, ketuk-cepat.
 * 3. Di event, pakai Plugin Command "Theatrhythm (Beat Sync)" (BUKAN yang
 *    "Theatrhythm" bawaan), isi Kunci Lagu sesuai yang kamu buat di langkah 2.
 * 4. Playtest. Kalau tombol terasa sedikit telat/cepat dibanding musik,
 *    itu NORMAL di semua game ritme -- sesuaikan "Offset Awal" (geser
 *    beberapa puluh ms) sampai pas di device yang dipakai untuk pameran.
 *
 * -----------------------------------------------------------------------------
 * CARA CARI BPM LAGU
 * -----------------------------------------------------------------------------
 * - Kalau lagunya buatan sendiri/dari software musik (FL Studio, LMMS, dll),
 *   BPM sudah pasti tertulis di project-nya.
 * - Kalau lagu royalty-free dari situs seperti Incompetech atau OpenGameArt,
 *   biasanya BPM dicantumkan di halaman lagunya.
 * - Kalau tidak tahu, cari "[nama lagu] bpm" di internet, atau pakai tool
 *   "BPM counter" online sambil dengar lagunya dan ketuk manual di tombol
 *   tap-nya beberapa kali sampai stabil.
 *
 * -----------------------------------------------------------------------------
 * CATATAN PENTING
 * -----------------------------------------------------------------------------
 * - Plugin Command "Theatrhythm" bawaan (tanpa Beat Sync) TETAP bisa dipakai
 *   seperti biasa dan tidak terpengaruh add-on ini.
 * - Opsi "Random Speed" dari plugin bawaan otomatis TIDAK berlaku waktu pakai
 *   mode Beat Sync, karena kecepatan acak akan merusak sinkron ke ketukan.
 * - Karena musik diputar lewat AudioManager standar RPG Maker, kalau device
 *   pameran agak lag/berat, ada kemungkinan timing beat sedikit meleset --
 *   ini keterbatasan umum semua game ritme berbasis audio, bukan bug.
 * =============================================================================
 */

/*~struct~Song:
 * @param key
 * @text Kunci Lagu
 * @desc Nama unik untuk dipanggil lewat Plugin Command. Harus sama persis (huruf besar/kecil dihitung beda).
 * @default song1
 *
 * @param bgmName
 * @text File BGM
 * @type file
 * @dir audio/bgm
 * @default
 *
 * @param bgmVolume
 * @text Volume
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param bpm
 * @text BPM (Ketukan per Menit)
 * @type number
 * @min 20
 * @max 300
 * @default 120
 *
 * @param offsetMs
 * @text Offset Awal (ms)
 * @desc Jeda dari mulai lagu sampai ketukan pertama (kalau ada intro sebelum beat mulai).
 * @type number
 * @default 0
 *
 * @param pattern
 * @text Pola Ketukan
 * @desc Kelipatan antar tombol, pisah pakai koma. 1 = tiap ketuk, 0.5 = tiap setengah ketuk, 2 = tiap 2 ketuk. Pola ini diulang terus sampai minigame selesai.
 * @default 1
 */

(function() {
    "use strict";

    const PLUGIN_NAME = "MOG_Theatrhythm_BeatSync";
    const rawParams = PluginManager.parameters(PLUGIN_NAME);

    //-------------------------------------------------------------------
    // Parsing daftar lagu dari parameter
    //-------------------------------------------------------------------
    function parseSongs(raw) {
        const list = [];
        try {
            const arr = JSON.parse(raw || "[]");
            for (const s of arr) {
                const obj = JSON.parse(s);
                const patternArr = String(obj.pattern || "1")
                    .split(",")
                    .map(v => Number(v.trim()))
                    .filter(v => !isNaN(v) && v > 0);
                list.push({
                    key: String(obj.key || ""),
                    bgmName: String(obj.bgmName || ""),
                    bgmVolume: Number(obj.bgmVolume || 90),
                    bpm: Math.max(Number(obj.bpm || 120), 1),
                    offsetMs: Number(obj.offsetMs || 0),
                    pattern: patternArr.length ? patternArr : [1]
                });
            }
        } catch (e) {
            console.warn(PLUGIN_NAME + ": gagal parsing parameter Daftar Lagu.", e);
        }
        return list;
    }

    const BTS_SONGS = parseSongs(rawParams["Songs"]);

    function getSongByKey(key) {
        return BTS_SONGS.find(s => s.key === key);
    }

    //-------------------------------------------------------------------
    // Buat jadwal waktu ketukan (dalam detik) dari BPM + offset + pola
    //-------------------------------------------------------------------
    function buildBeatSchedule(bpm, offsetMs, pattern, totalNotes) {
        const beatDur = 60 / bpm;
        const times = [];
        let t = offsetMs / 1000;
        let idx = 0;
        for (let i = 0; i < totalNotes; i++) {
            times.push(t);
            const mult = pattern[idx % pattern.length];
            t += beatDur * mult;
            idx++;
        }
        return times;
    }

    //-------------------------------------------------------------------
    // Posisi (detik) lagu yang sedang diputar
    //-------------------------------------------------------------------
    function currentBgmTime() {
        if (AudioManager._bgmBuffer && AudioManager._bgmBuffer.seek) {
            return AudioManager._bgmBuffer.seek();
        }
        return 0;
    }

    //-------------------------------------------------------------------
    // Plugin Command
    //-------------------------------------------------------------------
    PluginManager.registerCommand(PLUGIN_NAME, "TheatrhythmBeatSync", function(data) {
        const song = getSongByKey(String(data.songKey));
        if (!song) {
            console.warn(PLUGIN_NAME + ': Kunci Lagu "' + data.songKey + '" tidak ditemukan di parameter Daftar Lagu.');
            return;
        }
        if (!song.bgmName) {
            console.warn(PLUGIN_NAME + ': Lagu "' + song.key + '" belum diisi File BGM-nya.');
            return;
        }

        const enemyId = Math.min(Math.max(Number(data.enemyID), 1), $dataEnemies.length - 1);
        const animationId = Math.min(Math.max(Number(data.animationID), 1), $dataAnimations.length - 1);
        const switchId = Number(data.switch_id);
        const variableId = Number(data.variable_id);
        const travelTime = Math.min(Math.max(Number(data.travelTime || 1.0), 0.2), 5);

        $gameSystem._theatrhythm_beatsync = {
            active: true,
            songKey: song.key,
            bgmName: song.bgmName,
            bgmVolume: song.bgmVolume,
            bpm: song.bpm,
            offsetMs: song.offsetMs,
            pattern: song.pattern,
            travelTime: travelTime,
            schedule: [],
            scheduleIndex: 0,
            songStarted: false
        };

        // speed & randomMode diteruskan sebagai placeholder (tidak dipakai
        // di mode sync, karena kecepatan dihitung ulang otomatis).
        $gameSystem.executeTheatrhythm(enemyId, 1, animationId, switchId, variableId, false);
    });

    //-------------------------------------------------------------------
    // Mulai lagu & jadwal beat pada saat pemain menekan tombol "mulai"
    // (menggantikan BattleManager.playBattleBgm() bawaan, HANYA saat
    // mode Beat Sync aktif).
    //-------------------------------------------------------------------
    const _bts_update_start_phase = Scene_Theatrhythm.prototype.update_start_phase;
    Scene_Theatrhythm.prototype.update_start_phase = function() {
        const bs = $gameSystem._theatrhythm_beatsync;
        if (bs && bs.active && this._phase[0] === 2) {
            if (Input.isTriggered("ok") || Input.isTriggered("cancel") || TouchInput.isTriggered()) {
                SoundManager.playCursor();
                this._phase[0] = 3;
                this.startBeatSyncSong();
                return;
            }
            return;
        }
        _bts_update_start_phase.call(this);
    };

    Scene_Theatrhythm.prototype.startBeatSyncSong = function() {
        const bs = $gameSystem._theatrhythm_beatsync;
        AudioManager.playBgm({ name: bs.bgmName, volume: bs.bgmVolume, pitch: 100, pan: 0 });
        bs.schedule = buildBeatSchedule(bs.bpm, bs.offsetMs, bs.pattern, 2000);
        bs.scheduleIndex = 0;
        bs.songStarted = true;
    };

    //-------------------------------------------------------------------
    // Bersihkan flag saat keluar dari scene minigame
    //-------------------------------------------------------------------
    const _bts_scene_terminate = Scene_Theatrhythm.prototype.terminate;
    Scene_Theatrhythm.prototype.terminate = function() {
        if ($gameSystem._theatrhythm_beatsync) {
            $gameSystem._theatrhythm_beatsync.active = false;
        }
        _bts_scene_terminate.call(this);
    };

    //-------------------------------------------------------------------
    // Sprite_TKeys - override cara munculnya tombol saat mode sync aktif
    //-------------------------------------------------------------------
    const _bts_tkeys_initialize = Sprite_TKeys.prototype.initialize;
    Sprite_TKeys.prototype.initialize = function(img, pos) {
        _bts_tkeys_initialize.call(this, img, pos);
        const bs = $gameSystem._theatrhythm_beatsync;
        if (bs && bs.active) {
            this._bts_active = true;
            const targetX = (this._limit[2] + this._limit[3]) / 2;
            const startX = -this._cw;
            const travelDist = targetX - startX;
            const travelFrames = Math.max(1, bs.travelTime * 60);
            this._keysSpeed = travelDist / travelFrames;
            this._slotBusy = [false, false, false, false, false, false];
            for (let i = 0; i < this._keys.length; i++) {
                this._keys_i[i] = 0;
                this._keys_speed[i] = 0;
                this._keys[i].x = this._limit[4];
                this._keys[i].opacity = 0;
            }
        } else {
            this._bts_active = false;
        }
    };

    const _bts_tkeys_update_keys = Sprite_TKeys.prototype.update_keys;
    Sprite_TKeys.prototype.update_keys = function(i) {
        if (!this._bts_active) {
            _bts_tkeys_update_keys.call(this, i);
            return;
        }
        if (!this._slotBusy[i]) return; // tombol ini masih "parkir", nunggu jadwal
        if ($gameSystem._theatrhythm_phase !== 1) {
            this._keys[i].opacity -= 10;
            return;
        }
        if (this._keys_f[i]) {
            this.update_fade(i);
        } else {
            this.update_position(i);
        }
        if (this._keys[i].opacity <= 0) {
            this._slotBusy[i] = false;
            this._keys[i].x = this._limit[4];
            this._keys[i].opacity = 0;
            this._keys_f[i] = false;
        }
    };

    const _bts_tkeys_update = Sprite_TKeys.prototype.update;
    Sprite_TKeys.prototype.update = function() {
        _bts_tkeys_update.call(this);
        if (this._bts_active) this.update_beat_scheduler();
    };

    Sprite_TKeys.prototype.update_beat_scheduler = function() {
        const bs = $gameSystem._theatrhythm_beatsync;
        if (!bs || !bs.songStarted || $gameSystem._theatrhythm_phase !== 1) return;
        const now = currentBgmTime();
        while (bs.scheduleIndex < bs.schedule.length) {
            const spawnAt = bs.schedule[bs.scheduleIndex] - bs.travelTime;
            if (now < spawnAt) break;
            const slot = this._slotBusy.indexOf(false);
            if (slot === -1) break; // semua lajur penuh, coba lagi frame berikutnya
            this.spawn_key_synced(slot);
            bs.scheduleIndex++;
        }
    };

    Sprite_TKeys.prototype.spawn_key_synced = function(i) {
        this._keys_f[i] = false;
        this._keys_c[i] = Math.randomInt(4);
        this._keys_h[i] = Math.randomInt(this._batlers.length);
        this._keys_r[i] = true;
        this._keys_s[i] = false;
        const h = this._positions[this._keys_h[i]][1];
        this._keys[i].setFrame(this._cw * this._keys_c[i], 0, this._cw, this._ch);
        this._keys[i].x = -this._cw;
        this._keys[i].y = h;
        this._keys[i].scale.x = 1.0;
        this._keys[i].scale.y = 1.0;
        this._keys[i].opacity = 0;
        this._slotBusy[i] = true;
    };

})();
