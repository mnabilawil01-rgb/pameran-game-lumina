//=============================================================================
// RPG Maker MV/MZ - Melt Battle Transition v2.0
//=============================================================================

/*:
 * @target MV MZ
 * @plugindesc Replace battle transition with a melting background effect.
 * @author utunnels
 *
 * @help This plugin does not provide plugin commands.
 * 
* @param melt line width
 * @desc Width of the melt effect vertical lines.
 * @type number
 * @min 1
 * @default 2
 *
 * @param melt random weight
 * @desc Weight of melt randomness
 * @type number
 * @decimals 4
 * @default 1
 *
 * @param melt velocity weight
 * @desc Weight of melt initial velocity
 * @type number
 * @decimals 4
 * @default 1
 *
 * @param melt delay weight
 * @desc Weight of melt initial delay
 * @type number
 * @decimals 2
 * @default 5
 *
 * @param melt accelerate weight
 * @desc Weight of melt accelerate rate
 * @type number
 * @decimals 4
 * @default 0.0011
 *
 * @param melt gravity
 * @desc gravity of the melt system
 * @type number
 * @decimals 4
 * @default 0.25
 *
 * @param melt velocity max
 * @desc max drop speed of the melt system
 * @type number
 * @decimals 4
 * @default 200
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

const Mesh = PIXI.SimpleMesh||PIXI.mesh.Mesh;
const DRAW_MODES = isMV?Mesh.DRAW_MODES:PIXI.DRAW_MODES;

const script = document.currentScript.src.match(/\/([^\/]+)\.js/i)[1];
var parameters = PluginManager.parameters(script);
SceneManager.meltLineWidth = Number(parameters['melt line width']);
SceneManager.meltRandomWeight = Number(parameters['melt random weight']);
SceneManager.meltVelocityWeight = Number(parameters['melt velocity weight']);
SceneManager.meltDelayWeight = Number(parameters['melt delay weight']);
SceneManager.meltAccelerateWeight = Number(parameters['melt accelerate weight']);
SceneManager.meltGravity = Number(parameters['melt gravity']);
SceneManager.meltVelocityMax = Number(parameters['melt velocity max']);

function MeltPicture(unused1, unused2){
  const cw = Graphics.width;
  const ch = Graphics.height;

  function drawPolygon(i,v){
    var mesh = meshes[i];
    mesh.x = v.x;
    mesh.y = v.y;
  }

  function breakPolygon(p,g){
    const w=SceneManager.meltLineWidth;
    const h=Graphics.height;
    for(var x=0;x<p[2][0];x+=w){
      for(var y=0;y<p[2][1];y+=h){
        g.push([[x,y],[x+w,y],[x+w,y+h],[x,y+h]]);
      }
    }
  }
  
  var rect = [[0,0],[cw,0],[cw,ch],[0,ch]];
  var group = [];
  breakPolygon(rect,group);

  var texture = new PIXI.Texture(SceneManager._transitionBitmap.baseTexture);
  var meshes = [];
  var sprite = new Sprite();
  group.forEach(function (p, i) {
    var verts = [], uvs = [], inds = [];
    for(var pp of p){
      verts.push(pp[0],pp[1]);
      uvs.push(pp[0]/cw, pp[1]/ch);
    }
    verts = new Float32Array(verts);
    uvs = new Float32Array(uvs);
    for(var i=1;i<p.length-1;i++){
      inds.push(0);
      inds.push(i);
      inds.push(i+1);
    }
    inds = new Uint16Array(inds);
    var mesh = new Mesh(texture, verts, uvs, inds, DRAW_MODES.TRIANGLES);
    sprite.addChild(mesh);
    meshes.push(mesh);
  });

  this.sprite = sprite;
  
  var gravityForce = SceneManager.meltGravity;
  var velocityMax = SceneManager.meltVelocityMax;
  
  function moveVector(v){
    v.delay--;
    if(v.delay>0) return;
    var delta = (v.delay>-1)?-v.delay:1;
    v.x += v.vx;
    v.y += v.vy*delta;
    v.vy += delta*(gravityForce+ v.y*SceneManager.meltAccelerateWeight);
    if(Math.abs(v.vy)>velocityMax) v.vy = velocityMax*v.vy/Math.abs(v.vy);
  }

  function initVelocity(g, cp){
    var vg = [];
    g.forEach(function(p,i){
      var v = {x:0,y:0,vx:0,vy:0};
      v.vx = 0;
      var baseValue = Math.cos(i*12*SceneManager.meltLineWidth/Graphics.width)+Math.sin(i*8.5*SceneManager.meltLineWidth/Graphics.width);
      v.vy = (1-baseValue)*SceneManager.meltVelocityWeight + Math.random()*SceneManager.meltRandomWeight;
      v.delay = (1+baseValue)*SceneManager.meltDelayWeight;//Math.random()*10;
      vg.push(v);
    });
    return vg;
  }
  
  var vgroup = initVelocity(group);
  this.frameCount = 0;
  
  this.refreshScene = function(){
    group.forEach(function(p,i){
      drawPolygon(i,vgroup[i]);
      moveVector(vgroup[i]);
    });
    this.frameCount++;
  };
}

var transitionFn = MeltPicture;
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