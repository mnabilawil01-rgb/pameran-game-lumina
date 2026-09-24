//=============================================================================
// MOG_Compass.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc (v2.0) Penunjuk arah quest gaya modern (ala Genshin Impact / Honkai Star Rail).
 * @author Moghunter (modified by Claude)
 * @url https://mogplugins.com
 *
 * @param Quest Bar X-Axis
 * @desc Posisi X bar judul quest.
 * @default 16
 *
 * @param Quest Bar Y-Axis
 * @desc Posisi Y bar judul quest.
 * @default 16
 *
 * @param Font Size
 * @desc Ukuran font judul quest.
 * @default 20
 *
 * @param Edge Margin
 * @desc Jarak panah penunjuk dari tepi layar (px).
 * @default 64
 *
 * @param Arrow Size
 * @desc Ukuran panah penunjuk arah (px).
 * @default 44
 *
 * @param Marker Size
 * @desc Ukuran marker/pin yang muncul di atas tujuan saat kelihatan di layar (px).
 * @default 48
 *
 * @param On Screen Margin
 * @desc Jarak dari tepi layar buat nentuin tujuan dianggap "kelihatan" (px).
 * @default 48
 *
 * @param Distance Unit
 * @desc Satuan jarak yang ditampilkan.
 * @default m
 *
 * @command Setup
 * @desc Define a ID do evento de destino
 * @text Set a Destination
 *
 * @arg id
 * @desc Define a ID do evento de destino
 * @text Event ID
 * @default 1
 * @type number
 * @min 1 
 *
 * @arg event_name
 * @desc Define o texto do destino.
 * @text Quest Tittle
 * @default 
 * @type string
 *
 * @arg show_compass
 * @desc Apresentar o panah penunjuk arah (waktu tujuan di luar layar).
 * @text Direction Arrow (Visible)
 * @default true
 * @type boolean
 *
 * @arg show_quest
 * @desc Apresentar o texto da missão.
 * @text Quest Title (Visible)
 * @default true
 * @type boolean
 * 
 * @arg show_icon
 * @desc Apresentar marker di atas tujuan waktu kelihatan di layar.
 * @text Marker (Visible)
 * @default true
 * @type boolean
 * 
 * @arg show_steps
 * @desc Apresentar jarak (angka) di sebelah panah.
 * @text Distance (Visible)
 * @default true
 * @type boolean
 *
 * @arg ind_x
 * @desc Define a posição X do marker.
 * @text Marker X-Offset
 * @default 0
 * @type number
 *
 * @arg ind_y
 * @desc Define a posição Y do marker.
 * @text Marker Y-Offset
 * @default 0
 * @type number
 *  
 * @command remove
 * @desc Apresentar, ocultar ou remover.
 * @text Show/Hide/Remove
 *
 * @arg show_hide
 * @desc Apresentar, ocultar ou remover.
 * @text Show/Hide/Remove 
 * @default Hide
 * @type select
 * @option Remove
 * @value Remove
 * @option Show
 * @value Show
 * @option Hide
 * @value Hide
 * 
 *
 * @help  
 * =============================================================================
 * ♦♦♦ MOG - Compass / Quest Direction (v2.0) ♦♦♦
 * Original   -   Moghunter
 * Modified   -   Claude
 * =============================================================================
 * Nunjukkin arah ke tujuan quest gaya modern kayak Genshin Impact / Honkai
 * Star Rail:
 *
 *  - Kalau tujuan ada DI LUAR layar -> muncul panah kecil menyala di TEPI
 *    layar yang nunjuk ke arah tujuan, plus angka jarak di sebelahnya.
 *  - Kalau tujuan ada DI DALAM layar -> panah ilang, ganti marker/pin yang
 *    ngambang & berdenyut di atas kepala tujuannya.
 *  - Ada bar judul quest kecil di pojok kiri atas.
 *
 * Semua digambar otomatis lewat kode (nggak butuh gambar Compass_A/B/C/D/E.png
 * lagi kayak versi sebelumnya). Plugin command (Setup / remove) sama persis
 * kayak versi lama, jadi event yang udah ada nggak perlu diubah.
 * =============================================================================
 */

//=============================================================================
// ** PLUGIN PARAMETERS
//=============================================================================
var Imported = Imported || {};
Imported.MOG_Compass = true;
var Moghunter = Moghunter || {};

Moghunter.parameters = PluginManager.parameters('MOG_Compass');
Moghunter.compass_bar_x = Number(Moghunter.parameters['Quest Bar X-Axis'] || 16);
Moghunter.compass_bar_y = Number(Moghunter.parameters['Quest Bar Y-Axis'] || 16);
Moghunter.compass_font_size = Number(Moghunter.parameters['Font Size'] || 20);
Moghunter.compass_edge_margin = Number(Moghunter.parameters['Edge Margin'] || 64);
Moghunter.compass_arrow_size = Number(Moghunter.parameters['Arrow Size'] || 44);
Moghunter.compass_marker_size = Number(Moghunter.parameters['Marker Size'] || 48);
Moghunter.compass_onscreen_margin = Number(Moghunter.parameters['On Screen Margin'] || 48);
Moghunter.compass_distance_unit = String(Moghunter.parameters['Distance Unit'] || "m");

PluginManager.registerCommand('MOG_Compass', "Setup", data => {
    var eventID = Number(data.id);
    var text = String(data.event_name);
    var showIcon = data.show_icon;
    var ix = Number(data.ind_x);
    var iy = Number(data.ind_y);
    var showquest = String(data.show_quest);
    var showcompass = String(data.show_compass);
    var showsteps = String(data.show_steps);
    $gameMap.setCompassDestination(eventID, text, showIcon, ix, iy, showquest, showcompass, showsteps);
});

PluginManager.registerCommand('MOG_Compass', "remove", data => {
    $gameMap.setCompassRemove(data.show_hide);
});

//=============================================================================
// ** Game System
//=============================================================================
var _alias_mog_compass_gsys_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    _alias_mog_compass_gsys_initialize.call(this);
    this._compass_event_id = 0;
    this._compass_visible = true;
    this._compass_arrow_visible = true;
    this._compass_name = "";
    this._questTittle = { text: "", visible: true };
    this._compass_marker = { visible: true, event: null, x2: 0, y2: 0 };
    this._compass_steps_visible = true;
};

//=============================================================================
// ** Game Map
//=============================================================================
Game_Map.prototype.compass_destination = function() {
    return this._events[$gameSystem._compass_event_id];
};

Game_Map.prototype.setCompassDestination = function(event_id, text, indicator, ix, iy, showquest, showcompass, showsteps) {
    var vis = false;
    this.events().forEach(function(event) {
        if (event.eventId() === (event_id)) {
            event._compass_destination = true;
            $gameSystem._compass_marker.event = event;
            vis = true;
        } else {
            event._compass_destination = false;
        }
    }, this);
    $gameSystem._compass_visible = vis;
    $gameSystem._compass_event_id = event_id;
    $gameSystem._compass_name = String(text);
    $gameSystem._compass_marker.visible = String(indicator) === "true" ? true : false;
    $gameSystem._compass_marker.x2 = ix;
    $gameSystem._compass_marker.y2 = iy;
    $gameSystem._questTittle.visible = String(showquest) === "true" ? true : false;
    $gameSystem._compass_arrow_visible = String(showcompass) === "true" ? true : false;
    $gameSystem._compass_steps_visible = String(showsteps) === "true" ? true : false;
};

Game_Map.prototype.setCompassRemove = function(data) {
    var opt = String(data);
    if (opt == "Show") {
        $gameSystem._compass_visible = true;
    } else if (opt == "Hide") {
        $gameSystem._compass_visible = false;
    } else {
        this.clearCompass();
    }
};

Game_Map.prototype.clearCompass = function() {
    this.events().forEach(function(event) {
        event._compass_destination = false;
    }, this);
    $gameSystem._compass_marker.event = null;
    $gameSystem._compass_event_id = 0;
    $gameSystem._compass_visible = false;
    $gameSystem._compass_name = "";
};

//=============================================================================
// ** Game Event
//=============================================================================
var _alias_mog_gevent_initMembers = Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function() {
    _alias_mog_gevent_initMembers.call(this);
    this._compass_destination = false;
};

//=============================================================================
// ** Game Character Base
//=============================================================================
Game_CharacterBase.prototype.screenYC = function() {
    var th = $gameMap.tileHeight();
    return Math.round(this.scrolledY() * th + th - this.jumpHeight());
};

//=============================================================================
// ** Scene Base
//=============================================================================
Scene_Base.prototype.createHudField = function() {
    this._hudField = new Sprite();
    this._hudField.z = 10;
    this.addChild(this._hudField);
};

Scene_Base.prototype.sortMz = function() {
    this._hudField.children.sort(function(a, b) { return a.mz - b.mz; });
};

//=============================================================================
// ** Scene Map
//=============================================================================
var _mog_compass_sMap_createSpriteset = Scene_Map.prototype.createSpriteset;
Scene_Map.prototype.createSpriteset = function() {
    _mog_compass_sMap_createSpriteset.call(this);
    if (!this._hudField) { this.createHudField(); }
    this.createCompass();
    this.sortMz();
};

Scene_Map.prototype.createCompass = function() {
    this._compassHud = new QuestDirectionHud();
    this._compassHud.mz = 120;
    this._hudField.addChild(this._compassHud);
};

//=============================================================================
// ** Helpers
//=============================================================================
function approachOpacity(sprite, target, speed) {
    if (!sprite) return;
    speed = speed || 24;
    if (sprite.opacity < target) {
        sprite.opacity = Math.min(target, sprite.opacity + speed);
    } else if (sprite.opacity > target) {
        sprite.opacity = Math.max(target, sprite.opacity - speed);
    }
}

function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

//=============================================================================
// * QuestDirectionHud
//=============================================================================
function QuestDirectionHud() {
    this.initialize.apply(this, arguments);
}

QuestDirectionHud.prototype = Object.create(Sprite.prototype);
QuestDirectionHud.prototype.constructor = QuestDirectionHud;

QuestDirectionHud.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    this._questText = null;
    this._lastDist = null;
    this._bouncePhase = 0;
    this._ringPhase = 0;
    this.createQuestBar();
    this.createArrow();
    this.createDistanceText();
    this.createMarker();
};

//==============================
// * Quest Bar
//==============================
QuestDirectionHud.prototype.createQuestBar = function() {
    var w = 340;
    var h = 46;
    this._questBar = new Sprite(new Bitmap(w, h));
    this._questBar.x = Moghunter.compass_bar_x;
    this._questBar.y = Moghunter.compass_bar_y;
    this._questBar.opacity = 0;
    this.addChild(this._questBar);
};

QuestDirectionHud.prototype.redrawQuestBar = function(text) {
    var bmp = this._questBar.bitmap;
    var w = bmp.width;
    var h = bmp.height;
    var ctx = bmp.context;
    bmp.clear();
    ctx.save();
    roundRectPath(ctx, 0, 0, w, h, 14);
    var grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, "rgba(12,10,8,0.82)");
    grad.addColorStop(1, "rgba(12,10,8,0.35)");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // accent bar kiri
    ctx.save();
    roundRectPath(ctx, 0, 0, 6, h, 3);
    var accent = ctx.createLinearGradient(0, 0, 0, h);
    accent.addColorStop(0, "#ffe27a");
    accent.addColorStop(1, "#c98f26");
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.restore();

    // ikon pin kecil
    var px = 26, py = h / 2;
    ctx.save();
    ctx.fillStyle = "#ffdc7a";
    ctx.beginPath();
    ctx.arc(px, py - 3, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px - 6, py - 1);
    ctx.lineTo(px + 6, py - 1);
    ctx.lineTo(px, py + 9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    bmp.fontFace = $gameSystem.mainFontFace();
    bmp.fontSize = Moghunter.compass_font_size;
    bmp.fontBold = true;
    bmp.textColor = "#f3ead0";
    bmp.outlineColor = "rgba(0,0,0,0.7)";
    bmp.outlineWidth = 4;
    bmp.drawText(String(text), 44, 0, w - 56, h, "left");
};

//==============================
// * Arrow (off-screen)
//==============================
QuestDirectionHud.prototype.createArrow = function() {
    var s = Moghunter.compass_arrow_size;
    this._arrow = new Sprite(new Bitmap(s * 1.6, s * 1.6));
    this._arrow.anchor.x = 0.5;
    this._arrow.anchor.y = 0.5;
    this._arrow.opacity = 0;
    this.drawArrowShape(this._arrow.bitmap, s);
    this.addChild(this._arrow);
};

QuestDirectionHud.prototype.drawArrowShape = function(bmp, s) {
    var ctx = bmp.context;
    var cx = bmp.width / 2;
    var cy = bmp.height / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.shadowColor = "rgba(255,214,110,0.85)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(s * 0.5, 0);
    ctx.lineTo(-s * 0.32, -s * 0.36);
    ctx.quadraticCurveTo(-s * 0.18, 0, -s * 0.32, s * 0.36);
    ctx.closePath();
    var grad = ctx.createLinearGradient(-s * 0.3, 0, s * 0.5, 0);
    grad.addColorStop(0, "#c98f26");
    grad.addColorStop(1, "#ffe98a");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(60,38,6,0.9)";
    ctx.stroke();
    ctx.restore();
};

//==============================
// * Distance Text
//==============================
QuestDirectionHud.prototype.createDistanceText = function() {
    this._distanceText = new Sprite(new Bitmap(90, 26));
    this._distanceText.anchor.x = 0.5;
    this._distanceText.anchor.y = 0.5;
    this._distanceText.opacity = 0;
    this.addChild(this._distanceText);
};

QuestDirectionHud.prototype.redrawDistanceText = function(dist) {
    var bmp = this._distanceText.bitmap;
    bmp.clear();
    bmp.fontFace = $gameSystem.mainFontFace();
    bmp.fontSize = 18;
    bmp.fontBold = true;
    bmp.textColor = "#fff3d6";
    bmp.outlineColor = "rgba(0,0,0,0.8)";
    bmp.outlineWidth = 4;
    bmp.drawText(dist + Moghunter.compass_distance_unit, 0, 0, bmp.width, bmp.height, "center");
};

//==============================
// * Marker (on-screen)
//==============================
QuestDirectionHud.prototype.createMarker = function() {
    var s = Moghunter.compass_marker_size;
    this._markerRing = new Sprite(new Bitmap(s, s * 0.5));
    this._markerRing.anchor.x = 0.5;
    this._markerRing.anchor.y = 0.5;
    this._markerRing.opacity = 0;
    this.drawRingShape(this._markerRing.bitmap);
    this.addChild(this._markerRing);

    this._marker = new Sprite(new Bitmap(s, s));
    this._marker.anchor.x = 0.5;
    this._marker.anchor.y = 1.0;
    this._marker.opacity = 0;
    this.drawPinShape(this._marker.bitmap, s);
    this.addChild(this._marker);
};

QuestDirectionHud.prototype.drawRingShape = function(bmp) {
    var ctx = bmp.context;
    var w = bmp.width, h = bmp.height;
    ctx.save();
    ctx.strokeStyle = "rgba(255,224,140,0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2 - 3, h / 2 - 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
};

QuestDirectionHud.prototype.drawPinShape = function(bmp, s) {
    var ctx = bmp.context;
    var cx = s / 2;
    var topR = s * 0.3;
    var cy = topR + 2;
    ctx.save();
    ctx.shadowColor = "rgba(255,214,110,0.9)";
    ctx.shadowBlur = 8;
    // corpo gota
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.16, s * 0.62);
    ctx.lineTo(cx + s * 0.16, s * 0.62);
    ctx.lineTo(cx, s);
    ctx.closePath();
    var grad2 = ctx.createLinearGradient(0, 0, 0, s);
    grad2.addColorStop(0, "#ffe98a");
    grad2.addColorStop(1, "#c98f26");
    ctx.fillStyle = grad2;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, topR, 0, Math.PI * 2);
    ctx.fillStyle = grad2;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(60,38,6,0.9)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, topR * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(60,38,6,0.85)";
    ctx.fill();
    ctx.restore();
};

//==============================
// * Conditions
//==============================
QuestDirectionHud.prototype.hasDestination = function() {
    var ev = $gameMap.compass_destination();
    if (!ev) return false;
    if (ev._erased) return false;
    if (!$gameSystem._compass_visible) return false;
    if (SceneManager.isSceneChanging()) return false;
    if ($gameMessage.isBusy()) return false;
    return true;
};

//==============================
// * Update
//==============================
QuestDirectionHud.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updateQuestBar();
    this.updateDirection();
};

QuestDirectionHud.prototype.updateQuestBar = function() {
    var active = this.hasDestination() && $gameSystem._questTittle.visible;
    if ($gameSystem._compass_name !== this._questText) {
        this._questText = $gameSystem._compass_name;
        this.redrawQuestBar(this._questText);
    }
    approachOpacity(this._questBar, active ? 255 : 0, 18);
};

QuestDirectionHud.prototype.updateDirection = function() {
    var show = this.hasDestination();
    if (!show) {
        approachOpacity(this._arrow, 0, 24);
        approachOpacity(this._distanceText, 0, 24);
        approachOpacity(this._marker, 0, 24);
        approachOpacity(this._markerRing, 0, 24);
        return;
    }

    var ev = $gameMap.compass_destination();
    var px = $gamePlayer.screenX();
    var py = $gamePlayer.screenYC();
    var tx = ev.screenX();
    var ty = ev.screenYC();
    var dx = tx - px;
    var dy = ty - py;
    var dist = Math.round(Math.sqrt(dx * dx + dy * dy) / $gameMap.tileWidth());

    var margin = Moghunter.compass_onscreen_margin;
    var onScreen =
        tx > margin && tx < Graphics.boxWidth - margin &&
        ty > margin && ty < Graphics.boxHeight - margin;

    var wantMarker = onScreen && $gameSystem._compass_marker.visible;
    var wantArrow = !onScreen && $gameSystem._compass_arrow_visible;
    var wantDist = wantArrow && $gameSystem._compass_steps_visible;

    approachOpacity(this._marker, wantMarker ? 255 : 0, 24);
    approachOpacity(this._arrow, wantArrow ? 255 : 0, 24);
    approachOpacity(this._distanceText, wantDist ? 255 : 0, 24);

    if (this._marker.opacity > 0) {
        this.updateMarkerPosition(ev);
    }
    if (this._arrow.opacity > 0) {
        this.updateArrowPosition(dx, dy, dist);
    } else {
        this._markerRing.opacity = Math.min(this._markerRing.opacity, this._marker.opacity);
    }
};

QuestDirectionHud.prototype.updateMarkerPosition = function(ev) {
    var xoff = $gameSystem._compass_marker.x2;
    var yoff = $gameSystem._compass_marker.y2;

    this._bouncePhase += 0.08;
    var bounce = (Math.sin(this._bouncePhase) + 1) * 5; // 0..10

    var baseX = ev.screenX() + xoff;
    var groundY = ev.screenYC() + yoff;

    this._marker.x = baseX;
    this._marker.y = groundY - 26 - bounce;

    this._ringPhase += 0.025;
    if (this._ringPhase > 1) this._ringPhase = 0;
    var scale = 0.5 + this._ringPhase * 0.9;
    this._markerRing.x = baseX;
    this._markerRing.y = groundY;
    this._markerRing.scale.x = this._markerRing.scale.y = scale;
    this._markerRing.opacity = Math.round((1 - this._ringPhase) * this._marker.opacity);
};

QuestDirectionHud.prototype.updateArrowPosition = function(dx, dy, dist) {
    var angle = Math.atan2(dy, dx);
    var cx = Graphics.boxWidth / 2;
    var cy = Graphics.boxHeight / 2;
    var hw = Graphics.boxWidth / 2 - Moghunter.compass_edge_margin;
    var hh = Graphics.boxHeight / 2 - Moghunter.compass_edge_margin;
    var adx = Math.cos(angle);
    var ady = Math.sin(angle);
    var t = Infinity;
    if (Math.abs(adx) > 0.0001) t = Math.min(t, hw / Math.abs(adx));
    if (Math.abs(ady) > 0.0001) t = Math.min(t, hh / Math.abs(ady));

    var ax = cx + adx * t;
    var ay = cy + ady * t;
    this._arrow.x = ax;
    this._arrow.y = ay;
    this._arrow.rotation = angle;

    var tin = Math.max(0, t - 34);
    this._distanceText.x = cx + adx * tin;
    this._distanceText.y = cy + ady * tin;

    if (this._lastDist !== dist) {
        this._lastDist = dist;
        this.redrawDistanceText(dist);
    }
};
