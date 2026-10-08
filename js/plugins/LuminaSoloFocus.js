/*:
 * @target MZ
 * @plugindesc Keeps the selected protagonist as the only party member and simplifies name/equipment UI.
 * @author Lumina
 *
 * @help
 * Party members are restricted to the male or female protagonist selected
 * during the opening sequence. Name entry accepts direct keyboard typing.
 */

(() => {
    "use strict";

    const GENDER_SWITCH_ID = 1;
    const FEMALE_ACTOR_ID = 2;
    const MALE_ACTOR_ID = 1;

    function mainActorId() {
        // The opening event turns this switch on for the male choice.
        return $gameSwitches.value(GENDER_SWITCH_ID)
            ? MALE_ACTOR_ID
            : FEMALE_ACTOR_ID;
    }

    const _Game_Party_addActor = Game_Party.prototype.addActor;
    const _Game_Party_removeActor = Game_Party.prototype.removeActor;

    Game_Party.prototype.addActor = function(actorId) {
        if (DataManager.isBattleTest()) {
            _Game_Party_addActor.call(this, actorId);
            return;
        }
        const selectedActorId = mainActorId();
        for (const actor of this.allMembers()) {
            if (actor.actorId() !== selectedActorId) {
                _Game_Party_removeActor.call(this, actor.actorId());
            }
        }
        if (Number(actorId) === selectedActorId) {
            _Game_Party_addActor.call(this, selectedActorId);
        }
    };

    function enforceSoloParty() {
        const selectedActorId = mainActorId();
        for (const actor of $gameParty.allMembers()) {
            if (actor.actorId() !== selectedActorId) {
                _Game_Party_removeActor.call($gameParty, actor.actorId());
            }
        }
        if (!$gameParty.allMembers().some(actor => actor.actorId() === selectedActorId)) {
            _Game_Party_addActor.call($gameParty, selectedActorId);
        }
    }

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        enforceSoloParty();
    };

    Game_System.prototype.markLuminaBossCleared = function(mapId) {
        this._luminaClearedBossMaps = this._luminaClearedBossMaps || {};
        this._luminaClearedBossMaps[mapId || $gameMap.mapId()] = true;
    };

    Game_System.prototype.isLuminaBossCleared = function(mapId) {
        return Boolean(this._luminaClearedBossMaps && this._luminaClearedBossMaps[mapId]);
    };

    const DUNGEON_MAP_IDS = new Set([2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 16]);
    const PORTAL_SWITCH_ID = 12;
    const _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
    Game_Player.prototype.performTransfer = function() {
        if (
            this.isTransferring() &&
            this.newMapId() !== $gameMap.mapId() &&
            DUNGEON_MAP_IDS.has(this.newMapId())
        ) {
            $gameSwitches.setValue(3, false);
            $gameSwitches.setValue(
                PORTAL_SWITCH_ID,
                $gameSystem.isLuminaBossCleared(this.newMapId())
            );
        }
        _Game_Player_performTransfer.call(this);
    };

    Window_MenuCommand.prototype.addFormationCommand = function() {
    };

    const _Window_MenuCommand_needsCommand =
        Window_MenuCommand.prototype.needsCommand;
    Window_MenuCommand.prototype.needsCommand = function(name) {
        if (name === "skill") {
            return false;
        }
        return _Window_MenuCommand_needsCommand.call(this, name);
    };

    Scene_Equip.prototype.needsPageButtons = function() {
        return false;
    };

    Scene_Equip.prototype.statusWidth = function() {
        return Math.min(300, Math.floor(Graphics.boxWidth * 0.36));
    };

    const _Scene_Name_createInputWindow = Scene_Name.prototype.createInputWindow;
    Scene_Name.prototype.createInputWindow = function() {
        _Scene_Name_createInputWindow.call(this);
        this._inputWindow.deactivate();
        this._inputWindow.hide();
        this.createDirectNameInput();
    };

    Scene_Name.prototype.needsCancelButton = function() {
        return false;
    };

    Scene_Name.prototype.createDirectNameInput = function() {
        const container = document.createElement("div");
        const heading = document.createElement("div");
        const controls = document.createElement("div");
        const input = document.createElement("input");
        const saveButton = document.createElement("button");

        container.style.position = "fixed";
        container.style.zIndex = "1000";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "12px";
        container.style.boxSizing = "border-box";
        container.style.padding = "18px";
        container.style.border = "1px solid rgba(79, 214, 200, 0.8)";
        container.style.borderRadius = "12px";
        container.style.background = "rgba(16, 19, 26, 0.96)";
        container.style.color = "#ffffff";
        container.style.fontFamily = "GameFont, sans-serif";
        container.style.textAlign = "center";

        heading.textContent = "Ketik nama karakter";
        heading.style.fontSize = "24px";

        controls.style.display = "flex";
        controls.style.alignItems = "center";
        controls.style.gap = "10px";
        controls.style.width = "100%";

        input.type = "text";
        input.autocomplete = "off";
        input.spellcheck = false;
        input.maxLength = this._maxLength;
        input.placeholder = this._actor.name();
        input.setAttribute("aria-label", "Nama karakter");
        input.style.boxSizing = "border-box";
        input.style.flex = "1";
        input.style.minWidth = "0";
        input.style.height = "46px";
        input.style.padding = "0 14px";
        input.style.border = "2px solid #4fd6c8";
        input.style.borderRadius = "10px";
        input.style.background = "#10131a";
        input.style.color = "#ffffff";
        input.style.font = "22px GameFont, sans-serif";
        input.style.userSelect = "text";
        input.style.webkitUserSelect = "text";

        saveButton.type = "button";
        saveButton.textContent = "Simpan";
        saveButton.style.height = "46px";
        saveButton.style.padding = "0 15px";
        saveButton.style.border = "1px solid #4fd6c8";
        saveButton.style.borderRadius = "10px";
        saveButton.style.background = "#1b1f2a";
        saveButton.style.color = "#ffffff";
        saveButton.style.font = "18px GameFont, sans-serif";
        saveButton.style.cursor = "pointer";

        saveButton.addEventListener("click", this.saveDirectName.bind(this));
        input.addEventListener("input", () => {
            this._editWindow._name = input.value;
            this._editWindow._index = input.value.length;
            this._editWindow.refresh();
        });
        input.addEventListener("keydown", event => {
            event.stopPropagation();
            if (event.key === "Enter") {
                event.preventDefault();
                this.saveDirectName();
            }
        });
        input.addEventListener("keyup", event => event.stopPropagation());

        controls.append(input, saveButton);
        container.append(heading, controls);
        document.body.appendChild(container);
        this._directNameContainer = container;
        this._directNameInput = input;
        this.positionDirectNameInput();
        requestAnimationFrame(() => input.focus());
    };

    Scene_Name.prototype.positionDirectNameInput = function() {
        const canvas = Graphics._canvas;
        const container = this._directNameContainer;
        if (!canvas || !container || !this._inputWindow) {
            return;
        }
        const bounds = canvas.getBoundingClientRect();
        const scaleX = bounds.width / Graphics.boxWidth;
        const scaleY = bounds.height / Graphics.boxHeight;
        const window = this._inputWindow;
        const x = bounds.left + (window.x + 24) * scaleX;
        const y = bounds.top + (window.y + Math.floor(window.height * 0.43)) * scaleY;
        container.style.left = `${x}px`;
        container.style.top = `${y}px`;
        container.style.transform = `scale(${scaleX}, ${scaleY})`;
        container.style.transformOrigin = "top left";
        container.style.width = `${(window.width - 48)}px`;
    };

    const _Scene_Name_update = Scene_Name.prototype.update;
    Scene_Name.prototype.update = function() {
        _Scene_Name_update.call(this);
        this.positionDirectNameInput();
    };

    Scene_Name.prototype.saveDirectName = function() {
        const name = this._directNameInput.value;
        this._actor.setName(name || this._actor.name());
        this.popScene();
    };

    const _Scene_Name_terminate = Scene_Name.prototype.terminate;
    Scene_Name.prototype.terminate = function() {
        _Scene_Name_terminate.call(this);
        if (this._directNameContainer) {
            this._directNameContainer.remove();
            this._directNameContainer = null;
            this._directNameInput = null;
        }
    };
})();
