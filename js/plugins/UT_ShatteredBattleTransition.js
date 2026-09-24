//=============================================================================
// RPG Maker MV/MZ - Shattered Battle Transition v2.3 (Pengaman anti-crash saat scene reload)
//=============================================================================

/*:
 * @target MV MZ
 * @plugindesc [v2.3] Efek transisi 'kaca pecah' untuk battle & teleport. Map tujuan bisa pakai NAMA map. Ada pengaman anti-crash. Original effect by utunnels.
 * @author utunnels (dimodifikasi)
 *
 * @param EnableBattleTransition
 * @text Aktifkan Transisi Sebelum Battle
 * @type boolean
 * @default true
 * @desc Jika true, efek shatter otomatis dimainkan setiap kali battle dimulai (encounter acak). Bisa diubah lagi lewat Plugin Command.
 *
 * @param TransitionDuration
 * @text Durasi Transisi (frame)
 * @type number
 * @min 10
 * @max 600
 * @default 200
 * @desc Lama animasi kaca pecah berlangsung, dalam frame (60 frame kurang lebih 1 detik).
 *
 * @command TeleportWithTransition
 * @text Teleport dengan Efek Shatter
 * @desc Pindahkan player ke map lain dengan efek transisi kaca pecah, menggantikan fade hitam bawaan.
 *
 * @arg mapTarget
 * @type text
 * @text Map Tujuan (Nama atau ID)
 * @default 1
 * @desc Isi NAMA map persis seperti di daftar Map (mis. "Town"), ATAU nomor ID map (mis. 1). Nama tidak case-sensitive.
 *
 * @arg x
 * @type number
 * @min 0
 * @text Koordinat X Tujuan
 * @default 0
 *
 * @arg y
 * @type number
 * @min 0
 * @text Koordinat Y Tujuan
 * @default 0
 *
 * @arg direction
 * @type select
 * @text Arah Hadap Setelah Pindah
 * @option Tetap (tidak berubah)
 * @value 0
 * @option Bawah
 * @value 2
 * @option Kiri
 * @value 4
 * @option Kanan
 * @value 6
 * @option Atas
 * @value 8
 * @default 0
 *
 * @command PlayTransitionNow
 * @text Mainkan Efek Shatter Sekarang (di Map)
 * @desc Mainkan efek kaca pecah secara manual di tempat, tanpa pindah map. Hanya berfungsi saat berada di map (Scene_Map).
 *
 * @command SetBattleTransitionEnabled
 * @text Aktif/Nonaktifkan Transisi Otomatis Sebelum Battle
 * @desc Menyalakan atau mematikan efek shatter otomatis sebelum battle. Berlaku terus sampai diubah lagi lewat command ini.
 *
 * @arg enabled
 * @type boolean
 * @text Aktifkan?
 * @default true
 *
 * @help
 * ============================================================================
 * UT_ShatteredBattleTransition — Efek Transisi Kaca Pecah
 * ============================================================================
 *
 * Plugin ini menambahkan efek transisi "layar pecah seperti kaca" yang bisa
 * dipakai untuk dua hal:
 *
 * 1. TRANSISI SEBELUM BATTLE (otomatis)
 *    Setiap kali terjadi encounter/battle biasa, layar map akan "pecah" lalu
 *    menyingkap layar battle di baliknya. Fitur ini AKTIF secara default.
 *    Bisa dimatikan lewat parameter "Aktifkan Transisi Sebelum Battle", atau
 *    diubah kapan saja saat game berjalan lewat Plugin Command
 *    "Aktif/Nonaktifkan Transisi Otomatis Sebelum Battle".
 *
 * 2. TELEPORT DENGAN EFEK SHATTER (manual, lewat Plugin Command)
 *    Gunakan Plugin Command "Teleport dengan Efek Shatter" di dalam event
 *    untuk memindahkan player ke map lain, dengan layar map yang sekarang
 *    "pecah" dan menyingkap map tujuan di baliknya — mengganti fade hitam
 *    bawaan RPG Maker. Isi koordinat X/Y dan arah hadap seperti event
 *    command "Transfer Player" biasa.
 *
 *    Untuk field "Map Tujuan", kamu BEBAS isi:
 *      - Nama map persis seperti tampil di daftar Map (mis. "Goa Gelap"),
 *        tidak peduli huruf besar/kecil. TIDAK PERLU tahu nomor ID lagi.
 *      - ATAU nomor ID map kalau lebih suka cara lama (mis. 3).
 *    Kalau nama map yang diisi tidak ketemu, teleport dibatalkan (dicatat
 *    di console, tidak bikin game crash).
 *
 * 3. EFEK SHATTER MANUAL DI TEMPAT (opsional)
 *    Plugin Command "Mainkan Efek Shatter Sekarang" akan memecahkan tampilan
 *    map yang sedang berjalan lalu menyingkapnya kembali di tempat yang sama
 *    (tanpa pindah map) — cocok untuk efek dramatis di tengah cutscene.
 *    Hanya berfungsi saat pemain sedang berada di map.
 *
 * ============================================================================
 * Cara pakai Plugin Command
 * ============================================================================
 * Di editor event, pilih "Plugin Command" (bukan "Script"), pilih plugin ini,
 * lalu pilih salah satu dari tiga command di atas dan isi argumennya.
 *
 * Untuk RPG Maker MV, karena tidak ada Plugin Command bergaya MZ, gunakan
 * teks Plugin Command lama berikut ini (dipisah spasi):
 *   ShatterTeleport <mapTarget> <x> <y> <direction>
 *     contoh pakai ID   : ShatterTeleport 3 10 8 2
 *     contoh pakai nama : ShatterTeleport Goa_Gelap 10 8 2
 *     (kalau nama map ada spasinya, ganti spasi dengan underscore _)
 *   ShatterTransitionNow
 *   ShatterBattleTransition <true|false>
 *
 * ============================================================================
 * Catatan
 * ============================================================================
 * - Efek ini tidak berjalan saat mode Battle Test (bawaan dari plugin asli).
 * - Untuk teleport, fade bawaan RPG Maker otomatis dimatikan (fadeType diatur
 *   ke "None") supaya tidak dobel dengan efek shatter.
 * - Jika battle dipicu lewat event command "Battle Processing" (bukan
 *   encounter acak di map), plugin akan otomatis melewati efek shatter untuk
 *   battle tersebut (tidak crash) karena belum ada snapshot yang disiapkan
 *   untuk momen itu — pakai encounter acak biasa untuk transisi otomatis.
 * ============================================================================
 * Riwayat Versi
 * ============================================================================
 * v2.0 - Rilis dasar oleh utunnels (efek shatter sebelum battle, otomatis).
 * v2.1 - Tambah Plugin Command: teleport dengan efek shatter, trigger manual
 *        di tempat, dan toggle aktif/nonaktif transisi battle. Tambah
 *        pengaman supaya tidak crash bila battle dipicu tanpa snapshot
 *        (mis. lewat "Battle Processing").
 * v2.2 - Field "Map Tujuan" pada Teleport with Transition sekarang bisa diisi
 *        NAMA map (sesuai daftar Map di editor), tidak wajib pakai nomor ID
 *        lagi. Mengetik nomor ID masih tetap didukung (mundur-kompatibel).
 * v2.3 - Tambah pengaman: kalau scene Map sempat di-reload/diganti lagi oleh
 *        plugin lain sementara animasi shatter masih berjalan (menyebabkan
 *        sprite/mesh transisi jadi tidak valid), animasi dihentikan dengan
 *        aman alih-alih membuat game crash (TypeError: Cannot read property
 *        'position' of null).
 * ============================================================================
 */

(function(){if (!DataManager.isBattleTest()){

const isMV = Utils.RPGMAKER_NAME == 'MV';
const isMZ = Utils.RPGMAKER_NAME == 'MZ';
const isUnknown = !isMV && !isMZ;
if(isUnknown) throw 'Unknown RPG Maker: RPGMAKER_NAME = ' + Utils.RPGMAKER_NAME;

const pluginName = 'UT_ShatteredBattleTransition';
const pluginParams = PluginManager.parameters(pluginName);

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

function ShatteredPicture(unused1, unused2){
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
    // Pengaman: kalau mesh ini sudah di-destroy (mis. scene diganti/reload
    // di tengah animasi oleh plugin lain), transform-nya jadi null.
    // Lewati saja daripada bikin game crash.
    if (!mesh || !mesh.transform) return;
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
    group.forEach(function(p,i){
      drawPolygon(i,vgroup[i]);
      moveVector(vgroup[i]);
    });
    this.frameCount++;
  };
}

var transitionFn = ShatteredPicture;
var transitionTime = Number(pluginParams.TransitionDuration || 200);

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
  var picture = SceneManager._transitionPicture;
  // Pengaman: kalau scene sudah berganti/reload lagi di tengah animasi
  // (mis. dipicu plugin lain) sehingga sprite transisi sudah rusak/lepas,
  // hentikan animasi dengan aman daripada bikin game crash.
  var spriteAlive = _this && _this._prevSceneSprite && _this._prevSceneSprite.transform;
  if (!picture || !spriteAlive) {
    mapTransitionActive = false;
    SceneManager._transitionPicture = null;
    return;
  }
  if(picture.frameCount<transitionTime){
    if(picture.needSnapUpdate){
      _this._prevSceneSprite.visible= false;
      picture.backgroundImage = Bitmap.fastSnap(_this,1);
      _this._prevSceneSprite.visible = true;
    }
    picture.refreshScene();
  }else{
    if (_this._prevSceneSprite.parent) _this.removeChild(_this._prevSceneSprite);
    SceneManager._transitionPicture = null;
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
    if(this._encounterEffectDuration===2 && battleTransitionEnabled){
      prepareTransitionEffect();
    }
}
};

//-----------------------------------------------------------------------------
// Flag & default nilai untuk fitur baru (toggle battle transition, teleport,
// dan trigger manual di map)
//-----------------------------------------------------------------------------
var battleTransitionEnabled = String(pluginParams.EnableBattleTransition) !== 'false';
var pendingMapTransition = false;
var mapTransitionActive = false;

(function(alias){
Scene_Battle.prototype.start = function() {
  //this.startFadeIn(this.fadeSpeed(), false);
  alias.call(this);
  // Pengaman: kalau battle dipicu tanpa lewat encounter effect di map
  // (misalnya lewat event command "Battle Processing"), belum ada snapshot
  // yang disiapkan (SceneManager._transitionPicture kosong) — daripada
  // error, efek shatter untuk battle itu dilewati saja.
  if (battleTransitionEnabled && SceneManager._transitionPicture) {
    startTransitionEffect();
  }
};
})(Scene_Battle.prototype.start);
  
(function(alias){
Scene_Battle.prototype.update = function() {
  alias.call(this);
  if (SceneManager._transitionPicture && this._prevSceneSprite) {
    updateTransitionEffect();
  }
};
})(Scene_Battle.prototype.update);

//-----------------------------------------------------------------------------
// Scene_Map: dipakai untuk efek shatter saat TELEPORT dan trigger manual
// (mengikuti pola yang sama persis dengan Scene_Battle di atas).
//-----------------------------------------------------------------------------
(function(alias){
Scene_Map.prototype.start = function() {
  alias.call(this);
  if (pendingMapTransition) {
    pendingMapTransition = false;
    startTransitionEffect();
    mapTransitionActive = true;
  }
};
})(Scene_Map.prototype.start);

(function(alias){
Scene_Map.prototype.update = function() {
  alias.call(this);
  if (mapTransitionActive && SceneManager._transitionPicture) {
    var pictureBefore = SceneManager._transitionPicture;
    updateTransitionEffect();
    // updateTransitionEffect bisa menyelesaikan/membatalkan transisi dan
    // mereset SceneManager._transitionPicture jadi null di dalamnya —
    // cek dulu sebelum baca propertinya lagi.
    if (!SceneManager._transitionPicture || pictureBefore.frameCount >= transitionTime) {
      mapTransitionActive = false;
    }
  }
};
})(Scene_Map.prototype.update);

if(Utils.RPGMAKER_NAME == 'MV'){
  (function(alias){
  SceneManager.onSceneLoading = function() {
    if(this._scene instanceof Scene_Battle) return;
    alias.call(this);
  };
  })(SceneManager.onSceneLoading);
}

//-----------------------------------------------------------------------------
// Fungsi inti untuk tiga fitur baru (dipanggil dari Plugin Command MZ
// maupun dari Plugin Command teks lama di MV)
//-----------------------------------------------------------------------------
// Cari Map ID dari nama map (persis seperti tampil di daftar Map editor),
// atau langsung pakai angkanya kalau yang diisi memang berupa nomor ID.
// $dataMapInfos tersedia sejak boot (tidak perlu load map dulu).
function resolveMapId(mapTarget){
  if (mapTarget === undefined || mapTarget === null || mapTarget === '') return 0;
  var asNumber = Number(mapTarget);
  if (!isNaN(asNumber) && Number.isInteger(asNumber) && asNumber > 0) {
    return asNumber;
  }
  var target = String(mapTarget).trim().toLowerCase();
  var infos = window.$dataMapInfos || [];
  for (var i = 0; i < infos.length; i++) {
    var info = infos[i];
    if (info && info.name && String(info.name).trim().toLowerCase() === target) {
      return info.id;
    }
  }
  return 0; // tidak ketemu
}

function doTeleportWithTransition(mapTarget, x, y, direction){
  if (!(SceneManager._scene instanceof Scene_Map)) return;
  var mapId = resolveMapId(mapTarget);
  if (!mapId || mapId < 1) {
    console.warn('[UT_ShatteredBattleTransition] Map tujuan tidak ditemukan: ' + mapTarget);
    return;
  }
  prepareTransitionEffect();
  pendingMapTransition = true;
  // fadeType 2 = None, supaya tidak dobel dengan fade hitam bawaan RPG Maker
  $gamePlayer.reserveTransfer(mapId, x, y, direction || 0, 2);
}

function doPlayTransitionNow(){
  if (!(SceneManager._scene instanceof Scene_Map)) return;
  prepareTransitionEffect();
  startTransitionEffect();
  mapTransitionActive = true;
}

function doSetBattleTransitionEnabled(enabled){
  battleTransitionEnabled = !!enabled;
}

//-----------------------------------------------------------------------------
// Plugin Command (RPG Maker MZ)
//-----------------------------------------------------------------------------
if (isMZ) {
  PluginManager.registerCommand(pluginName, 'TeleportWithTransition', function(args){
    const mapTarget = args.mapTarget;
    const x = Number(args.x);
    const y = Number(args.y);
    const direction = Number(args.direction || 0);
    doTeleportWithTransition(mapTarget, x, y, direction);
  });

  PluginManager.registerCommand(pluginName, 'PlayTransitionNow', function(){
    doPlayTransitionNow();
  });

  PluginManager.registerCommand(pluginName, 'SetBattleTransitionEnabled', function(args){
    doSetBattleTransitionEnabled(args.enabled === 'true' || args.enabled === true);
  });
}

//-----------------------------------------------------------------------------
// Plugin Command lama bergaya teks (RPG Maker MV)
//-----------------------------------------------------------------------------
if (isMV) {
  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'ShatterTeleport') {
      // Karena command teks lama dipisah oleh spasi, kalau nama map ada
      // spasinya, ganti dulu spasinya jadi underscore (_) saat menulis
      // command-nya, mis: ShatterTeleport Goa_Gelap 10 8 2
      const mapTarget = String(args[0] || '').replace(/_/g, ' ');
      const x = Number(args[1]);
      const y = Number(args[2]);
      const direction = Number(args[3] || 0);
      doTeleportWithTransition(mapTarget, x, y, direction);
    } else if (command === 'ShatterTransitionNow') {
      doPlayTransitionNow();
    } else if (command === 'ShatterBattleTransition') {
      const val = String(args[0] || '').toLowerCase();
      doSetBattleTransitionEnabled(val === 'true' || val === 'on' || val === '1');
    }
  };
}

}})();//if (!DataManager.isBattleTest())
