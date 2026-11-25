/*:
 * @target MZ
 * @plugindesc Adds the Indonesian title menu and a progression-safe tutorial.
 * @author Lumina
 *
 * @help
 * Keeps the existing title, options, and new-game handlers while presenting
 * MULAI, TUTORIAL, and SETTING. The tutorial is informational only.
 */

(() => {
    const tutorialPages = [
        {
            title: "Dasar Permainan",
            lines: [
                "Bergerak dengan tombol arah",
                "atau W, A, S, D.",
                "Enter, Z, atau Spasi:",
                "untuk memilih dan bicara.",
                "Esc atau X untuk kembali",
                "atau membuka menu.",
                "Nama karakter mengikuti email akun P2R."
            ]
        },
        {
            title: "Eksplorasi",
            lines: [
                "Jelajahi area dan periksa sekitar.",
                "Dekati orang, peti, dan pintu",
                "untuk berinteraksi dengannya.",
                "Baca dialog dan perhatikan petunjuk",
                "sebelum melanjutkan perjalanan."
            ]
        },
        {
            title: "Pertarungan Ritme",
            topic: "Ritme",
            lines: [
                "Tekan D, F, J, atau K saat",
                "penanda mencapai sasaran.",
                "Ikuti ketukan lagu untuk meraih",
                "skor dan menjaga rangkaian hit.",
                "Hasil muncul setelah lagu usai."
            ]
        },
        {
            title: "Toko & Perlengkapan",
            topic: "Toko",
            lines: [
                "Berinteraksi dengan penjaga toko",
                "untuk membeli barang atau",
                "perlengkapan.",
                "Periksa harga dan deskripsi",
                "sebelum menentukan jumlah beli.",
                "Toko perlengkapan membandingkan",
                "status sebelum kamu membeli."
            ]
        },
        {
            title: "Progres",
            lines: [
                "Selesaikan tujuh level ritme",
                "untuk mendapat hadiah dan",
                "membuka jalan.",
                "Periksa peta dan gerbang di Istana",
                "untuk memilih level yang tersedia.",
                "Kamu bermain sebagai satu MC."
            ]
        },
        {
            title: "Puzzle",
            lines: [
                "Amati dialog dan objek di sekitar.",
                "Berinteraksi dengan tanda",
                "atau pintu untuk mencari petunjuk.",
                "Jika buntu, periksa area sekitar",
                "dan cari objek yang terlewat."
            ]
        }
    ];

    const tutorialTopics = tutorialPages.map(page => page.topic || page.title);
    const titleLabels = ["MULAI", "TUTORIAL", "SETTING"];

    ColorManager.textColor = function() {
        return "#ffffff";
    };

    Window_TitleCommand.prototype.makeCommandList = function() {
        this.addCommand("MULAI", "newGame", true);
        this.addCommand("TUTORIAL", "tutorial", true);
        this.addCommand("SETTING", "options", true);
    };

    if (typeof TpictureCom !== "undefined") {
        TpictureCom.prototype.prepareBitmap = function() {
            const bitmap = new Bitmap(160, 80);
            bitmap.fontFace = $gameSystem.mainFontFace();
            bitmap.outlineColor = "rgba(0, 0, 0, 0.9)";
            bitmap.outlineWidth = 5;
            bitmap.textColor = "#ffffff";

            for (let frame = 0; frame < 2; frame++) {
                bitmap.fontSize = frame === 0 ? 28 : 25;
                bitmap.drawText(
                    titleLabels[this._index] || "",
                    0,
                    frame * 40,
                    160,
                    40,
                    "center"
                );
            }
            this.bitmap = bitmap;
        };
    }

    class Window_LuminaTutorialTopics extends Window_Command {
        makeCommandList() {
            for (let i = 0; i < tutorialPages.length; i++) {
                this.addCommand(tutorialTopics[i], `topic${i}`);
            }
            this.addCommand("Kembali", "returnToTitle");
        }
    }

    class Window_LuminaTutorialPage extends Window_Base {
        setPage(index) {
            this._pageIndex = index;
            this.refresh();
        }

        refresh() {
            this.contents.clear();
            const page = tutorialPages[this._pageIndex] || tutorialPages[0];
            this.resetFontSettings();
            this.contents.fontSize = 30;
            this.drawText(page.title, 0, 0, this.innerWidth, "center");
            this.contents.fontSize = $gameSystem.mainFontSize();

            let y = 72;
            for (const line of page.lines) {
                this.drawText(line, 12, y, this.innerWidth - 24, "left");
                y += this.lineHeight() + 8;
            }

            this.contents.fontSize = 20;
            this.drawText(
                "Esc / X atau pilih kembali untuk keluar.",
                12,
                this.innerHeight - this.lineHeight(),
                this.innerWidth - 24,
                "left"
            );
        }
    }

    class Scene_LuminaTutorial extends Scene_MenuBase {
        create() {
            super.create();
            const top = 36;
            const height = Graphics.boxHeight - 72;
            const left = 24;
            const topicWidth = 244;
            const gap = 16;

            this._topicWindow = new Window_LuminaTutorialTopics(
                new Rectangle(left, top, topicWidth, height)
            );
            this._topicWindow.setHandler("cancel", this.popScene.bind(this));
            this._topicWindow.setHandler(
                "returnToTitle",
                this.popScene.bind(this)
            );
            for (let i = 0; i < tutorialPages.length; i++) {
                this._topicWindow.setHandler(
                    `topic${i}`,
                    this.onTopicSelected.bind(this, i)
                );
            }
            this.addWindow(this._topicWindow);

            const pageX = left + topicWidth + gap;
            const pageWidth = Graphics.boxWidth - pageX - left;
            this._pageWindow = new Window_LuminaTutorialPage(
                new Rectangle(pageX, top, pageWidth, height)
            );
            this._pageWindow.setPage(0);
            this.addWindow(this._pageWindow);
        }

        onTopicSelected(index) {
            this._pageWindow.setPage(index);
            this._topicWindow.activate();
        }
    }

    const _Scene_Title_createCommandWindow =
        Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _Scene_Title_createCommandWindow.call(this);
        this._commandWindow.setHandler(
            "tutorial",
            this.commandLuminaTutorial.bind(this)
        );
    };

    Scene_Title.prototype.commandLuminaTutorial = function() {
        this._commandWindow.deactivate();
        this._luminaMenuShouldReactivate = true;
        SceneManager.push(Scene_LuminaTutorial);
    };

    const _Scene_Title_commandOptions = Scene_Title.prototype.commandOptions;
    Scene_Title.prototype.commandOptions = function() {
        this._luminaMenuShouldReactivate = true;
        _Scene_Title_commandOptions.call(this);
    };

    const _Scene_Title_start = Scene_Title.prototype.start;
    Scene_Title.prototype.start = function() {
        _Scene_Title_start.call(this);
        if (this._luminaMenuShouldReactivate) {
            this._luminaMenuShouldReactivate = false;
            this._commandWindow.activate();
            this._commandWindow.open();
            if (this._picComE !== undefined) {
                this._picComE = false;
            }
        }
    };
})();
