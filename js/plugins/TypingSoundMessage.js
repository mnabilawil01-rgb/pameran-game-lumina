//=============================================================================
// TypingSoundMessage.js
//=============================================================================

/*:
 * @target MV MZ
 * @plugindesc Memainkan suara "ngetik" saat Show Text menampilkan karakter.
 * @author -
 *
 * @help
 * Plugin ini memainkan SE setiap beberapa karakter saat pesan (Show Text)
 * sedang ditampilkan, sehingga pemain tahu ada teks yang sedang berjalan.
 *
 * Cara pakai:
 * 1. Taruh file ini di js/plugins/ dengan nama TypingSoundMessage.js
 * 2. Aktifkan di Plugin Manager.
 * 3. Pilih SE di parameter (taruh SE pendek di audio/se/).
 *
 * Tips:
 * - Pakai SE yang SANGAT pendek (blip / click), kira-kira 0.05 detik.
 * - Kalau terasa terlalu ramai, naikkan "Interval".
 * - Suara tidak dimainkan saat teks ditampilkan instan (tombol OK ditahan).
 * - Isi "Disable Switch ID" dengan nomor switch; saat switch itu ON,
 *   suara dimatikan (berguna untuk adegan tertentu).
 *
 * @param seName
 * @text SE Name
 * @type file
 * @dir audio/se/
 * @default Cursor1
 *
 * @param volume
 * @text Volume
 * @type number
 * @min 0
 * @max 100
 * @default 50
 *
 * @param pitch
 * @text Pitch
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @param pitchVariance
 * @text Pitch Variance
 * @desc Variasi acak pitch (+/-) supaya suara tidak monoton. 0 = tetap.
 * @type number
 * @min 0
 * @max 50
 * @default 8
 *
 * @param pan
 * @text Pan
 * @type number
 * @min -100
 * @max 100
 * @default 0
 *
 * @param interval
 * @text Interval
 * @desc Suara dimainkan setiap N karakter.
 * @type number
 * @min 1
 * @default 2
 *
 * @param skipSpaces
 * @text Skip Spaces & Punctuation
 * @desc Jangan bunyi untuk spasi dan tanda baca.
 * @type boolean
 * @default true
 *
 * @param disableSwitchId
 * @text Disable Switch ID
 * @desc Saat switch ini ON, suara dimatikan. 0 = tidak dipakai.
 * @type switch
 * @default 0
 */

(() => {
    "use strict";

    const pluginName = "TypingSoundMessage";
    const params = PluginManager.parameters(pluginName);

    const seName = String(params.seName || "Cursor1");
    const volume = Number(params.volume || 50);
    const pitch = Number(params.pitch || 100);
    const pitchVariance = Number(params.pitchVariance || 0);
    const pan = Number(params.pan || 0);
    const interval = Math.max(1, Number(params.interval || 2));
    const skipSpaces = String(params.skipSpaces) !== "false";
    const disableSwitchId = Number(params.disableSwitchId || 0);

    const skipPattern = /[\s.,!?;:'"…、。！？「」『』()（）\-–—]/;

    const _startMessage = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function () {
        this._typingSoundCount = 0;
        _startMessage.call(this);
    };

    const _processNormalCharacter = Window_Message.prototype.processNormalCharacter;
    Window_Message.prototype.processNormalCharacter = function (textState) {
        const c = textState.text[textState.index];
        _processNormalCharacter.call(this, textState);
        this.playTypingSound(c, textState);
    };

    Window_Message.prototype.playTypingSound = function (c, textState) {
        if (textState.drawing === false) return;
        if (!seName) return;
        if (this._showFast || this._lineShowFast) return;
        if (disableSwitchId > 0 && $gameSwitches.value(disableSwitchId)) return;
        if (skipSpaces && c && skipPattern.test(c)) return;

        this._typingSoundCount = (this._typingSoundCount || 0) + 1;
        if (this._typingSoundCount % interval !== 0) return;

        const variance = pitchVariance
            ? Math.randomInt(pitchVariance * 2 + 1) - pitchVariance
            : 0;

        AudioManager.playSe({
            name: seName,
            volume: volume,
            pitch: Math.max(50, pitch + variance),
            pan: pan
        });
    };
})();
