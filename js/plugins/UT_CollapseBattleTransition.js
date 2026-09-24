//=============================================================================
// RPG Maker MV/MZ - Collapse Battle Transition v2.0
//=============================================================================

/*:
 * @target MV MZ
 * @plugindesc Replace battle transition with a collapsing background effect.
 * @author utunnels
 *
 * @help This plugin does not provide plugin commands.
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

function CollapsePicture(unused1, unused2){
  const cw = Graphics.width;
  const ch = Graphics.height;
  
  var matrix = new PIXI.Matrix();
  function drawPolygon(i,v){
    var mesh = meshes[i];
    mesh.x = v.x;
    mesh.y = v.y;
    const nAx = Math.sin(v.r);
    const nAy = Math.cos(v.r);
    const wScale = Math.cos(v.s);
    matrix.set(nAy * wScale, -nAx * wScale, nAx, nAy, mesh.x, mesh.y);
    mesh.transform.setFromMatrix(matrix);
  }

  function breakPolygon(p,g){
    const w=24;
    const h=24;
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
    var c = findCenter(p);
    mesh.pivot.set(c[0], c[1]);
    mesh.x = mesh.pivot.x;
    mesh.y = mesh.pivot.y;
    sprite.addChild(mesh);
    meshes.push(mesh);
  });

  this.sprite = sprite;
  
  var gravityForce = 2;
  var velocityMax = 200;
  
  function moveVector(v){
    v.delay--;
    if(v.delay>0) return;
    v.x += v.vx;
    v.y += v.vy;
    v.vy += gravityForce;
    if(Math.abs(v.vy)>velocityMax) v.vy = velocityMax*v.vy/Math.abs(v.vy);
    v.r += v.dr;
    v.s += v.ds;
  }

  function findCenter(p){
    var dx=0,dy=0;
    p.forEach(function(pp){
      dx+=pp[0];
      dy+=pp[1];
    });
    return [dx/p.length, dy/p.length];
  }
  
  function initVelocity(g, unused){
    var vg = [];
    var t = 120;
    g.forEach(function(p,i){
      var c = findCenter(p);
      var v = {x:c[0],y:c[1],vx:0,vy:0,r:0,s:0};
      v.vx = 0;
      v.vy = 0;
      v.dr = Math.random()*0.04;
      v.ds = Math.random()*0.04;
      v.delay = t/g.length*i + Math.random()*4;
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

var transitionFn = CollapsePicture;
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