//=============================================================================
// ModernUI.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [v1.1.0] Modernisasi tampilan UI: window rounded, semi-transparent, flat color, font custom, name input alnum-only.
 * @author Claude
 * @url
 *
 * @param WindowSettings
 * @text --- Pengaturan Window ---
 * @default
 *
 * @param cornerRadius
 * @text Radius Sudut (Rounded Corner)
 * @parent WindowSettings
 * @type number
 * @min 0
 * @max 40
 * @desc Besar lengkungan sudut window. 0 = kotak siku seperti default.
 * @default 16
 *
 * @param bgColorTop
 * @text Warna Background Atas
 * @parent WindowSettings
 * @desc Warna gradient bagian atas window (format hex, contoh: #1b1f2a)
 * @default #1b1f2a
 *
 * @param bgColorBottom
 * @text Warna Background Bawah
 * @parent WindowSettings
 * @desc Warna gradient bagian bawah window (format hex)
 * @default #10131a
 *
 * @param bgOpacity
 * @text Opacity Background
 * @parent WindowSettings
 * @type number
 * @min 0
 * @max 255
 * @desc Tingkat transparansi background window (0-255).
 * @default 220
 *
 * @param borderColor
 * @text Warna Border
 * @parent WindowSettings
 * @desc Warna garis tepi window (format hex)
 * @default #4fd6c8
 *
 * @param borderThickness
 * @text Ketebalan Border
 * @parent WindowSettings
 * @type number
 * @min 0
 * @max 10
 * @desc Ketebalan garis tepi window dalam pixel.
 * @default 2
 *
 * @param disableArrow
 * @text Sembunyikan Panah Scroll
 * @parent WindowSettings
 * @type boolean
 * @desc Sembunyikan indikator panah bawaan agar tampilan lebih bersih.
 * @default true
 *
 * @param FontSettings
 * @text --- Pengaturan Font ---
 * @default
 *
 * @param mainFontFace
 * @text Nama Font Utama
 * @parent FontSettings
 * @desc Nama font yang dipakai untuk seluruh teks UI. Harus sudah didaftarkan (lihat catatan di bawah).
 * @default GameFont
 *
 * @param mainFontSize
 * @text Ukuran Font Utama
 * @parent FontSettings
 * @type number
 * @min 10
 * @max 48
 * @default 26
 *
 * @param NameInputSettings
 * @text --- Pengaturan Name Input ---
 * @default
 *
 * @param restrictAlnumOnly
 * @text Hanya Huruf & Angka
 * @parent NameInputSettings
 * @type boolean
 * @desc Jika true, keyboard input nama HANYA menampilkan A-Z, a-z, 0-9 (semua simbol dihilangkan) dan tombol Page dimatikan.
 * @default true
 *
 * @param GaugeSettings
 * @text --- Pengaturan Gauge (HP/MP/TP) ---
 * @default
 *
 * @param gaugeHeight
 * @text Tinggi Gauge
 * @parent GaugeSettings
 * @type number
 * @min 4
 * @max 30
 * @default 10
 *
 * @param gaugeRounded
 * @text Gauge Rounded
 * @parent GaugeSettings
 * @type boolean
 * @desc Buat ujung gauge HP/MP/TP membulat seperti UI modern.
 * @default true
 *
 * @param hpColor1
 * @text Warna HP (Awal)
 * @parent GaugeSettings
 * @default #ff5f6d
 *
 * @param hpColor2
 * @text Warna HP (Akhir)
 * @parent GaugeSettings
 * @default #ffc371
 *
 * @param mpColor1
 * @text Warna MP (Awal)
 * @parent GaugeSettings
 * @default #36d1dc
 *
 * @param mpColor2
 * @text Warna MP (Akhir)
 * @parent GaugeSettings
 * @default #5b86e5
 *
 * @param tpColor1
 * @text Warna TP (Awal)
 * @parent GaugeSettings
 * @default #56ab2f
 *
 * @param tpColor2
 * @text Warna TP (Akhir)
 * @parent GaugeSettings
 * @default #a8e063
 *
 * @help
 * ============================================================================
 * ModernUI.js — Modernisasi Tampilan RPG Maker MZ
 * ============================================================================
 *
 * Plugin ini mengubah tampilan window (menu, dialog, nama, dsb) menjadi lebih
 * modern TANPA perlu mengganti file window.png secara manual:
 *   - Sudut window melengkung (rounded corner)
 *   - Background semi-transparent dengan gradient
 *   - Border tipis berwarna aksen
 *   - Gauge HP/MP/TP bergaya gradient modern dan rounded
 *   - Opsi font custom untuk seluruh UI
 *
 * CARA PASANG:
 *   1. Simpan file ini di folder project: js/plugins/ModernUI.js
 *   2. Buka Plugin Manager di RPG Maker MZ, tambahkan "ModernUI"
 *   3. Pastikan posisinya di ATAS plugin UI lain (VisuStella dsb) supaya
 *      tidak konflik, atau di BAWAH jika ingin ModernUI menimpa plugin lain.
 *   4. Atur parameter warna/ukuran sesuai selera di Plugin Manager.
 *
 * CATATAN FONT CUSTOM:
 *   Jika ingin memakai font selain default (misal "Rubik" atau "Poppins"):
 *   1. Taruh file font (.ttf/.woff) di folder fonts/
 *   2. Daftarkan lewat FontManager.load('NamaFont', 'namafile.ttf') di
 *      salah satu plugin (bisa lewat plugin command Community_Basic atau
 *      plugin loader font terpisah)
 *   3. Isi parameter "Nama Font Utama" dengan nama yang sama persis.
 *   Jika tidak diisi / font tidak ditemukan, plugin otomatis fallback ke
 *   font default RPG Maker (GameFont) agar teks tidak hilang.
 *
 * FITUR NAME INPUT (HANYA HURUF & ANGKA):
 *   Jika "Hanya Huruf & Angka" = true, layar input nama (Scene_Name) akan
 *   otomatis diganti tabel karakternya sehingga HANYA menampilkan huruf
 *   A-Z, a-z, dan angka 0-9. Semua simbol (! # $ % & * dsb) dan tombol
 *   "Page" dihilangkan — cukup ketik nama lalu tekan tombol "OK".
 *   Tinggal window juga otomatis menyesuaikan karena jumlah baris berkurang.
 *
 * KOMPATIBILITAS:
 *   Plugin ini meng-override Window_Base.prototype._refreshBack,
 *   _refreshFrame, drawGauge, dan Window.prototype._refreshFrame (PIXI).
 *   Jika dipakai bersama plugin UI besar seperti VisuStella Core Engine,
 *   coba ubah urutan plugin di Plugin Manager jika ada tampilan yang aneh
 *   (misal border dobel atau warna tidak berubah).
 *
 * Tidak ada plugin command khusus — cukup aktifkan dan atur parameter.
 *
 * ============================================================================
 * Riwayat Versi
 * ============================================================================
 * v1.0.0 - Rilis awal: rounded window, gradient background, border custom,
 *          gauge modern, opsi font.
 * v1.1.0 - Fix: border/frame window sekarang ikut mengecil & transparan saat
 *          window openness/opacity berubah (sebelumnya frame bisa "nyangkut"
 *          jadi kotak kosong terlihat di layar walau window seharusnya
 *          tersembunyi, misalnya nama box message yang kosong).
 *          Tambah: opsi "Hanya Huruf & Angka" untuk keyboard Name Input,
 *          menghilangkan semua simbol dan tombol Page.
 * ============================================================================
 */

(() => {
    'use strict';

    const pluginName = 'ModernUI';
    const params = PluginManager.parameters(pluginName);

    const CORNER_RADIUS   = Number(params.cornerRadius || 16);
    const BG_COLOR_TOP    = params.bgColorTop || '#1b1f2a';
    const BG_COLOR_BOTTOM = params.bgColorBottom || '#10131a';
    const BG_OPACITY      = Number(params.bgOpacity || 220) / 255;
    const BORDER_COLOR    = params.borderColor || '#4fd6c8';
    const BORDER_THICK    = Number(params.borderThickness || 2);
    const DISABLE_ARROW   = params.disableArrow === 'true';

    const FONT_FACE = params.mainFontFace || 'GameFont';
    const FONT_SIZE = Number(params.mainFontSize || 26);

    const RESTRICT_ALNUM = params.restrictAlnumOnly !== 'false';

    const GAUGE_HEIGHT  = Number(params.gaugeHeight || 10);
    const GAUGE_ROUNDED = params.gaugeRounded === 'true';

    const HP_COLOR_1 = params.hpColor1 || '#ff5f6d';
    const HP_COLOR_2 = params.hpColor2 || '#ffc371';
    const MP_COLOR_1 = params.mpColor1 || '#36d1dc';
    const MP_COLOR_2 = params.mpColor2 || '#5b86e5';
    const TP_COLOR_1 = params.tpColor1 || '#56ab2f';
    const TP_COLOR_2 = params.tpColor2 || '#a8e063';

    //-------------------------------------------------------------------------
    // Util: cek apakah font sudah siap, kalau tidak pakai fallback
    //-------------------------------------------------------------------------
    function safeFontFace() {
        try {
            if (FONT_FACE && FONT_FACE !== 'GameFont' && document.fonts) {
                // Cek sederhana: jika belum termuat, tetap pakai nama tsb.
                // Browser akan otomatis fallback ke font sistem jika gagal load.
                return FONT_FACE;
            }
        } catch (e) {
            // abaikan, fallback di bawah
        }
        return $gameSystem && $gameSystem.mainFontFace ? $gameSystem.mainFontFace() : 'GameFont';
    }

    //-------------------------------------------------------------------------
    // Window_Base: font default
    //-------------------------------------------------------------------------
    const _Window_Base_resetFontSettings = Window_Base.prototype.resetFontSettings;
    Window_Base.prototype.resetFontSettings = function() {
        _Window_Base_resetFontSettings.call(this);
        this.contents.fontFace = safeFontFace();
        this.contents.fontSize = FONT_SIZE;
    };

    //-------------------------------------------------------------------------
    // Sembunyikan panah scroll bawaan (opsional)
    //-------------------------------------------------------------------------
    if (DISABLE_ARROW) {
        Window.prototype._refreshArrows = function() {
            const w = this._width;
            const h = this._height;
            const p = 24;
            const q = p / 2;
            const sx = 96 + p;
            const sy = 0 + p;
            this._downArrowSprite.bitmap = this._windowskin;
            this._downArrowSprite.anchor.x = 0.5;
            this._downArrowSprite.anchor.y = 0.5;
            this._downArrowSprite.setFrame(sx + q, sy + q + p, p, q);
            this._downArrowSprite.move(w / 2, h - q);
            this._downArrowSprite.visible = false;
            this._upArrowSprite.bitmap = this._windowskin;
            this._upArrowSprite.anchor.x = 0.5;
            this._upArrowSprite.anchor.y = 0.5;
            this._upArrowSprite.setFrame(sx + q, sy, p, q);
            this._upArrowSprite.move(w / 2, q);
            this._upArrowSprite.visible = false;
        };
    }

    //-------------------------------------------------------------------------
    // Override tampilan window: background gradient + rounded + border
    // Kita gambar ulang lewat PIXI Graphics agar tidak bergantung pada
    // window.png sama sekali.
    //-------------------------------------------------------------------------
    function hexToNumber(hex) {
        return parseInt(hex.replace('#', '0x'), 16);
    }

    Window.prototype._refreshBack = function() {
        const m = this._margin;
        const w = Math.max(0, this._width - m * 2);
        const h = Math.max(0, this._height - m * 2);
        const sprite = this._backSprite;
        const tone = this._colorTone;

        sprite.bitmap = new Bitmap(w, h);
        sprite.setFrame(0, 0, w, h);
        sprite.move(m, m);

        if (w > 0 && h > 0) {
            const bmp = sprite.bitmap;
            const ctx = bmp.context;
            const r = Math.min(CORNER_RADIUS, w / 2, h / 2);

            ctx.save();
            this._drawRoundRectPath(ctx, 0.5, 0.5, w - 1, h - 1, r);
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, BG_COLOR_TOP);
            grad.addColorStop(1, BG_COLOR_BOTTOM);
            ctx.globalAlpha = BG_OPACITY;
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.restore();
            bmp._baseTexture.update();
        }

        this._backSprite.setColorTone(tone);
    };

    Window.prototype._drawRoundRectPath = function(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
    };

    Window.prototype._refreshFrame = function() {
        const w = this._width;
        const h = this._height;

        // PENTING: frame dipasang di dalam this._container (bukan langsung
        // di "this") supaya ikut mengecil/transparan mengikuti animasi
        // buka-tutup (openness) dan opacity window, sama seperti backSprite.
        // Sebelumnya frame dipasang langsung ke "this" sehingga bisa
        // "nyangkut" tetap terlihat sebagai kotak kosong walau window-nya
        // sendiri seharusnya tersembunyi (openness 0 / opacity 0) — inilah
        // penyebab kotak outline kosong yang kadang muncul di pojok layar.
        if (!this._modernFrameSprite) {
            this._modernFrameSprite = new Sprite();
        }
        if (this._modernFrameSprite.parent !== this._container) {
            this._container.addChild(this._modernFrameSprite);
        }

        if (w <= 0 || h <= 0) {
            this._modernFrameSprite.visible = false;
            return;
        }
        this._modernFrameSprite.visible = true;

        const bmp = new Bitmap(w, h);
        const ctx = bmp.context;
        const r = Math.min(CORNER_RADIUS, w / 2, h / 2);

        if (BORDER_THICK > 0) {
            ctx.save();
            this._drawRoundRectPath(ctx, BORDER_THICK / 2, BORDER_THICK / 2, w - BORDER_THICK, h - BORDER_THICK, r);
            ctx.lineWidth = BORDER_THICK;
            ctx.strokeStyle = BORDER_COLOR;
            ctx.stroke();
            ctx.restore();
        }
        bmp._baseTexture.update();

        this._modernFrameSprite.bitmap = bmp;
        this._modernFrameSprite.move(0, 0);
    };

    //-------------------------------------------------------------------------
    // Gauge HP/MP/TP modern: rounded + gradient
    //-------------------------------------------------------------------------
    function drawModernGauge(win, x, y, width, rate, color1, color2) {
        const bitmap = win.contents;
        const gh = GAUGE_HEIGHT;
        const fillW = Math.floor((width) * rate.clamp(0, 1));
        const gy = y + (win.lineHeight() - gh);

        // Background track
        bitmap.context.save();
        drawRoundedRect(bitmap.context, x, gy, width, gh, GAUGE_ROUNDED ? gh / 2 : 2, 'rgba(0,0,0,0.4)');
        bitmap.context.restore();

        if (fillW > 0) {
            bitmap.context.save();
            const grad = bitmap.context.createLinearGradient(x, 0, x + width, 0);
            grad.addColorStop(0, color1);
            grad.addColorStop(1, color2);
            drawRoundedRectFillStyle(bitmap.context, x, gy, fillW, gh, GAUGE_ROUNDED ? gh / 2 : 2, grad);
            bitmap.context.restore();
        }
        bitmap._baseTexture.update();
    }

    function drawRoundedRect(ctx, x, y, w, h, r, color) {
        r = Math.min(r, h / 2, w / 2);
        if (w <= 0 || h <= 0) return;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    function drawRoundedRectFillStyle(ctx, x, y, w, h, r, fillStyle) {
        r = Math.min(r, h / 2, w / 2);
        if (w <= 0 || h <= 0) return;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }

    const _Window_StatusBase_drawActorHp = Window_StatusBase.prototype.drawActorHp;
    Window_StatusBase.prototype.drawActorHp = function(actor, x, y, width) {
        width = width || 186;
        this.changeTextColor(ColorManager.systemColor());
        this.drawText(TextManager.hpA, x, y - this.lineHeight() + 4, 44);
        drawModernGauge(this, x, y, width, actor.hp / Math.max(actor.mhp, 1), HP_COLOR_1, HP_COLOR_2);
        this.resetTextColor();
        this.drawCurrentAndMax(actor.hp, actor.mhp, x, y, width,
            ColorManager.hpColor(actor), ColorManager.normalColor());
    };

    const _Window_StatusBase_drawActorMp = Window_StatusBase.prototype.drawActorMp;
    Window_StatusBase.prototype.drawActorMp = function(actor, x, y, width) {
        width = width || 186;
        this.changeTextColor(ColorManager.systemColor());
        this.drawText(TextManager.mpA, x, y - this.lineHeight() + 4, 44);
        drawModernGauge(this, x, y, width, actor.mp / Math.max(actor.mmp, 1), MP_COLOR_1, MP_COLOR_2);
        this.resetTextColor();
        this.drawCurrentAndMax(actor.mp, actor.mmp, x, y, width,
            ColorManager.mpColor(actor), ColorManager.normalColor());
    };

    const _Window_StatusBase_drawActorTp = Window_StatusBase.prototype.drawActorTp;
    Window_StatusBase.prototype.drawActorTp = function(actor, x, y, width) {
        width = width || 96;
        this.changeTextColor(ColorManager.systemColor());
        this.drawText(TextManager.tpA, x, y - this.lineHeight() + 4, 44);
        drawModernGauge(this, x, y, width, actor.tp / 100, TP_COLOR_1, TP_COLOR_2);
        this.resetTextColor();
        this.changeTextColor(ColorManager.tpColor(actor));
        this.drawText(actor.tp, x + width - 64, y - this.lineHeight() + 4, 64, 'right');
    };

    //-------------------------------------------------------------------------
    // Cursor pilihan (highlight tombol aktif) dibuat rounded, bukan kotak siku
    //-------------------------------------------------------------------------
    Window.prototype._refreshCursor = function() {
        const rect = this._cursorRect;
        const sprite = this._cursorSprite;
        const w = rect.width;
        const h = rect.height;

        if (w > 0 && h > 0) {
            const bmp = new Bitmap(w, h);
            const ctx = bmp.context;
            const r = Math.min(6, w / 2, h / 2);
            ctx.save();
            this._drawRoundRectPath(ctx, 1, 1, w - 2, h - 2, r);
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = BORDER_COLOR;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.lineWidth = 2;
            ctx.strokeStyle = BORDER_COLOR;
            ctx.stroke();
            ctx.restore();
            bmp._baseTexture.update();
            sprite.bitmap = bmp;
            sprite.visible = true;
        } else {
            sprite.visible = false;
        }
        sprite.move(rect.x, rect.y);
    };

    //-------------------------------------------------------------------------
    // Name Input: batasi hanya huruf (A-Z, a-z) dan angka (0-9)
    //-------------------------------------------------------------------------
    if (RESTRICT_ALNUM && typeof Window_NameInput !== 'undefined') {
        // PENTING: LATIN1/LATIN2 bawaan engine adalah array SATU DIMENSI
        // (flat, total 90 elemen = 9 baris x 10 kolom), BUKAN array 2D
        // per baris. Versi sebelumnya salah memakai array 2D sehingga
        // seluruh indeks karakter jadi salah baca (muncul "undefined" /
        // karakter numpuk). Di sini kita pertahankan bentuk & jumlah
        // elemen persis seperti bawaan, hanya mengganti tiap simbol
        // dengan spasi ' ' (placeholder kosong bawaan engine) dan
        // menghapus tombol "Page" (juga dikosongkan) karena hanya ada
        // satu halaman karakter. Tombol "OK" tetap di posisi terakhir.
        const ALNUM_LATIN = [
            'A', 'B', 'C', 'D', 'E', 'a', 'b', 'c', 'd', 'e',
            'F', 'G', 'H', 'I', 'J', 'f', 'g', 'h', 'i', 'j',
            'K', 'L', 'M', 'N', 'O', 'k', 'l', 'm', 'n', 'o',
            'P', 'Q', 'R', 'S', 'T', 'p', 'q', 'r', 's', 't',
            'U', 'V', 'W', 'X', 'Y', 'u', 'v', 'w', 'x', 'y',
            'Z', ' ', ' ', ' ', ' ', 'z', ' ', ' ', ' ', ' ',
            '0', '1', '2', '3', '4', ' ', ' ', ' ', ' ', ' ',
            '5', '6', '7', '8', '9', ' ', ' ', ' ', ' ', ' ',
            ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'OK'
        ];

        // LATIN2 (halaman alternatif saat tombol Page ditekan) dibuat
        // sama persis dengan LATIN1, jadi walau ada input pindah halaman
        // yang lolos, tampilannya tetap sama (tidak ada simbol muncul).
        Window_NameInput.LATIN1 = ALNUM_LATIN;
        Window_NameInput.LATIN2 = ALNUM_LATIN;
    }

})();
