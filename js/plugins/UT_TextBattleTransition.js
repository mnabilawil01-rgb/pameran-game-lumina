//=============================================================================
// RPG Maker MV/MZ - Text Battle Transition v2.0
//=============================================================================

/*:
 * @target MV MZ
 * @plugindesc Replace battle transition with a text masking effect.
 * @author utunnels
 *
 * @help This plugin does not provide plugin commands.
 *
 * @param mask text
 * @desc Text to use as a mask image.
 * @default /
 *
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

const script = document.currentScript.src.match(/\/([^\/]+)\.js/i)[1];
var parameters = PluginManager.parameters(script);
SceneManager.maskText = parameters['mask text']||'/';

function TextMaskPicture(ctx, img){
  const filters = isMV?'_filters':'filters';
  const canvas = ctx.canvas;
  const cw = canvas.width;
  const ch = canvas.height;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';
  ctx.fillRect(0,0,cw,ch);
  this.frameCount=0;
  this.sprite = new Sprite();
  this.sprite.bitmap = img;
  var mask = new Sprite();
  mask.bitmap = SceneManager._transitionBackgroundBitmap;
  var filter = new PIXI.SpriteMaskFilter(mask);
  this.sprite[filters] = [filter];
  this.refreshScene = function(){
    if(this.frameCount%2==0){
      ctx.fillStyle = 'black';
      var cnt = 1;
      if(this.frameCount>30){
        cnt += this.frameCount-30;
        if(cnt>20) cnt = 20;
      }
      for(var i=0;i<cnt;i++){
        ctx.save();
        ctx.font = (Math.random()*150 + 100) +  'px gamefont';
        ctx.fillText(SceneManager.maskText, Math.random()*cw,Math.random()*ch);
        ctx.restore();
      }
      if(this.frameCount>60){
        this.sprite.opacity-=20;
      }
      SceneManager._transitionBackgroundBitmap._baseTexture.update();
    }
    this.frameCount++;
  };
}

var transitionFn = TextMaskPicture;
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