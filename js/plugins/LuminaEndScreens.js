/*:
 * @target MZ
 * @plugindesc Adds a completion screen for Lumina's final level.
 * @author Lumina
 *
 * @help
 * Call Scene_LuminaComplete after the final boss is defeated.
 */

(() => {
    "use strict";

    class Window_LuminaComplete extends Window_Base {
        initialize(rect) {
            super.initialize(rect);
            this.opacity = 0;
            this.refresh();
        }

        refresh() {
            this.contents.clear();
            this.resetTextColor();
            this.contents.fontSize = 54;
            this.contents.fontBold = true;
            this.drawText("PERMAINAN SELESAI", 0, 8, this.contentsWidth(), "center");
            this.contents.fontBold = false;
            this.contents.fontSize = 26;
            this.drawText(
                "Kamu berhasil menaklukkan seluruh tujuh level!",
                0,
                92,
                this.contentsWidth(),
                "center"
            );
            this.contents.fontSize = 20;
            this.drawText(
                "Terima kasih telah bermain Petualangan Lumina.",
                0,
                142,
                this.contentsWidth(),
                "center"
            );
        }
    }

    class Window_LuminaCompleteCommand extends Window_Command {
        initialize(rect) {
            super.initialize(rect);
            this.openness = 255;
        }

        makeCommandList() {
            this.addCommand("Kembali ke Istana", "lobby");
        }
    }

    class Scene_LuminaComplete extends Scene_Base {
        create() {
            super.create();
            const background = new Sprite(SceneManager.backgroundBitmap());
            this.addChild(background);

            const shade = new Sprite(new Bitmap(Graphics.boxWidth, Graphics.boxHeight));
            shade.bitmap.fillAll("#080d18");
            shade.opacity = 220;
            this.addChild(shade);

            this.createWindowLayer();
            const messageRect = new Rectangle(
                Math.floor((Graphics.boxWidth - 680) / 2),
                Math.floor(Graphics.boxHeight * 0.28),
                680,
                240
            );
            this._messageWindow = new Window_LuminaComplete(messageRect);
            this._windowLayer.addChild(this._messageWindow);

            const commandRect = new Rectangle(
                Math.floor((Graphics.boxWidth - 300) / 2),
                Math.floor(Graphics.boxHeight * 0.72),
                300,
                72
            );
            this._commandWindow = new Window_LuminaCompleteCommand(commandRect);
            this._commandWindow.setHandler("lobby", this.returnToLobby.bind(this));
            this._windowLayer.addChild(this._commandWindow);
            this._commandWindow.activate();
        }

        returnToLobby() {
            $gamePlayer.reserveTransfer(8, 6, 27, 2, 0);
            SceneManager.goto(Scene_Map);
        }
    }

    window.Scene_LuminaComplete = Scene_LuminaComplete;
})();
