/*:
 * @target MZ
 * @plugindesc Mengubah kontrol pergerakan menjadi WASD (Force Override) dan Disable Dash.
 * @author Horizon
 * @help
 * Plugin sederhana untuk memetakan ulang tombol W, A, S, D
 * menjadi kontrol arah (Up, Left, Down, Right),
 * serta menonaktifkan fitur lari (dash) dengan tombol Shift.
 */
(function() {
    // Menyimpan fungsi asli dari Scene_Boot
    const _Scene_Boot_start = Scene_Boot.prototype.start;
    
    // Menjalankan key mapper setelah semua plugin & game selesai dimuat
    Scene_Boot.prototype.start = function() {
        _Scene_Boot_start.call(this);
        
        Input.keyMapper[87] = 'up';    // W
        Input.keyMapper[65] = 'left';  // A
        Input.keyMapper[83] = 'down';  // S
        Input.keyMapper[68] = 'right'; // D
    };

    // Override fungsi isDashing agar selalu bernilai false
    // Ini akan mematikan fitur lari dari tombol Shift maupun opsi 'Always Dash'
    Game_Player.prototype.isDashing = function() {
        return false;
    };
})();