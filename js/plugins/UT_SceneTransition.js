//=============================================================================
// RPG Maker MV/MZ - Scene Transition v2.1
//=============================================================================

/*:
 * @target MV MZ
 * @plugindesc Replace scene transition with various effects.
 * @author utunnels
 *
 * @param defaultTransition
 * @text default effect function
 * @desc default effect function used in scene transition
 * @type combo
 * @option MeltPicture
 * @option RotateBoxPicture
 * @option ShatteredPicture
 * @option CollapsePicture
 * @option TextMaskPicture
 * @option FadeoutPicture
 *
 * @param sceneFilters
 * @text scene filters
 * @type struct<SceneFilter>[]
 * @desc filter script that determines which scene do or do not use transition effect
 * @default ["{\"prev\":\"Scene_Boot\",\"next\":\"\",\"effect\":\"\"}","{\"prev\":\"Scene_Splash\",\"next\":\"\",\"effect\":\"\"}"]
 *
 * @param --text mask settings--
 *
 * @param maskText
 * @text mask text
 * @desc Text to use as a mask image.
 * @default /
 *
 * @param --melt settings--
 *
 * @param meltLineWidth
 * @text melt line width
 * @desc Width of the melt effect vertical lines.
 * @type number
 * @min 1
 * @default 2
 *
 * @param meltRandomWeight
 * @text melt random weight
 * @desc Weight of melt randomness
 * @type number
 * @decimals 4
 * @default 1
 *
 * @param meltVelocityWeight
 * @text melt velocity weight
 * @desc Weight of melt initial velocity
 * @type number
 * @decimals 4
 * @default 1
 *
 * @param meltDelayWeight
 * @text melt delay weight
 * @desc Weight of melt initial delay
 * @type number
 * @decimals 2
 * @default 5
 *
 * @param meltAccelerateWeight
 * @text melt accelerate weight
 * @desc Weight of melt accelerate rate
 * @type number
 * @decimals 4
 * @default 0.0011
 *
 * @param meltGravity
 * @text melt gravity
 * @desc gravity of the melt system
 * @type number
 * @decimals 4
 * @default 0.25
 *
 * @param meltVelocityMax
 * @text melt velocity max
 * @desc max drop speed of the melt system
 * @type number
 * @decimals 4
 * @default 200
 */
/*~struct~SceneFilter:
 * @param prev
 * @text previous scene
 * @type combo
 * @option Scene_Boot
 * @option Scene_Title
 * @option Scene_Map
 * @option Scene_Menu
 * @option Scene_Item
 * @option Scene_Skill
 * @option Scene_Equip
 * @option Scene_Status
 * @option Scene_Options
 * @option Scene_Save
 * @option Scene_Load
 * @option Scene_GameEnd
 * @option Scene_Shop
 * @option Scene_Name
 * @option Scene_Debug
 * @option Scene_Battle
 * @option Scene_Gameover
 * @option Scene_Splash
 *
 * @param next
 * @text next scene
 * @type combo
 * @option Scene_Boot
 * @option Scene_Title
 * @option Scene_Map
 * @option Scene_Menu
 * @option Scene_Item
 * @option Scene_Skill
 * @option Scene_Equip
 * @option Scene_Status
 * @option Scene_Options
 * @option Scene_Save
 * @option Scene_Load
 * @option Scene_GameEnd
 * @option Scene_Shop
 * @option Scene_Name
 * @option Scene_Debug
 * @option Scene_Battle
 * @option Scene_Gameover
 * @option Scene_Splash
 *
 * @param effect
 * @text transition effect
 * @type combo
 * @option MeltPicture
 * @option RotateBoxPicture
 * @option ShatteredPicture
 * @option CollapsePicture
 * @option TextMaskPicture
 * @option FadeoutPicture
 */
(function(){//if (!DataManager.isBattleTest()){

const isMV = Utils.RPGMAKER_NAME == 'MV';
const isMZ = Utils.RPGMAKER_NAME == 'MZ';
const isUnknown = !isMV && !isMZ;
if(isUnknown) throw 'Unknown RPG Maker: RPGMAKER_NAME = ' + Utils.RPGMAKER_NAME;

const baseTexture = isMV?'__baseTexture':'_baseTexture';
const Mesh = PIXI.SimpleMesh||PIXI.mesh.Mesh;
const DRAW_MODES = isMV?Mesh.DRAW_MODES:PIXI.DRAW_MODES;
const MAX_TRANSITION_TIME = 200;

Bitmap.fastSnap = function(stage,slot) {
  slot = slot||0;
  var width = Graphics.width;
  var height = Graphics.height; if(!width) return this.snap(stage);
  var renderer = isMV?Graphics._renderer:Graphics.app.renderer;
  if(!this.fsBitmap){
    this.fsBitmap = [];
    this.fsTexture = [];
    ///this.lastStage = [];
    ///this.lastFrame = [];
    for(var i=0;i<3;i++){
      this.fsBitmap[i] = new Bitmap(width, height);
      this.fsBitmap[i]._setDirty = function(){};
      this.fsBitmap[i]._dirty = false;
      this.fsTexture[i] = PIXI.RenderTexture.create(width, height);
      this.fsBitmap[i][baseTexture] = this.fsTexture[i].baseTexture;
    }
  }
  if (stage) {
    ///if(this.lastStage[slot]!=stage||this.lastFrame[slot]!=Graphics.frameCount){
      renderer.render(stage, this.fsTexture[slot]);
      stage.worldTransform.identity();
      ///this.lastStage[slot] = stage;
      ///this.lastFrame[slot] = Graphics.frameCount;
    ///}
  }
  return this.fsBitmap[slot];
};

SceneManager.snapForBackground = function() {
  this._backgroundBitmap = Bitmap.fastSnap(this._scene,2);
  //for MV
  this._backgroundBitmap._needBlur = true;
};

if(isMV)
(function(alias){
Sprite.prototype.update = function() {
  //add blurred version over the normal one, to hide the flaw
  if(this.bitmap && this.bitmap._needBlur && !this._blurChild){
    var spriteBlur = new Sprite();
    spriteBlur.bitmap = this.bitmap;
    if(!Sprite._blurFilter){
      var blurFilter = new PIXI.filters.BlurFilter();
      blurFilter.blur=1;
      blurFilter.padding=0;
      Sprite._blurFilter = blurFilter;
    }
    spriteBlur._filters = spriteBlur._filters||[];
    spriteBlur._filters.push(Sprite._blurFilter);
    this.addChild(spriteBlur);
    this._blurChild = spriteBlur._blurChild = spriteBlur;
  }
  alias.apply(this, arguments);
};
})(Sprite.prototype.update);

if(typeof Scene_Splash=='undefined') Scene_Splash = function(){}; //MV doesn't have this by default, add it to prevent crash

const script = document.currentScript.src.match(/\/([^\/]+)\.js/i)[1];
var parameters = PluginManager.parameters(script);
SceneManager.maskText = parameters['maskText']||'/';
SceneManager.meltLineWidth = Number(parameters['meltLineWidth']);
SceneManager.meltRandomWeight = Number(parameters['meltRandomWeight']);
SceneManager.meltVelocityWeight = Number(parameters['meltVelocityWeight']);
SceneManager.meltDelayWeight = Number(parameters['meltDelayWeight']);
SceneManager.meltAccelerateWeight = Number(parameters['meltAccelerateWeight']);
SceneManager.meltGravity = Number(parameters['meltGravity']);
SceneManager.meltVelocityMax = Number(parameters['meltVelocityMax']);
SceneManager.sceneFilters = JSON.parse(parameters['sceneFilters']);

window.FadeoutPicture = function(unused1, unused2){
  this.sprite = new Sprite();
  this.sprite.bitmap = SceneManager._transitionBitmap;
  this.frameCount = 0;
  this.refreshScene = function(){
    this.sprite.opacity -= 8;
    this.frameCount++;
    if(this.sprite.opacity<=0) this.frameCount=MAX_TRANSITION_TIME;
  };

  this.needSnapUpdate = 2;//update map if possible
};

window.CollapsePicture = function(unused1, unused2){
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
    var visible = false;
    group.forEach(function(p,i){
      drawPolygon(i,vgroup[i]);
      moveVector(vgroup[i]);
      if(vgroup[i].y<ch*1.5) visible = true;
    });
    this.frameCount++;
    if(!visible) this.frameCount=MAX_TRANSITION_TIME;
  };
};

window.TextMaskPicture = function(ctx, img){
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
    if(this.sprite.opacity<=0) this.frameCount=MAX_TRANSITION_TIME;
  };
};

window.MeltPicture = function(unused1, unused2){
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
    var visible = false;
    group.forEach(function(p,i){
      drawPolygon(i,vgroup[i]);
      moveVector(vgroup[i]);
      if(vgroup[i].y<ch) visible = true;
    });
    this.frameCount++;
    if(!visible) this.frameCount=MAX_TRANSITION_TIME;
  };
};

window.RotateBoxPicture = function(ctx, unused){
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
    if(this.frameCount==0) this.d = Date.now();
    if(this.backgroundImage && this.backgroundImage!=sprite1.bitmap){
      sprite1.bitmap = this.backgroundImage;
    }
    this.frameCount++;
    //if(this.frameCount<60) return;
    angle += Math.PI/2/45;
    if(angle>Math.PI/2) {
      angle = Math.PI/2;
      sprite.alpha = 0;
      this.frameCount=MAX_TRANSITION_TIME;
      //console.log(Date.now()-this.d);
    }else{
      fn(angle);
    }
  };

  this.needSnapUpdate = 3; //update both scene snapshot
}

window.ShatteredPicture = function(unused1, unused2){
  const cw = Graphics.width;
  const ch = Graphics.height;

  function polygonArea(vertices){
    let area=0;
    const n=vertices.length;
    for(let i=0; i<n; i++){
      const j=(i+1)%n;
      area+=vertices[i][0]*vertices[j][1];
      area-=vertices[j][0]*vertices[i][1];
    }
    return Math.abs(area)/2;
  }
  
  const polygonMinArea = cw*ch/12;
  
  function divideSide(p,s){
     var p1 = p[s];
     var p2 = p[(s+1)%p.length];
     var d = Math.random()*0.4+0.3; 
     var x = d*(p2[0] - p1[0]) + p1[0];
     var y = d*(p2[1] - p1[1]) + p1[1];
     return [x,y];
  }
  
  function sideLength(p,s){
     var p1 = p[s];
     var p2 = p[(s+1)%p.length];
     var dx = p1[0]-p2[0];
     var dy = p1[1]-p2[1];
     return dx*dx+dy*dy;
  }
  
  function longestSide(p,ss){
    var l = -1,s=0;
    for(var i=0;i<p.length;i++){
      var ll = sideLength(p,i);
      if(ll>l && i!=ss) {
        l=ll;
        s=i;
      }
    }
    return s;
  }
  
  function breakPolygon(polygon,group){
    if(polygonArea(polygon)<polygonMinArea){
      return;
    }
    var side1 = longestSide(polygon);//Math.floor(Math.random()*polygon.length);
    var side2 = longestSide(polygon,side1);//side1 + Math.ceil(Math.random()*(polygon.length-2));
    side2 %= polygon.length;
    var p1 =divideSide(polygon,side1);
    var p2 =divideSide(polygon,side2);
    var np1 = [p1,p2];
    for(var p =(side2+1)%polygon.length;p!=(side1+1)%polygon.length;p= (p+1)%polygon.length){
      np1.push(polygon[p]);
    }
    var np2 = [p2,p1];
    for(var p =(side1+1)%polygon.length;p!=(side2+1)%polygon.length;p= (p+1)%polygon.length){
      np2.push(polygon[p]);
    }
    group.splice(group.indexOf(polygon),1)
    group.push(np1,np2);
    breakPolygon(np1,group);
    breakPolygon(np2,group);
  }
  
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
  
  var rect = [[0,0],[cw,0],[cw,ch],[0,ch]];
  var group = [rect];
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
  
  var gravityForce = 0.5;
  var velocityMax = 40;
  
  function moveVector(v){
    v.delay--;
    if(v.delay>0) return;
    v.x += v.vx;
    v.y += v.vy;
    v.vy += gravityForce;
    if(v.vy>velocityMax) v.vy = velocityMax;
    v.r += v.dr;
    v.s += v.ds;
  }
  
  var centralPoint = [cw/2,ch*4/5];
  
  function findCenter(p){
    var dx=0,dy=0;
    p.forEach(function(pp){
      dx+=pp[0];
      dy+=pp[1];
    });
    return [dx/p.length, dy/p.length];
  }
  
  function distance(p1,p2){
     var dx = p1[0]-p2[0];
     var dy = p1[1]-p2[1];
     return dx*dx+dy*dy;
  }
  
  function initVelocity(g, cp){
    var vg = [];
    g.forEach(function (p, i) {
      var c = findCenter(p);
      var v = {x:c[0],y:c[1],vx:0,vy:0,r:0,s:0};
      var dx = c[0] - cp[0];
      var dy = c[1] - cp[1];
      var d = distance(c,cp);
      var dq = Math.pow(d,0.5);
      var a = 1-d/cw/ch*3.5;
      var vo = 5 * a;
      if(vo>0){
        v.vx = dx/dq*vo;
        v.vy = dy/dq*vo;
        v.dr = Math.random()*0.08;
        v.ds = Math.random()*0.08;
        v.delay = 0;
      }else{
        // simulate a 'stick' effect
        v.vx = 0;
        v.vy = 0;
        v.dr = Math.random()*0.02;
        v.ds = Math.random()*0.02;
        v.delay = Math.random()*40;
      }
      vg.push(v);
    });
    return vg;
  }
  
  var vgroup = initVelocity(group,centralPoint);
  this.frameCount = 0;
  
  this.refreshScene = function(){
    var visible = false;
    group.forEach(function(p,i){
      drawPolygon(i,vgroup[i]);
      moveVector(vgroup[i]);
      if(vgroup[i].y<ch*1.5) visible = true;
    });
    this.frameCount++;
    if(!visible)  this.frameCount = MAX_TRANSITION_TIME;
  };
}

window.transitionFn = null;
var paramTrans = parameters['defaultTransition'];
if(paramTrans){
  transitionFn = eval(paramTrans); 
}
for (let i=0;i<SceneManager.sceneFilters.length;i++)
{
  var f = JSON.parse(SceneManager.sceneFilters[i]);
  if(f.prev) f.prev = eval(f.prev);
  if(f.next) f.next = eval(f.next);
  if(f.effect) f.effect = eval(f.effect);
  SceneManager.sceneFilters[i] = f;
}
var transitionTime = MAX_TRANSITION_TIME;

////////////////////////////////////////common transition functions////////////////////////////////////////////////
function prepareTransitionEffect(){
  var _this = SceneManager._scene;
  delete SceneManager._transitionPicture;
  if(_this._prevSceneSprite) _this.removeChild(_this._prevSceneSprite);
  SceneManager._transitionBitmap = Bitmap.fastSnap(_this);
  SceneManager._transitionBackgroundBitmap = new Bitmap(Graphics.width, Graphics.height);
  SceneManager._transitionPictureScene = _this;
}

function clearFade(scene){
  var _this = scene;
  _this._fadeDuration = 0;
  _this._fadeOpacity = 0;//MZ
  if(_this._fadeSprite) _this._fadeSprite.opacity = 0;//MV
  if(_this.updateFade) _this.updateFade();//MV
  if(_this.updateColorFilter) _this.updateColorFilter();//MZ
}

var lastfs = Graphics.frameCount;
function startTransitionEffect(scene){
  if(SceneManager._transitionPictureScene==scene) return;
  var _this = scene;
  if(_this._prevSceneSprite) return;
  var fn = getTransFn(SceneManager._transitionPictureScene,_this);
  if(!fn) return;
  SceneManager._transitionPicture = new fn(SceneManager._transitionBackgroundBitmap.canvas.getContext('2d'), SceneManager._transitionBitmap);
  _this._prevSceneSprite = SceneManager._transitionPicture.sprite;
  _this.addChild(_this._prevSceneSprite);
  clearFade(_this);
  lastfs = Graphics.frameCount;
  if(SceneManager._transitionPicture.needSnapUpdate&1){
    SceneManager._transitionPicture.backgroundImage = Bitmap.fastSnap(_this,1);
  }
}

function updateTransitionEffect(scene){
  if(!SceneManager._transitionPicture) return;
  if(SceneManager._transitionPictureScene==scene) return;
  var _this = scene;
  if(!_this._prevSceneSprite) return;
  if(SceneManager._preserved && SceneManager._preserved==_this) return;
  if(SceneManager._transitionPicture.frameCount<transitionTime){
    if(SceneManager._transitionPicture.needSnapUpdate){
      var needSnap = false;
      if(Graphics.frameCount!=lastfs) { //avoid multple snapshot within frame
        needSnap = true;
        lastfs = Graphics.frameCount;
      }
      //var fb = !Graphics.app.renderer.framebuffer.current;
      _this._prevSceneSprite.visible= false;
      if(SceneManager._transitionPicture.needSnapUpdate&1 ){
        if(needSnap) Bitmap.fastSnap(_this,1);
      }
      //update map snapshot, feature is enabled only when UT_PreserveMapScene.js is installed
      if((SceneManager._transitionPicture.needSnapUpdate&2) && SceneManager._preserved && SceneManager._preserved==SceneManager._transitionPictureScene){
        SceneManager._scene = SceneManager._preserved;
        SceneManager._transitionPicture.$gameMessage = SceneManager._transitionPicture.$gameMessage||new Game_Message();
        var gmsg = $gameMessage;
        $gameMessage = SceneManager._transitionPicture.$gameMessage;
        SceneManager._preserved.update();
        $gameMessage = gmsg;
        SceneManager._scene = _this;
        if(needSnap) Bitmap.fastSnap(SceneManager._preserved);
      }
      _this._prevSceneSprite.visible = true;
    }
    SceneManager._transitionPicture.refreshScene();
  }else{
    _this.removeChild(_this._prevSceneSprite);
    delete SceneManager._transitionPicture;
  }
}

///////////////////////////////////////////////map and battle scene////////////////////////////////////////////////////////
var sceneBattle = {constructor:Scene_Battle};

(function(alias){
Scene_Map.prototype.encounterEffectSpeed = function() {
  if(!getTransFn(this,sceneBattle)) return alias.call(this);
  return 40;
};
})(Scene_Map.prototype.encounterEffectSpeed);

(function(alias){
Scene_Map.prototype.startEncounterEffect = function() {
    if(!getTransFn(this,sceneBattle)) this._spriteset.hideCharacters();
    this._encounterEffectDuration = this.encounterEffectSpeed();
};
})(Scene_Map.prototype.startEncounterEffect);
  
(function(alias){
Scene_Map.prototype.updateEncounterEffect = function() {
  if(!getTransFn(this,sceneBattle)) return alias.call(this);
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
      //prepareTransitionEffect();
    }
}
};
})(Scene_Map.prototype.updateEncounterEffect);

Scene_Base.prototype.preStopTransition = function(){
  prepareTransitionEffect(); //do a screenshot or at least save previous scene
};

Scene_Base.prototype.postStopTransition = function(){
  //clear fadeout effect before transfer
  if(getTransFn(this,SceneManager._nextScene)) clearFade(this);
};

(function(alias){
Scene_Base.prototype.stop = function(ignoreTransiton) {
    if(!ignoreTransiton) this.preStopTransition();
    alias.call(this); //console.log(SceneManager._nextScene,this)
    if(!ignoreTransiton) this.postStopTransition();
};
})(Scene_Base.prototype.stop);

(function(alias){
Scene_Battle.prototype.stop = function() {
    alias.call(this);
    if(getTransFn(this,SceneManager._nextScene)) clearFade(this);
};
})(Scene_Battle.prototype.stop);

Scene_Base.prototype.startTransitionEffect = function(){
  startTransitionEffect(this);
};

(function(alias){
Scene_Base.prototype.start = function() {
  alias.call(this);
  startTransitionEffect(this);
};
})(Scene_Base.prototype.start);

(function(alias){
Scene_Base.prototype.update = function() {
  //put it here to ensure it is executed even if startFadeIn is not called by this.start
  if(this._prevSceneSprite && !this._prevSceneSprite._clearedFade) {
    this._prevSceneSprite._clearedFade = true;
  }
  alias.call(this);
  updateTransitionEffect(this);
};
})(Scene_Base.prototype.update);

(function(alias){
Scene_Base.prototype.startFadeIn = function(duration, white) {
  alias.call(this, duration, white);
  //clear first fadein, if transition is already started
  if(this._prevSceneSprite && !this._prevSceneSprite._clearedFade) {
    clearFade(this);
    this._prevSceneSprite._clearedFade = true;
  }
};
})(Scene_Base.prototype.startFadeIn);

if(isMV){
  //MV needs this to remove the loading text
  (function(alias){
  SceneManager.onSceneLoading = function() {return;
    if(getTransFn(SceneManager._transitionPictureScene,SceneManager._scene)) return;
    alias.call(this);
  };
  })(SceneManager.onSceneLoading);
}

//get filtered transition function
function getTransFn(scene1,scene2){
  if(!scene1||!scene2) return undefined;
  var effect = transitionFn;
  for(f of SceneManager.sceneFilters){
    if(f.prev==scene1.constructor&&!f.next) effect = f.effect;
    if(f.next==scene2.constructor&&!f.prev) effect = f.effect;
    if(f.prev==scene1.constructor&&f.next==scene2.constructor) effect = f.effect;
  }
  return effect;
}

//}//if (!DataManager.isBattleTest())
})();