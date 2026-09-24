//=============================================================================
// TRW_DisableClickMove.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [TRW] Disable Click-to-Move v1.0.0 - Matiin jalan-otomatis pas klik map, tombol UI tetap jalan.
 * @author Claude
 *
 * @help
 * ============================================================================
 * TRW_DisableClickMove.js
 * ============================================================================
 * Defaultnya RPG Maker MZ: kalau player klik/tap sembarang tempat di map,
 * karakter bakal jalan otomatis ke titik itu. Plugin ini MATIIN perilaku
 * itu doang.
 *
 * Tombol-tombol UI (menu, pengaturan, tombol custom kayak Pay Shop, dll)
 * TETAP bisa diklik seperti biasa, karena tombol-tombol itu pakai jalur
 * klik yang beda (Sprite_Clickable), bukan lewat "jalan ke titik klik"
 * yang dimatiin di sini.
 *
 * Cara pakai: taruh plugin ini di mana aja di Plugin Manager (nggak perlu
 * setting apa-apa), lalu ON-kan.
 *
 * Kalau suatu saat mau balikin perilaku klik-buat-jalan, tinggal OFF-kan
 * atau hapus plugin ini.
 * ============================================================================
 */

(() => {
    "use strict";

    // Ini fungsi yang dipanggil RPG Maker MZ pas mau nyuruh karakter jalan
    // ke titik yang diklik/di-tap di map. Kita bikin jadi nggak ngapa-ngapain.
    Game_Temp.prototype.setDestination = function(x, y) {
        // sengaja dikosongin - klik/tap di map nggak bikin karakter jalan lagi
    };
})();
