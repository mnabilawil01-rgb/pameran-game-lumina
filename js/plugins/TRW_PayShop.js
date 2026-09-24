//=============================================================================
// TRW_PayShop.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [TRW] Pay Shop v2.0.0 - Tombol Top Up Gold (tap RFID) di map.
 * @author Claude
 *
 * @param buttonIcon
 * @text Icon Tombol
 * @desc Icon index buat tombol-nya (lihat nomor icon di IconSet). Default 314 = koin.
 * @type number
 * @default 314
 *
 * @param buttonOffsetX
 * @text Jarak Tombol dari Tepi Kanan
 * @type number
 * @default 56
 *
 * @param buttonY
 * @text Posisi Y Tombol
 * @desc Isi -1 biar otomatis di TENGAH layar (vertikal). Isi angka lain buat posisi custom.
 * @type number
 * @min -1
 * @default -1
 *
 * @param buttonSize
 * @text Ukuran Tombol (px)
 * @type number
 * @default 72
 *
 * @param windowTitle
 * @text Judul Popup
 * @type string
 * @default TOP UP GOLD
 *
 * @param promptLine1
 * @text Teks Baris 1
 * @type string
 * @default Tempelkan kartu RFID kamu
 *
 * @param promptLine2
 * @text Teks Baris 2
 * @type string
 * @default buat dapetin Gold instan!
 *
 * @param tapButtonText
 * @text Teks Tombol Tap
 * @type string
 * @default TAP KARTU RFID
 *
 * @param rfidGoldAmount
 * @text Jumlah Gold
 * @desc Gold yang didapat tiap sekali tap kartu.
 * @type number
 * @min 1
 * @default 1000
 *
 * @param readingFrames
 * @text Durasi "Membaca Kartu" (frame)
 * @desc 60 frame = 1 detik.
 * @type number
 * @min 1
 * @default 45
 *
 * @param coinIconIndex
 * @text Icon Koin di Popup
 * @desc Icon index buat gambar koin gede di tengah popup. Isi -1 kalau mau pakai gambar koin bawaan (digambar otomatis).
 * @type number
 * @min -1
 * @default -1
 *
 * @help
 * ============================================================================
 * TRW_PayShop.js
 * ============================================================================
 * Nambahin tombol "Top Up Gold" kecil di TENGAH KANAN layar pas lagi jalan
 * di map (Scene_Map). Diklik/tap -> muncul popup di tengah layar dengan
 * gambar koin gede + tombol "TAP KARTU RFID". Pas tombol itu dipencet,
 * plugin bakal simulasi proses baca kartu RFID (ada jeda sebentar biar
 * kerasa nyata), lalu otomatis nambahin Gold ke party sesuai parameter
 * "Jumlah Gold" (default 1000).
 *
 * Popup bisa ditutup pakai tombol Cancel (Esc/X) atau klik tombol "X" di
 * pojok kanan atas popup.
 *
 * Kalau mau ganti tampilan koin di popup, isi parameter "Icon Koin di
 * Popup" dengan nomor icon dari IconSet. Kalau dibiarin -1, koinnya bakal
 * digambar otomatis (bulat emas kinclong) tanpa perlu gambar tambahan.
 *
 * Free to use & edit.
 * ============================================================================
 */

(() => {
    "use strict";

    const pluginName = "TRW_PayShop";
    const params = PluginManager.parameters(pluginName);

    const BUTTON_ICON = Number(params.buttonIcon || 314);
    const BUTTON_OFFSET_X = Number(params.buttonOffsetX || 56);
    const BUTTON_Y_PARAM = Number(params.buttonY);
    const BUTTON_SIZE = Number(params.buttonSize || 72);
    const WINDOW_TITLE = String(params.windowTitle || "TOP UP GOLD");
    const PROMPT_LINE1 = String(params.promptLine1 || "");
    const PROMPT_LINE2 = String(params.promptLine2 || "");
    const TAP_BUTTON_TEXT = String(params.tapButtonText || "TAP KARTU RFID");
    const RFID_GOLD_AMOUNT = Number(params.rfidGoldAmount || 1000);
    const READING_FRAMES = Number(params.readingFrames || 45);
    const COIN_ICON_INDEX = Number(params.coinIconIndex);

    const PANEL_W = 380;
    const PANEL_H = 320;

    //=========================================================================
    // Helper - gambar koin emas kinclong (dipakai kalau nggak ada icon custom)
    //=========================================================================
    function drawCoin(bitmap, cx, cy, r) {
        const ctx = bitmap.context;
        ctx.save();
        const grad = ctx.createRadialGradient(
            cx - r * 0.35, cy - r * 0.35, r * 0.1,
            cx, cy, r
        );
        grad.addColorStop(0, "#fff8d8");
        grad.addColorStop(0.35, "#ffe27a");
        grad.addColorStop(0.75, "#e8b53a");
        grad.addColorStop(1, "#a9781c");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = Math.max(2, r * 0.06);
        ctx.strokeStyle = "#7a5613";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(1, r * 0.03);
        ctx.strokeStyle = "rgba(122,86,19,0.6)";
        ctx.stroke();
        ctx.restore();
        bitmap.fontFace = $gameSystem ? $gameSystem.mainFontFace() : "rmmz-mainfont";
        bitmap.fontSize = Math.round(r * 1.05);
        bitmap.fontBold = true;
        bitmap.textColor = "#7a5613";
        bitmap.outlineWidth = 0;
        bitmap.drawText("G", cx - r, cy - r * 0.62, r * 2, r * 1.3, "center");
    }

    //=========================================================================
    // Sprite_PayShopButton - tombol di tengah kanan layar
    //=========================================================================
    function Sprite_PayShopButton() {
        this.initialize(...arguments);
    }

    Sprite_PayShopButton.prototype = Object.create(Sprite_Clickable.prototype);
    Sprite_PayShopButton.prototype.constructor = Sprite_PayShopButton;

    Sprite_PayShopButton.prototype.initialize = function() {
        Sprite_Clickable.prototype.initialize.call(this);
        this.bitmap = new Bitmap(BUTTON_SIZE + 16, BUTTON_SIZE + 16);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.x = Graphics.boxWidth - BUTTON_OFFSET_X;
        this.y = BUTTON_Y_PARAM >= 0 ? BUTTON_Y_PARAM : Math.round(Graphics.boxHeight / 2);
        this._pressed = false;
        this._pulse = 0;
        this.drawButton();
    };

    Sprite_PayShopButton.prototype.drawButton = function() {
        const bmp = this.bitmap;
        const cx = bmp.width / 2;
        const cy = bmp.height / 2;
        const r = BUTTON_SIZE / 2;
        bmp.clear();

        // glow lembut di belakang tombol
        const ctx = bmp.context;
        ctx.save();
        ctx.shadowColor = "rgba(255, 220, 120, 0.9)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 220, 120, 0.001)";
        ctx.fill();
        ctx.restore();

        drawCoin(bmp, cx, cy, r);

        if (BUTTON_ICON >= 0) {
            const iconBitmap = ImageManager.loadSystem("IconSet");
            iconBitmap.addLoadListener(() => {
                const pw = ImageManager.iconWidth;
                const ph = ImageManager.iconHeight;
                const sx = (BUTTON_ICON % 16) * pw;
                const sy = Math.floor(BUTTON_ICON / 16) * ph;
                const dw = Math.round(pw * 0.78);
                const dh = Math.round(ph * 0.78);
                bmp.blt(iconBitmap, sx, sy, pw, ph, cx - dw / 2, cy - dh / 2, dw, dh);
            });
        }

        // label "+" kecil di pojok biar jelas ini tombol top up
        bmp.fontSize = 16;
        bmp.fontBold = true;
        bmp.textColor = "#ffffff";
        bmp.outlineColor = "#7a5613";
        bmp.outlineWidth = 3;
    };

    Sprite_PayShopButton.prototype.update = function() {
        Sprite_Clickable.prototype.update.call(this);
        this._pulse += 0.06;
        const bounce = this._pressed ? 0.88 : 1.0 + Math.sin(this._pulse) * 0.03;
        this.scale.x = this.scale.y = bounce;
        this.visible = this.isButtonVisible();
    };

    Sprite_PayShopButton.prototype.isButtonVisible = function() {
        return (
            $gameMap.isEventRunning() === false &&
            !$gameMessage.isBusy() &&
            !$gameSystem._payShopOpen
        );
    };

    Sprite_PayShopButton.prototype.onMouseEnter = function() {
        this._pressed = false;
    };

    Sprite_PayShopButton.prototype.onPress = function() {
        this._pressed = true;
    };

    Sprite_PayShopButton.prototype.onClick = function() {
        this._pressed = false;
        if (!this.isButtonVisible()) return;
        SoundManager.playOk();
        SceneManager._scene.openPayShop();
    };

    //=========================================================================
    // Sprite_PayShopClose (tombol X buat nutup popup)
    //=========================================================================
    function Sprite_PayShopClose() {
        this.initialize(...arguments);
    }

    Sprite_PayShopClose.prototype = Object.create(Sprite_Clickable.prototype);
    Sprite_PayShopClose.prototype.constructor = Sprite_PayShopClose;

    Sprite_PayShopClose.prototype.initialize = function() {
        Sprite_Clickable.prototype.initialize.call(this);
        const s = 28;
        this.bitmap = new Bitmap(s, s);
        const ctx = this.bitmap.context;
        ctx.strokeStyle = "#7a5613";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(7, 7);
        ctx.lineTo(s - 7, s - 7);
        ctx.moveTo(s - 7, 7);
        ctx.lineTo(7, s - 7);
        ctx.stroke();
    };

    Sprite_PayShopClose.prototype.onClick = function() {
        SoundManager.playCancel();
        SceneManager._scene.closePayShop();
    };

    //=========================================================================
    // Sprite_PayShopTapButton - tombol "TAP KARTU RFID" di dalam popup
    //=========================================================================
    function Sprite_PayShopTapButton() {
        this.initialize(...arguments);
    }

    Sprite_PayShopTapButton.prototype = Object.create(Sprite_Clickable.prototype);
    Sprite_PayShopTapButton.prototype.constructor = Sprite_PayShopTapButton;

    Sprite_PayShopTapButton.prototype.initialize = function() {
        Sprite_Clickable.prototype.initialize.call(this);
        this._w = 260;
        this._h = 60;
        this.bitmap = new Bitmap(this._w, this._h);
        this._pressed = false;
        this._spin = 0;
        this.redraw("idle");
    };

    Sprite_PayShopTapButton.prototype.redraw = function(state) {
        const bmp = this.bitmap;
        const ctx = bmp.context;
        const w = this._w;
        const h = this._h;
        const r = 16;
        bmp.clear();

        const disabled = state === "reading";
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        if (disabled) {
            grad.addColorStop(0, "#8a8a8a");
            grad.addColorStop(1, "#5c5c5c");
        } else {
            grad.addColorStop(0, "#ffe27a");
            grad.addColorStop(1, "#e0a530");
        }
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.arcTo(w, 0, w, h, r);
        ctx.arcTo(w, h, 0, h, r);
        ctx.arcTo(0, h, 0, 0, r);
        ctx.arcTo(0, 0, w, 0, r);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = disabled ? "#3f3f3f" : "#7a5613";
        ctx.stroke();
        ctx.restore();

        if (state === "reading") {
            // sinyal RFID muter-muter kecil di kiri teks
            const cx = 34;
            const cy = h / 2;
            for (let i = 0; i < 3; i++) {
                const radius = 6 + i * 6;
                const alpha = 0.9 - i * 0.25;
                const start = this._spin + i * 0.6;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
                ctx.lineWidth = 2.5;
                ctx.arc(cx, cy, radius, start, start + 1.6);
                ctx.stroke();
            }
        }

        bmp.fontFace = $gameSystem ? $gameSystem.mainFontFace() : "rmmz-mainfont";
        bmp.fontSize = 20;
        bmp.fontBold = true;
        bmp.textColor = "#4a3204";
        bmp.outlineWidth = 0;
        let label = TAP_BUTTON_TEXT;
        if (state === "reading") label = "MEMBACA KARTU...";
        if (state === "success") label = "BERHASIL!";
        const textX = state === "reading" ? 50 : 0;
        const textW = state === "reading" ? w - 60 : w;
        bmp.drawText(label, textX, 0, textW, h, "center");
    };

    Sprite_PayShopTapButton.prototype.update = function() {
        Sprite_Clickable.prototype.update.call(this);
        const scene = SceneManager._scene;
        if (!scene || !scene._payShopState) return;
        if (scene._payShopState === "reading") {
            this._spin += 0.25;
            this.redraw("reading");
        }
        this.scale.x = this.scale.y = this._pressed ? 0.96 : 1.0;
    };

    Sprite_PayShopTapButton.prototype.isClickEnabled = function() {
        const scene = SceneManager._scene;
        return !!scene && scene._payShopState === "idle";
    };

    Sprite_PayShopTapButton.prototype.onMouseEnter = function() {
        this._pressed = false;
    };

    Sprite_PayShopTapButton.prototype.onPress = function() {
        if (!this.isClickEnabled()) return;
        this._pressed = true;
    };

    Sprite_PayShopTapButton.prototype.onClick = function() {
        this._pressed = false;
        if (!this.isClickEnabled()) return;
        SceneManager._scene.startPayShopTap();
    };

    //=========================================================================
    // Scene_Map - pasang tombol & popup top up gold
    //=========================================================================
    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this.createPayShopButton();
    };

    Scene_Map.prototype.createPayShopButton = function() {
        this._payShopButton = new Sprite_PayShopButton();
        this.addChild(this._payShopButton);
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        this.updatePayShop();
    };

    Scene_Map.prototype.updatePayShop = function() {
        if (this._payShopState === "reading") {
            this._payShopTimer--;
            if (this._payShopTimer <= 0) {
                this.completePayShopTap();
            }
        } else if (this._payShopState === "success") {
            this._payShopSuccessTimer--;
            if (this._payShopSuccessTimer <= 0) {
                this._payShopState = "idle";
                this.redrawPayShopStatus("idle");
                this._payShopTapButton.redraw("idle");
            }
        }
    };

    Scene_Map.prototype.openPayShop = function() {
        if (this._payShopPanelBg) return;
        $gameSystem._payShopOpen = true;
        this._payShopState = "idle";

        const panelX = Math.round((Graphics.boxWidth - PANEL_W) / 2);
        const panelY = Math.round((Graphics.boxHeight - PANEL_H) / 2);

        // overlay gelap di belakang popup
        const overlay = new Sprite(new Bitmap(Graphics.boxWidth, Graphics.boxHeight));
        overlay.bitmap.fillAll("rgba(0,0,0,0.55)");
        overlay.opacity = 255;
        this._payShopOverlay = overlay;
        this.addChild(overlay);

        // panel background
        const bg = new Sprite(new Bitmap(PANEL_W, PANEL_H));
        const ctx = bg.bitmap.context;
        const r = 20;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.arcTo(PANEL_W, 0, PANEL_W, PANEL_H, r);
        ctx.arcTo(PANEL_W, PANEL_H, 0, PANEL_H, r);
        ctx.arcTo(0, PANEL_H, 0, 0, r);
        ctx.arcTo(0, 0, PANEL_W, 0, r);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, 0, PANEL_H);
        grad.addColorStop(0, "rgba(35,28,14,0.97)");
        grad.addColorStop(1, "rgba(18,14,6,0.97)");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#e8c86e";
        ctx.stroke();
        ctx.restore();
        bg.bitmap.fontFace = $gameSystem.mainFontFace();
        bg.bitmap.fontSize = 26;
        bg.bitmap.fontBold = true;
        bg.bitmap.textColor = "#ffe9a8";
        bg.bitmap.outlineColor = "#000000";
        bg.bitmap.outlineWidth = 4;
        bg.bitmap.drawText(WINDOW_TITLE, 0, 16, PANEL_W, 32, "center");
        bg.bitmap.fontSize = 18;
        bg.bitmap.fontBold = false;
        bg.bitmap.textColor = "#dcd3b8";
        bg.bitmap.outlineWidth = 3;
        bg.bitmap.drawText(PROMPT_LINE1, 0, PANEL_H - 108, PANEL_W, 24, "center");
        bg.bitmap.drawText(PROMPT_LINE2, 0, PANEL_H - 86, PANEL_W, 24, "center");
        bg.x = panelX;
        bg.y = panelY;
        this._payShopPanelBg = bg;
        this.addChild(bg);

        // koin gede di tengah
        const coinSize = 128;
        const coin = new Sprite(new Bitmap(coinSize, coinSize));
        if (COIN_ICON_INDEX >= 0) {
            const iconBitmap = ImageManager.loadSystem("IconSet");
            iconBitmap.addLoadListener(() => {
                const pw = ImageManager.iconWidth;
                const ph = ImageManager.iconHeight;
                const sx = (COIN_ICON_INDEX % 16) * pw;
                const sy = Math.floor(COIN_ICON_INDEX / 16) * ph;
                const scale = 2.2;
                coin.bitmap.blt(
                    iconBitmap, sx, sy, pw, ph,
                    coinSize / 2 - (pw * scale) / 2,
                    coinSize / 2 - (ph * scale) / 2,
                    pw * scale, ph * scale
                );
            });
        } else {
            drawCoin(coin.bitmap, coinSize / 2, coinSize / 2, coinSize / 2 - 4);
        }
        coin.x = panelX + PANEL_W / 2 - coinSize / 2;
        coin.y = panelY + 60;
        this._payShopCoin = coin;
        this.addChild(coin);

        // status text (dinamis)
        const status = new Sprite(new Bitmap(PANEL_W - 40, 28));
        status.x = panelX + 20;
        status.y = panelY + PANEL_H - 58;
        this._payShopStatus = status;
        this.addChild(status);
        this.redrawPayShopStatus("idle");

        // tombol tap
        const tapButton = new Sprite_PayShopTapButton();
        tapButton.x = panelX + PANEL_W / 2 - tapButton._w / 2;
        tapButton.y = panelY + PANEL_H + 16;
        this._payShopTapButton = tapButton;
        this.addChild(tapButton);

        // tombol close
        const closeButton = new Sprite_PayShopClose();
        closeButton.x = panelX + PANEL_W - 34;
        closeButton.y = panelY + 12;
        this._payShopCloseButton = closeButton;
        this.addChild(closeButton);
    };

    Scene_Map.prototype.redrawPayShopStatus = function(state) {
        const status = this._payShopStatus;
        if (!status) return;
        status.bitmap.clear();
        status.bitmap.fontFace = $gameSystem.mainFontFace();
        status.bitmap.fontSize = 16;
        status.bitmap.fontBold = false;
        status.bitmap.outlineColor = "#000000";
        status.bitmap.outlineWidth = 3;
        if (state === "success") {
            status.bitmap.textColor = "#8cff8c";
            status.bitmap.drawText(`+${RFID_GOLD_AMOUNT} G diterima!`, 0, 0, status.bitmap.width, 24, "center");
        } else {
            status.bitmap.textColor = "#b8ae8f";
            status.bitmap.drawText(`Gold kamu sekarang: ${$gameParty.gold()} G`, 0, 0, status.bitmap.width, 24, "center");
        }
    };

    Scene_Map.prototype.startPayShopTap = function() {
        if (this._payShopState !== "idle") return;
        this._payShopState = "reading";
        this._payShopTimer = READING_FRAMES;
        SoundManager.playCursor();
        this._payShopTapButton.redraw("reading");
    };

    Scene_Map.prototype.completePayShopTap = function() {
        $gameParty.gainGold(RFID_GOLD_AMOUNT);
        this._payShopState = "success";
        this._payShopSuccessTimer = 60;
        SoundManager.playShop();
        this.redrawPayShopStatus("success");
        this._payShopTapButton.redraw("success");
    };

    Scene_Map.prototype.closePayShop = function() {
        if (!this._payShopPanelBg) return;
        this.removeChild(this._payShopOverlay);
        this.removeChild(this._payShopPanelBg);
        this.removeChild(this._payShopCoin);
        this.removeChild(this._payShopStatus);
        this.removeChild(this._payShopTapButton);
        this.removeChild(this._payShopCloseButton);
        this._payShopOverlay = null;
        this._payShopPanelBg = null;
        this._payShopCoin = null;
        this._payShopStatus = null;
        this._payShopTapButton = null;
        this._payShopCloseButton = null;
        this._payShopState = null;
        $gameSystem._payShopOpen = false;
    };

    //=========================================================================
    // Cancel (Esc) buat nutup popup
    //=========================================================================
    const _Scene_Map_isMenuCalled = Scene_Map.prototype.isMenuCalled;
    Scene_Map.prototype.isMenuCalled = function() {
        if ($gameSystem._payShopOpen) return false;
        return _Scene_Map_isMenuCalled.call(this);
    };

    const _Scene_Map_updateCallMenu = Scene_Map.prototype.updateCallMenu;
    Scene_Map.prototype.updateCallMenu = function() {
        if ($gameSystem._payShopOpen && Input.isTriggered("cancel")) {
            this.closePayShop();
            return;
        }
        if (_Scene_Map_updateCallMenu) _Scene_Map_updateCallMenu.call(this);
    };

    //=========================================================================
    // Blokir gerak player selagi popup top up aktif
    //=========================================================================
    const _Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        if ($gameSystem._payShopOpen) return false;
        return _Game_Player_canMove.call(this);
    };
})();
