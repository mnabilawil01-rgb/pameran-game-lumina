//=============================================================================
// MOG_Compass.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc (v1.0) Adiciona uma bússola indicando o destino a ser seguido.
 * @author Moghunter
 * @url https://mogplugins.com
 *
 * @param Smart Fade
 * @desc Ativa transparência na hud quando a hud estiver acima do personagem.
 * @default true
 *
 * @param Compass X-Axis
 * @desc Definição da posição X-axis do compasso.
 * @default 5
 *
 * @param Compass Y-Axis
 * @desc Definição da posição Y-axis da imagem.
 * @default 5
 *
 * @param Arrow X-Axis
 * @desc Definição da posição X-axis do compasso.
 * @default 80
 *
 * @param Arrow Y-Axis
 * @desc Definição da posição Y-axis da imagem.
 * @default 79
 *
 * @param Font Size
 * @desc Definição do tamanho da fonte.
 * @default 18
 *
 * @param Quest Text X-Axis
 * @desc Definição da posição X-axis.
 * @default 185
 *
 * @param Quest Text Y-Axis
 * @desc Definição da posição Y-axis.
 * @default 10
 *
 * @param Quest Layout X-Axis
 * @desc Definição da posição X-axis.
 * @default -10
 *
 * @param Quest Layout Y-Axis
 * @desc Definição da posição Y-axis.
 * @default 0
 * 
 * @param Steps X-Axis
 * @desc Definição da posição X-axis.
 * @default 80
 *
 * @param Steps Y-Axis
 * @desc Definição da posição Y-axis.
 * @default 70
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
 * @desc Apresentar o compasso.
 * @text Compass (Visible)
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
 * @desc Apresentar um ícone indicando o destino.
 * @text Indicator (Visible)
 * @default false
 * @type boolean
 * 
 * @arg show_steps
 * @desc Apresentar o número de passos.
 * @text Step Number (Visible)
 * @default true
 * @type boolean
 *
 * @arg ind_x
 * @desc Define a posição X do indicador.
 * @text Indicator X-Offset
 * @default 0
 * @type number
 *
 * @arg ind_y
 * @desc Define a posição Y do indicador.
 * @text Indicator Y-Offset
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
 * ♦♦♦ MOG - Compass (v1.0) ♦♦♦
 * Author   -   Moghunter
 * Version  -   1.0
 * Updated  -   2025/10/14
 * https://mogplugins.wordpress.com
 * =============================================================================
 * Adiciona uma bússola indicando o destino a ser seguido.
 * É necessário ter as seguintes imagens gravadas na pasta /img/system/
 *
 * Compass_A.png
 * Compass_B.png
 * Compass_C.png
 *
 * =============================================================================
 */

//=============================================================================
// ** PLUGIN PARAMETERS
//=============================================================================
　　var Imported = Imported || {};
　　Imported.MOG_Compass = true;
　　var Moghunter = Moghunter || {}; 

  　 Moghunter.parameters = PluginManager.parameters('MOG_Compass');
	Moghunter.compass_x = Number(Moghunter.parameters['Compass X-Axis'] || 5);
    Moghunter.compass_y = Number(Moghunter.parameters['Compass Y-Axis'] || 5);
	Moghunter.compass_arrow_x = Number(Moghunter.parameters['Arrow X-Axis'] || 80);
    Moghunter.compass_arrow_y = Number(Moghunter.parameters['Arrow Y-Axis'] || 79);
	Moghunter.compass_name_x = Number(Moghunter.parameters['Quest Text X-Axis'] || 185);
    Moghunter.compass_name_y = Number(Moghunter.parameters['Quest Text Y-Axis'] || 10);
	Moghunter.compass_questLay_x = Number(Moghunter.parameters['Quest Layout X-Axis'] || -10);
    Moghunter.compass_questLay_y = Number(Moghunter.parameters['Quest Layout Y-Axis'] || 0);	
	Moghunter.compass_font_size = Number(Moghunter.parameters['Font Size'] || 18);
	Moghunter.compass_steps_visible = String(Moghunter.parameters['Steps Visible'] || "true");
	Moghunter.compass_steps_x = Number(Moghunter.parameters['Steps X-Axis'] || 80);
    Moghunter.compass_steps_y = Number(Moghunter.parameters['Steps Y-Axis'] || 70);
    Moghunter.compass_smartFade = String(Moghunter.parameters['Smart Fade'] || "true");	
	
  PluginManager.registerCommand('MOG_Compass', "Setup", data => {
		  var eventID = Number(data.id);
		  var text = String(data.event_name)
		  var showIcon = data.show_icon		  
		  var ix = Number(data.ind_x)
		  var iy = Number(data.ind_y)
		  var showquest = String(data.show_quest)
		  var showcompass = String(data.show_compass)
		  var showsteps = String(data.show_steps)
		  $gameMap.setCompassDestination(eventID,text,showIcon,ix,iy,showquest,showcompass,showsteps);	
   });
   
    PluginManager.registerCommand('MOG_Compass', "remove", data => {
		  $gameMap.setCompassRemove(data.show_hide);	
   });	
	
//=============================================================================
// ** Game System
//=============================================================================

//==============================
// * Initialize
//==============================
var _alias_mog_compass_gsys_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
	_alias_mog_compass_gsys_initialize.call(this);
	this._compass_event_id = 0;
	this._compass_visible = true;
	this._compass_visible2 = true;
	this._compass_visible3 = true;
	this._compass_name = ""
	this._questTittle = {};
	this._questTittle.text = ""
	this._questTittle.visible = true;
	this._compass_indicator = {};
	this._compass_indicator._visible = true;
	this._compass_indicator.event = null;
	this._compass_indicator.x2 = 0;
	this._compass_indicator.y2 = 0;
	this._compass_ahud_smartFade = String(Moghunter.compass_smartFade) === "true" ? true : false;
};

//=============================================================================
// ** Game Map
//=============================================================================

//==============================
// * Compass Destination
//==============================
Game_Map.prototype.compass_destination = function() {
	 return this._events[$gameSystem._compass_event_id];
};

//==============================
// * Set Compass Destination
//==============================
Game_Map.prototype.setCompassDestination = function(event_id,text,indicator,ix,iy,showquest,showcompass,showsteps) {
	var vis = false
	this.events().forEach(function(event) {
        if (event.eventId() === (event_id)) {
			event._compass_destination = true
		    $gameSystem._compass_indicator.event = event;
			vis = true
		} else {
			event._compass_destination = false
		};
    }, this);
	$gameSystem._compass_visible = vis;
	$gameSystem._compass_event_id = event_id;
	$gameSystem._compass_name = String(text)
	$gameSystem._compass_indicator._visible = String(indicator) === "true" ? true : false;
	$gameSystem._compass_indicator.x2 = ix;
    $gameSystem._compass_indicator.y2 = iy;
	$gameSystem._questTittle.visible = String(showquest) === "true" ? true : false;
	$gameSystem._compass_visible2 = String(showcompass) === "true" ? true : false; 
	$gameSystem._compass_visible3 = String(showsteps) === "true" ? true : false; 
};

//==============================
// * Remove
//==============================
Game_Map.prototype.setCompassRemove = function(data) {
	var opt = String(data)
	if (opt == "Show") {
		$gameSystem._compass_visible = true;
	} else if (opt == "Hide") {
	    $gameSystem._compass_visible = false;
    } else {
       this.clearCompass();
	};
}; 

//==============================
// * Clear Compass
//==============================
Game_Map.prototype.clearCompass = function(data) {
	this.events().forEach(function(event) {
  		event._compass_destination = false
    }, this);		
	$gameSystem._compass_indicator.event = null
	$gameSystem._compass_event_id = 0;
	$gameSystem.compass_visible = false;
	$gameSystem._compass_name = ""
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

//==============================
// * screen YC
//==============================
Game_CharacterBase.prototype.screenYC = function() {
    var th = $gameMap.tileHeight();
    return Math.round(this.scrolledY() * th + th - this.jumpHeight());
};

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
// ** Scene Base
//=============================================================================

//==============================
// ** create Hud Field
//==============================
Scene_Base.prototype.createHudField = function() {
	this._hudField = new Sprite();
	this._hudField.z = 10;
	this.addChild(this._hudField);
};

//==============================
// ** sort MZ
//==============================
Scene_Base.prototype.sortMz = function() {
   this._hudField.children.sort(function(a, b){return a.mz-b.mz});
};

//=============================================================================
// ** Scene Map
//=============================================================================

//==============================
// ** create Spriteset
//==============================
var _mog_compass_sMap_createSpriteset = Scene_Map.prototype.createSpriteset;
Scene_Map.prototype.createSpriteset = function() {
	_mog_compass_sMap_createSpriteset.call(this);
	if (!this._hudField) {this.createHudField()};
	this.createCompass();
	this.sortMz();
};

//==============================
// ** create Compass
//==============================
Scene_Map.prototype.createCompass = function() {
    this._compassHud = new CompassHud();
	this._compassHud.mz = 120;
	this._hudField.addChild(this._compassHud);
};

//=============================================================================
// * Hit Counter Sprites
//=============================================================================
function CompassHud() {
    this.initialize.apply(this, arguments);
};

CompassHud.prototype = Object.create(Sprite.prototype);
CompassHud.prototype.constructor = CompassHud;

//==============================
// * Initialize
//==============================
CompassHud.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);	
    this.setup();
	this.createSprites()	
};

//==============================
// * Setup
//==============================
CompassHud.prototype.setup = function() {
 	$gameSystem._compass_event_id = 0;
	this._sprite_compass_ref = 10;
	this._sprite_compass_size = [-1,-1,-1,-1];   
	this._event = $gameSystem._compass_indicator.event;
	this._stepNumber = [-1,0];
};

//==============================
// * create Sprites
//==============================
CompassHud.prototype.createSprites = function() {
	this._spriteLoaded = false;
    this.createLayout();
	this.createPointer();
	this.createQuestLayout();
	this.createDestinationName();
	this.createStepCounter();
	this.createIndicator()
	this.check_destination_events();
	this.refresh_compass()
};

//==============================
// * create Layout
//==============================
CompassHud.prototype.createLayout = function() {
    this._sprite_compass_layout = new Sprite(ImageManager.loadSystem("Compass_A"));
	this._sprite_compass_layout.x = Moghunter.compass_x;
	this._sprite_compass_layout.y = Moghunter.compass_y;
	this._sprite_compass_layout.opacity = 0;
	this.addChild(this._sprite_compass_layout);  
};

//==============================
// * create Quest Layout
//==============================
CompassHud.prototype.createQuestLayout = function() {
    this._sprite_Questlayout = new Sprite(ImageManager.loadSystem("Compass_E"));
	this._sprite_Questlayout.opacity = 0;
	this.addChild(this._sprite_Questlayout);  
};

//==============================
// * create Pointer
//==============================
CompassHud.prototype.createPointer = function() {
    this._sprite_compass = new Sprite(ImageManager.loadSystem("Compass_B"));
	this._sprite_compass.anchor.x = 0.5;
	this._sprite_compass.anchor.y = 0.5;
	this._sprite_compass.x = Moghunter.compass_x + Moghunter.compass_arrow_x;
	this._sprite_compass.y = Moghunter.compass_y + Moghunter.compass_arrow_y;
	this._sprite_compass.opacity = 0;
	this.addChild(this._sprite_compass);
};

//==============================
// * create Destination Name
//==============================
CompassHud.prototype.createDestinationName = function() {
	this._sprite_compass_name = new Sprite(new Bitmap(160,32));
	this._sprite_compass_name.x = Moghunter.compass_x + Moghunter.compass_name_x + 60;
	this._sprite_compass_name.y = Moghunter.compass_y + Moghunter.compass_name_y + 16; 
	this._sprite_Questlayout.x = this._sprite_compass_name.x + Moghunter.compass_questLay_x;
	this._sprite_Questlayout.y = this._sprite_compass_name.y + Moghunter.compass_questLay_y;
	this._sprite_compass_name.anchor.x = 0.5;
	this._sprite_compass_name.anchor.y = 0.5;
	this._sprite_compass_name.bitmap.fontSize = Number(Moghunter.compass_font_size);
	this._sprite_compass_name.opacity = 0;
	this._sprite_compass_name.visible = $gameSystem._questTittle.visible;
	this._sprite_Questlayout.visible = this._sprite_compass_name.visible;
	this.addChild(this._sprite_compass_name);
};

//==============================
// * create Indicator
//==============================
CompassHud.prototype.createIndicator = function() {
    this._sprite_compass_indicator = new Sprite(ImageManager.loadSystem("Compass_D"));
	this._sprite_compass_indicator.anchor.x = 0.5;
	this._sprite_compass_indicator.anchor.y = 0.5;
	this._sprite_compass_indicator.opacity = 0;
	this._sprite_compass_indicator.visible = false;
    this._indPos = {}
	this._indPos.height = 0
	this._indPos.slideY = 0
	this._indPos.phase = 0;
	this._indPos.xoff = $gameSystem._compass_indicator.x2
	this._indPos.yoff = $gameSystem._compass_indicator.y2
	this.addChild(this._sprite_compass_indicator);  
};

//==============================
// * create Indicator
//==============================
CompassHud.prototype.posX = function() {
	return this._event.screenX() + this._indPos.xoff ;
};

//==============================
// * Pos Y
//==============================
CompassHud.prototype.posY = function() {
	return this._event.screenY() - 12 - this._indPos.height - this._indPos.slideY + this._indPos.yoff;
};

//==============================
// * updateIndSlide
//==============================
CompassHud.prototype.updateIndSlide = function() {
   if (this._indPos.phase == 0) {
	   this._indPos.slideY += 0.7
	   if (this._indPos.slideY >= 20) {
		   this._indPos.slideY = 20
		   this._indPos.phase = 1
	   }	   
   } else {
	   this._indPos.slideY -= 0.7
	   if (this._indPos.slideY <= 0) {
		   this._indPos.slideY = 0
		   this._indPos.phase = 0
	   }		   
   };
};

//==============================
// * Update Indicator
//==============================
CompassHud.prototype.updateIndicator = function() {
	 this.updateIndSlide();
	 this._sprite_compass_indicator.x = this.posX();
	 this._sprite_compass_indicator.y = this.posY();
};

//==============================
// * refreshIndPosition
//==============================
CompassHud.prototype.refreshIndPosition = function() {
	 this._spriteLoaded = true;
	 this._sprite_compass_indicator.visible = $gameSystem._compass_indicator._visible;
   	 this._indPos.xoff = $gameSystem._compass_indicator.x2
	 this._indPos.yoff = -$gameSystem._compass_indicator.y2	 
     this._indPos.height = this._sprite_compass_indicator.height;	
	 this._sprite_Questlayout.x -= this._sprite_Questlayout.width / 2
	 this._sprite_Questlayout.y -= this._sprite_Questlayout.height / 2;
     this.refreshVisible();
};

//==============================
// * refresh Visible
//==============================
CompassHud.prototype.refreshVisible = function() {
	 this._sprite_compass_name.visible = $gameSystem._questTittle.visible;
	 this._sprite_Questlayout.visible = this._sprite_compass_name.visible;	 
	 this._sprite_compass.visible = $gameSystem._compass_visible2
	 this._sprite_compass_layout.visible = $gameSystem._compass_visible2;
};

//==============================
// * create Step Counter
//==============================
CompassHud.prototype.createStepCounter = function() {
	this._sprite_compass_number = [];
	this._cpd_steps = [0,0];
	for (var i = 0; i < 4; i++) {
		this._sprite_compass_number[i] = new Sprite(ImageManager.loadSystem("Compass_C"));
		this._sprite_compass_number[i].x = Moghunter.compass_x + Moghunter.compass_steps_x;
		this._sprite_compass_number[i].y = Moghunter.compass_y + Moghunter.compass_steps_y;
		this._sprite_compass_number[i].visible = false;
		this._sprite_compass_number[i].opacity = 0;
		this._sprite_compass_number[i].compassloaded = false;
		this.addChild(this._sprite_compass_number[i]);
	}; 
};

//==============================
// * Refresh Steps Number
//==============================	
CompassHud.prototype.refresh_steps_number = function(value) {
	this._stepNumber[0] = value;
	if (this._cpd_steps[0] === 0) {return;};
	if (value > 9999) {value = 9999};
	numbers = Math.abs(value).toString().split("");  
	for (var i = 0; i < this._sprite_compass_number.length; i++) {
		 this._sprite_compass_number[i].visible = false;
		 if (i > numbers.length) {return};
		 var n = Number(numbers[i]);
		 this._sprite_compass_number[i].setFrame(n * this._cpd_steps[0] , 0, this._cpd_steps[0] , this._cpd_steps[1]);
		 this._sprite_compass_number[i].visible = $gameSystem._compass_visible3;	   
		 var nx = -(this._cpd_steps[0] * i) + ((this._cpd_steps[0] / 2)  * numbers.length);
		 this._sprite_compass_number[i].x = Moghunter.compass_x + Moghunter.compass_steps_x - nx;
	};
};
	
//==============================
// * Check Destination Events
//==============================	
CompassHud.prototype.check_destination_events = function() {
	$gameMap.events().forEach(function(event) {
		if (!event._erased && event.page()) {
		event.list().forEach(function(l) {
			if (event._compass_destination) {
			    $gameSystem._compass_event_id = event.eventId();
				this._event = event
				$gameSystem._compass_indicator.event = event
				var event_name = $gameSystem._compass_name;
				this._sprite_compass_name.bitmap.clear();
				this._sprite_compass_name.bitmap.drawText(String(event_name),0,0,160,32,'left');
				if ($gameSystem._compass_visible) {
					this._sprite_compass.opacity = 255;
					this._sprite_compass_layout.opacity = 255;
					this._sprite_compass_name.opacity = 255;
					this._sprite_compass_indicator.opacity = 255;
					this._sprite_Questlayout.opacity = 255;
					for (var i = 0; i < this._sprite_compass_number.length; i++) {
						this._sprite_compass_number[i].opacity = 255;
					};
			    };
			};
	    }, this);
		};
    }, this);
	this._compass_event_id = $gameSystem._compass_event_id;	
};

//==============================
// * Refresh Compass
//==============================
CompassHud.prototype.refresh_compass = function() {
	this._compass_event_id = $gameSystem._compass_event_id;
	this._sprite_compass.opacity = 0;
    this._sprite_compass_layout.opacity = 0;
	this._sprite_compass_name.opacity = 0;
	this._sprite_compass_indicator.opacity = 0
	this._sprite_Questlayout.opacity = 0;
	for (var i = 0; i < this._sprite_compass_number.length; i++) {
		this._sprite_compass_number[i].opacity = 0;
	};	
	this._sprite_compass_ref = 10;	
	this._event = $gameSystem._compass_indicator.event;
	this._sprite_compass_name.bitmap.clear();
	 this.refreshVisible();
	if (!this._event) {return};
	event_name = $gameSystem._compass_name
	this._sprite_compass_name.bitmap.drawText(String(event_name),0,0,160,32,'left');
};

//==============================
// * Update Compass
//==============================
CompassHud.prototype.updateCompass = function() {
	 if (this._event) {this.updateIndicator()}
	 
	 
};

//==============================
// * Update Opacity
//==============================
CompassHud.prototype.updateOpacity = function() {
     	if (this._compass_event_id != $gameSystem._compass_event_id) {this.refresh_compass()};  
        this._sprite_compass_layout.opacity = this._sprite_compass.opacity;
        this._sprite_compass_name.opacity = this._sprite_compass.opacity;	
	    this._sprite_compass_indicator.opacity = this._sprite_compass.opacity;	
	    this._sprite_Questlayout.opacity = this._sprite_compass.opacity;	
	    for (var i = 0; i < this._sprite_compass_number.length; i++) {
	         this._sprite_compass_number[i].opacity = this._sprite_compass.opacity;
	    };			
};

//==============================
// * Update Fade
//==============================
CompassHud.prototype.updateFade = function() {
       if (this.need_fade_sprite_compass()) {
	       if ($gameMessage.isBusy()) {
		       this.opacity -= 10;
		   } else {		 
			   if (this._sprite_compass.opacity > 90) {	
					this._sprite_compass.opacity -= 10;
					if (this._sprite_compass.opacity < 90) {this._sprite_compass.opacity = 90};
			     };
		    };
	   } else {
			 this._sprite_compass.opacity += 10
	   };
};

//==============================
// * Update Combo Sprites
//==============================
CompassHud.prototype.update = function() {	
   Sprite.prototype.update.call(this);	
   this.updateCompass();
   this.updateOpacity();
   if (this._sprite_compass_size[0] == -1 && this._sprite_compass_layout.bitmap.isReady()) {
       this.set_compass_data()
   };	
   if (!this.compass_visible()) {
    	this._sprite_compass.opacity -= 10
	    return;
    } else {
        this.updateFade();
	};		
	this._sprite_compass_ref += 1;
    if (this._sprite_compass_ref > 4) {this.update_compass_direction()};
	if (!this._spriteLoaded) {this.refreshIndPosition()};   	
};

//if ($gameMessage.isBusy()) {return true};

//==============================
// * Update Compass Direction
//==============================
CompassHud.prototype.update_compass_direction = function() {
	this._sprite_compass_ref = 0;
	var dx = $gameMap.compass_destination().screenX();
	var dy = $gameMap.compass_destination().screenYC();
	var cx = $gamePlayer.screenX();
	var cy = $gamePlayer.screenYC();
	var axy = [cx - dx,cy - dy];	
    var angle = Math.atan2(axy[0],axy[1]);
	this._sprite_compass.rotation = -angle;
	var dist = (Math.abs(axy[0]) + Math.abs(axy[1]));
	var dist_2 = Math.floor(dist / 48);
	if (this._stepNumber[0] != dist_2) {
	    this.refresh_steps_number(dist_2);
    };
};

//==============================
// * Set Compass Data
//==============================
CompassHud.prototype.set_compass_data = function() {
  this._sprite_compass_size[0] = Moghunter.compass_x - ($gameMap.tileWidth() / 2);
  this._sprite_compass_size[1] = Moghunter.compass_y - $gameMap.tileHeight();
  this._sprite_compass_size[2] = Moghunter.compass_x + this._sprite_compass_layout.bitmap.width - $gameMap.tileWidth();
  this._sprite_compass_size[3] = Moghunter.compass_y + this._sprite_compass_layout.bitmap.height;
  this._cpd_steps[0] = this._sprite_compass_number[0].bitmap.width / 10;
  this._cpd_steps[1] = this._sprite_compass_number[0].bitmap.height;
};

//==============================
// * Need Fade Sprite Compass
//==============================
CompassHud.prototype.need_fade_sprite_compass = function() {
	if (!$gameSystem._compass_ahud_smartFade) {return false};
	if ($gamePlayer.screen_realX() < this._sprite_compass_size[0]) {return false};
	if ($gamePlayer.screen_realX() > this._sprite_compass_size[2]) {return false};
	if ($gamePlayer.screen_realY() < this._sprite_compass_size[1]) {return false};
	if ($gamePlayer.screen_realY() > this._sprite_compass_size[3]) {return false};
	if (this._sprite_compass.opacity < 90) {return false} 
	return true;
};

//==============================
// * Compass Visible
//==============================
CompassHud.prototype.compass_visible = function() {
	if (!$gameMap.compass_destination()) {return false};
	if ($gameMap.compass_destination()._erased) {return false};	
	if (!$gameSystem._compass_visible) {return false};
	if (SceneManager.isSceneChanging()) {return false};
	if ($gameMessage.isBusy()) {return false}
	return true;
};