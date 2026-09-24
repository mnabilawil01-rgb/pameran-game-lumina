//=============================================================================
// RPG Maker MV/MZ - Rotate Box Battle Transition v2.0
//=============================================================================

/*:
 * @target MV MZ
 * @plugindesc Replace battle transition with a rotate box effect.
 * @author utunnels
 *
 * @help This plugin does not provide plugin commands.
 *
 */
(function(){if (!DataManager.isBattleTest()){

const isMV = Utils.RPGMAKER_NAME == 'MV';
const isMZ = Utils.RPGMAKER_NAME == 'MZ';
const isUnknown = !isMV && !isMZ;
if(isUnknown) throw 'Unknown RPG Maker: RPGMAKER_NAME = ' + Utils.RPGMAKER_NAME;

const baseTexture = isMV?'__baseTexture':'_baseTexture';

Bitmap.fastSnap = function(stage,slot) {
  slot = slot||0;
  var width = Graphics.width;
  var height = Graphics.height;
  var renderer = isMV?Graphics._renderer:Graphics.app.renderer;
  if(!this.fsBitmap){
    this.fsBitmap = [];
    this.fsTexture = [];
    for(var i=0;i<2;i++){
      this.fsBitmap[i] = new Bitmap(width, height);
      this.fsBitmap[i]._setDirty = function(){};
      this.fsBitmap[i]._dirty = false;
      this.fsTexture[i] = PIXI.RenderTexture.create(width, height);
      this.fsBitmap[i][baseTexture] = this.fsTexture[i].baseTexture;
    }
  }
  if (stage) {
    renderer.render(stage, this.fsTexture[slot]);
    stage.worldTransform.identity();
  }
  return this.fsBitmap[slot];
};

function RotateBoxPicture(ctx, unused){
  const canvas = ctx.canvas;
  const cw = Graphics.width;
  const ch = Graphics.height;
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,cw,ch);

  var sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
  this.sprite = sprite;
  var sprite2 = new Sprite();
  sprite2.bitmap = SceneManager._transitionBitmap;
  var sprite1 = new Sprite();
  sprite.addChild(sprite1);
  sprite.addChild(sprite2);
  
  var angle=0;
  function refreshRight(a){
    var l = canvas.width;
    var h = canvas.height;
    var r = l/Math.pow(2,0.5);
    var w1 = Math.sin(a)*l;
    var w2 = Math.cos(a)*l;
    var x1 = l/2 - r*Math.sin(Math.PI/4+a);
    var x2 = x1+w1;
    sprite1.x = x1;
    sprite1.y = 0;
    sprite1.scale.set(w1 / cw, h / ch);
    sprite1.alpha = 1 - (1 - w1 / l) * 0.7;
    sprite2.x = x2;
    sprite2.y = 0;
    sprite2.scale.set(w2 / cw, h / ch);
    sprite2.alpha = 1 - (1 - w2 / l) * 0.7;
  }
  function refreshLeft(a){
    var l = canvas.width;
    var h = canvas.height;
    var r = l/Math.pow(2,0.5);
    var w1 = Math.sin(a)*l;
    var w2 = Math.cos(a)*l;
    var x1 = l/2 + r*Math.sin(Math.PI/4+a)-w1;
    var x2 = x1-w2;
    sprite1.x = x1;
    sprite1.y = 0;
    sprite1.scale.set(w1 / cw, h / ch);
    sprite1.alpha = 1 - (1 - w1 / l) * 0.7;
    sprite2.x = x2;
    sprite2.y = 0;
    sprite2.scale.set(w2 / cw, h / ch);
    sprite2.alpha = 1 - (1 - w2 / l) * 0.7;
  }
  function refreshDown(a){
    var l = canvas.height;
    var w = canvas.width;
    var r = l/Math.pow(2,0.5);
    var h1 = Math.sin(a)*l;
    var h2 = Math.cos(a)*l;
    var y1 = l/2 - r*Math.sin(Math.PI/4+a);
    var y2 = y1+h1;
    sprite1.x = 0;
    sprite1.y = y1;
    sprite1.scale.set(w / cw, h1 / ch);
    sprite1.alpha = 1 - (1 - h1 / l) * 0.7;
    sprite2.x = 0;
    sprite2.y = y2;
    sprite2.scale.set(w / cw, h2 / ch);
    sprite2.alpha = 1 - (1 - h2 / l) * 0.7;
  }
  function refreshUp(a){
    var l = canvas.height;
    var w = canvas.width;
    var r = l/Math.pow(2,0.5);
    var h1 = Math.sin(a)*l;
    var h2 = Math.cos(a)*l;
    var y1 = l/2 + r*Math.sin(Math.PI/4+a)-h1;
    var y2 = y1 - h2;
    sprite1.x = 0;
    sprite1.y = y1;
    sprite1.scale.set(w / cw, h1 / ch);
    sprite1.alpha = 1 - (1 - h1 / l) * 0.7;
    sprite2.x = 0;
    sprite2.y = y2;
    sprite2.scale.set(w / cw, h2 / ch);
    sprite2.alpha = 1 - (1 - h2 / l) * 0.7;
  }

  var fns = [refreshRight, refreshLeft, refreshDown, refreshUp];
  var fn = (fns[Math.floor(Math.random()*fns.length)]);
  fn = fn.bind(this);
  this.frameCount=0;
  this.refreshScene = function(){
    if(this.backgroundImage && this.backgroundImage!=sprite1.bitmap){
      sprite1.bitmap = this.backgroundImage;
    }
    this.frameCount++;
    //if(this.frameCount<60) return;
    angle += Math.PI/2/45;
    if(angle>Math.PI/2) {
      angle = Math.PI/2;
      sprite.alpha = 0;
    }else{
      fn(angle);
    }
  };

  this.needSnapUpdate = true;
}

var transitionFn = RotateBoxPicture;
var transitionTime = 200;

////////////////////////////////////////common transition functions////////////////////////////////////////////////
function prepareTransitionEffect(){
  SceneManager._transitionBitmap = Bitmap.fastSnap(SceneManager._scene);
  SceneManager._transitionBackgroundBitmap = new Bitmap(Graphics.width, Graphics.height);
  SceneManager._transitionPicture = new transitionFn(SceneManager._transitionBackgroundBitmap.canvas.getContext('2d'), SceneManager._transitionBitmap);
}

function startTransitionEffect(){
  var _this = SceneManager._scene;
  _this._fadeDuration = 0;
  _this._fadeOpacity = 0;//MZ
  if(_this._fadeSprite) _this._fadeSprite.opacity = 0;//MV
  if(_this.updateFade) _this.updateFade();//MV
  if(_this.updateColorFilter) _this.updateColorFilter();//MZ
  _this._prevSceneSprite = SceneManager._transitionPicture.sprite;
  _this.addChild(_this._prevSceneSprite);
}

function updateTransitionEffect(){
  var _this = SceneManager._scene;
  if(SceneManager._transitionPicture.frameCount<transitionTime){
    if(SceneManager._transitionPicture.needSnapUpdate){
      _this._prevSceneSprite.visible= false;
      SceneManager._transitionPicture.backgroundImage = Bitmap.fastSnap(_this,1);
      _this._prevSceneSprite.visible = true;
    }
    SceneManager._transitionPicture.refreshScene();
  }else{
    _this.removeChild(_this._prevSceneSprite);
  }
}

///////////////////////////////////////////////map and battle scene////////////////////////////////////////////////////////

Scene_Map.prototype.encounterEffectSpeed = function() {
  return 40;
};

Scene_Map.prototype.startEncounterEffect = function() {
    //this._spriteset.hideCharacters();
    this._encounterEffectDuration = this.encounterEffectSpeed();
};
  
Scene_Map.prototype.updateEncounterEffect = function() {
  if (this._encounterEffectDuration > 0) {
    this._encounterEffectDuration--;
    var speed = this.encounterEffectSpeed();
    var n = speed - this._encounterEffectDuration;
    if (n === 2) {
      this.startFlashForEncounter(speed / 2);
    }
    if (n === Math.floor(speed / 6)) {
      this.startFlashForEncounter(speed / 2);
    }
    if(this._encounterEffectDuration===2){
      prepareTransitionEffect();
    }
}
};

(function(alias){
Scene_Battle.prototype.start = function() {
  //this.startFadeIn(this.fadeSpeed(), false);
  alias.call(this);
  startTransitionEffect();
};
})(Scene_Battle.prototype.start);
  
(function(alias){
Scene_Battle.prototype.update = function() {
  alias.call(this);
  updateTransitionEffect();
};
})(Scene_Battle.prototype.update);

if(Utils.RPGMAKER_NAME == 'MV'){
  (function(alias){
  SceneManager.onSceneLoading = function() {
    if(this._scene instanceof Scene_Battle) return;
    alias.call(this);
  };
  })(SceneManager.onSceneLoading);
}
}})();//if (!DataManager.isBattleTest())