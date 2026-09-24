//=============================================================================
// MOG_SHud.js
//=============================================================================

/*:
 * @target MZ 
 * @plugindesc (v1.0) Apresenta uma Hud com a quantidade hp em cima do personagem.
 * @author Moghunter
 * @url https://mogplugins.com
 *
 * @param Initial Visible
 * @desc Ativar a Hud no inicio do jogo.
 * @default true 
 *
 * @param Hud X-Axis
 * @desc Definição da posição X-Axis da Hud.
 * @default 0
 *
 * @param Hud Y-Axis
 * @desc Definição da posição Y-Axis da Hud.
 * @default 0
 *
 * @param Meter X-Axis
 * @desc Definição da posição X-Axis do medidor.
 * @default 3
 *
 * @param Meter Y-Axis
 * @desc Definição da posição Y-Axis do medidor.
 * @default 2
 *   
 * @command visible_setup
 * @desc Ativar ou desativar a hud.
 * @text Show / Hide
 * 
 * @arg visible
 * @desc Ativar ou desativar a hud.
 * @text Visible
 * @default true
 * @type boolean 
 *   
 * @help  
 * =============================================================================
 * ♦♦♦ MOG S Hud ♦♦♦
 * Author   -   Moghunter
 * Version  -   1.0
 * Updated  -   2025/10/17
 * https://mogplugins.wordpress.com
 * =============================================================================
 * Apresenta uma Hud com a quantidade hp em cima do personagem.
 * Serão necessários os arquivos. (img/system/)
 *
 * SHUD_A.png
 * SHUD_B.png
 *        
 */

//=============================================================================
// ** PLUGIN PARAMETERS
//=============================================================================

//=============================================================================
// ** PLUGIN PARAMETERS
//=============================================================================
　　var Imported = Imported || {};
　　Imported.MOG_SHud = true;
　　var Moghunter = Moghunter || {}; 

  　Moghunter.parameters = PluginManager.parameters('MOG_SHud');
   
    // HUD POSITION
	Moghunter.shud_pos_x = Number(Moghunter.parameters['Hud X-Axis'] || 0);
	Moghunter.shud_pos_y = Number(Moghunter.parameters['Hud Y-Axis'] || 0);
	Moghunter.shud_meter_x = Number(Moghunter.parameters['Meter X-Axis'] || 3);
	Moghunter.shud_meter_y = Number(Moghunter.parameters['Meter Y-Axis'] || 2);
	Moghunter.shud_hudvisible = String(Moghunter.parameters['Initial Visible'] || "true");
	
  PluginManager.registerCommand('MOG_SHud', "visible_setup", data => {
   	     var visible = String(data.visible) == "true" ? true : false;
         $gameSystem._shud_visible = visible;
   });	
	
	
//=============================================================================
// ** Game_System
//=============================================================================

//==============================
// * Initialize
//==============================
var _alias_mog_shud_sys_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
	_alias_mog_shud_sys_initialize.call(this);
	this._shud_visible = String(Moghunter.shud_hudvisible) === "true" ? true : false;
};

//=============================================================================
// ** Game Character Base 
//=============================================================================

//==============================
// * Screen RealX
//==============================
Game_CharacterBase.prototype.screen_realX = function() {
    return this.scrolledX() * $gameMap.tileWidth()
};

//==============================
// * Screen RealY
//==============================
Game_CharacterBase.prototype.screen_realY = function() {
    return this.scrolledY() * $gameMap.tileHeight()
};


//=============================================================================
// ■■■ SpriteSet Base ■■■
//=============================================================================

//==============================
// ** create Hud Field
//==============================
Spriteset_Base.prototype.createHudField3 = function() {
	this._hudField3 = new Sprite();
	this._hudField3.z = 100;
	this.addChild(this._hudField3);
};

//==============================
// ** sort MZ
//==============================
Spriteset_Base.prototype.sortMz = function() {
	if (this._hudField1) {
        this._hudField1.children.sort((a, b) => a.z - b.z);
	};	
	if (this._hudField2) {
        this._hudField2.children.sort((a, b) => a.z - b.z);
	};	
	if (this._hudField3) {
        this._hudField3.children.sort((a, b) => a.z - b.z);
	};
};

//==============================
// ♦ ALIAS ♦  create Lower Layer
//==============================
var _mog_shud_sprtBase_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function() {
    _mog_shud_sprtBase_createLowerLayer.call(this);
   	if (!this.createHudField3) {this.createHudField3()};
	this.createShud();
	this.sortMz();
};

//==============================
// * Create S Hud
//==============================
Spriteset_Map.prototype.createShud = function() {
	this._s_hud = new S_Hud();
	this._s_hud.z = 7;
	this._hudField3.addChild(this._s_hud);
}; 

//=============================================================================
// ■■■ Scene Map ■■■ 
//=============================================================================

//==============================
// ♦ ALIAS ♦  snapForBattleBackground
//==============================
var _mog_sHud_scnMap_snapForBattleBackground = Scene_Map.prototype.snapForBattleBackground;
Scene_Map.prototype.snapForBattleBackground = function() {
	 if (this.isNeedHidSHud()) {this._spriteset._hudField3.visible = false};
	_mog_sHud_scnMap_snapForBattleBackground.call(this);
};
	
//==============================
// * isNeedHidSHud
//==============================
Scene_Map.prototype.isNeedHidSHud = function() {	
   if (!this._spriteset) {return false};
   if (!this._spriteset._hudField3) {return false};
   if (!SceneManager.isNextScene(Scene_Battle)) {return false};
   return true;
};

//=============================================================================
// ■■■ S_Hud
//=============================================================================
function S_Hud() {
    this.initialize.apply(this, arguments);
};

S_Hud.prototype = Object.create(Sprite.prototype);
S_Hud.prototype.constructor = S_Hud;

//==============================
// * Initialize
//==============================
S_Hud.prototype.initialize = function() {	
    Sprite.prototype.initialize.call(this);	
	this._hud_size = [-1,-1,-1,-1];
	this._old_hp = [-1,-1];
    this.load_img();
	this.opacity = 255;
};

//==============================
// * Battler
//==============================
S_Hud.prototype.battler = function() {
	return $gameParty.members()[0]
};

//==============================
// * Need Refresh HP
//==============================
S_Hud.prototype.needRefreshHP = function() {
    if (this._old_hp[0] != this.battler().hp) {return true};
	if (this._old_hp[1] != this.battler().mhp) {return true};
    return false
};

//==============================
// * Load Img
//==============================
S_Hud.prototype.load_img = function() {
	this._layout_img = ImageManager.loadSystem("Shud_A");
	this._meter_img = ImageManager.loadSystem("Shud_B");
};

//==============================
// * Create Layout
//==============================
S_Hud.prototype.create_layout = function() {
	this._layout = new Sprite(this._layout_img);
	this._layout.x = this._pos_x;
	this._layout.y = this._pos_y;
	this.addChild(this._layout);
};
	
//==============================
// * Refresh Data
//==============================
S_Hud.prototype.refresh_data = function() {
     this._hud_size[0] = 0;
	 this._pos_x = Moghunter.shud_pos_x - this._layout_img.width / 2;
	 this._pos_y = Moghunter.shud_pos_y - 60;
  	 this.create_layout();
     this.create_meter();	 
};

//==============================
// * Create Meter
//==============================
S_Hud.prototype.create_meter = function() {
     this._meter = new Sprite(this._meter_img);
	 this._meter.x = this._pos_x + Moghunter.shud_meter_x;
	 this._meter.y = this._pos_y + Moghunter.shud_meter_y;	
	 this.addChild(this._meter);
};

//==============================
// * refreshHP
//==============================
S_Hud.prototype.refreshHP = function() {	
     this._old_hp = [this.battler().hp,this.battler().mhp];
	 var rate = this._meter_img.width * this.battler().hp / this.battler().mhp;
     this._meter.setFrame(0,0,rate,this._meter_img.width,this._meter_img.height);
};

//==============================
// * Update Meter
//==============================
S_Hud.prototype.update_meter = function() {
	 if (this.needRefreshHP()) {this.refreshHP()};
};

//==============================
// * Update visible
//==============================
S_Hud.prototype.update_visible = function() {
	this.visible = $gameSystem._shud_visible;
	if (this.is_hud_visible()) {this.opacity += 10}	 
	else {this.opacity -= 10};
};

//==============================
// * Is Hud Visible
//==============================
S_Hud.prototype.is_hud_visible = function() {
	if ($gameMessage.isBusy()) {return false};
	if (!$gameSystem._shud_visible) {return false};
	return true;
};

//==============================
// * Update Position
//==============================
S_Hud.prototype.update_position = function() {
     this.x = $gamePlayer.screenX();
	 this.y = $gamePlayer.screenY();
};

//==============================
// * Update
//==============================
S_Hud.prototype.update = function() {	
    Sprite.prototype.update.call(this);	
	if (this._hud_size[0] === -1 && this._layout_img.isReady()) {this.refresh_data()};
	if (this._hud_size[0] === -1) {return};
	this.update_visible();
	if (!this.battler()) {return};
	this.update_position();
	this.update_meter();
};