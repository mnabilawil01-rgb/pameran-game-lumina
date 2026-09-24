//=============================================================================
// MOG_CharacterPoses.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc (v1.3) Ativa poses de corrida e espera para o seu personagem.
 * @author Moghunter
 * @url https://mogplugins.com
 *
 * @param Dash Pose
 * @desc Ativar pose de corrida.
 * @text Dash Pose
 * @default true
 * @type boolean
 *
 * @param Idle Pose
 * @desc Ativar pose de espera.
 * @text Idle Pose
 * @default true
 * @type boolean 
 *
 * @param Idle Wait Time
 * @desc Tempo para ativar a animação de espera.
 * @default 90
 * @min 5
 *
 * 
 * @help  
 * =============================================================================
 * +++ MOG - Character Poses (v1.3) +++
 * Author   -   Moghunter
 * Version  -   1.0
 * Updated  -   2025/10/26 
 * https://mogplugins.com
 * =============================================================================
 * Ativa poses de corrida e espera para o seu personagem.
 * 
 * =============================================================================
 * UTILIZAÇÂO
 * =============================================================================
 * É necessário ter as seguintes imagens para o seu personagem.
 *
 * CHARACTER_NAME + _Dash.png
 * CHARACTER_NAME + _Idle.png
 * 
 * Exemplo
 *
 * ACTOR1_Dash.png
 * ACTOR1_Idle.png
 *
 * Lembre-se de deixar a imagem da pose de seu personagem com a mesma index da
 * imagem original.
 *
 * =============================================================================
 * Vesrion History 
 * ============================================================================= 
 * (v1.3) - Melhoria do tempo para ativar a posição de espera.
 * (v1.2) - Melhoria do código.  
 * (v1.1) - Correção de ativar a animação de Idle quando um evento estiver 
 * rodando. 
 */

//=============================================================================
// ** PLUGIN PARAMETERS
//=============================================================================
　　var Imported = Imported || {};
　　Imported.MOG_CharacterPoses = true;
　　var Moghunter = Moghunter || {}; 

  　Moghunter.parameters = PluginManager.parameters('MOG_CharacterPoses');
   Moghunter.charPose_dashPose = String(Moghunter.parameters['Dash Pose'] || true); 
   Moghunter.charPose_idlePose = String(Moghunter.parameters['Idle Pose'] || true); 
   Moghunter.charPose_idleTime = String(Moghunter.parameters['Idle Wait Time'] || 90); 
   
    
//=============================================================================
// ■■■ Game Temp ■■■
//=============================================================================

//==============================
//  File Exist
//==============================
Game_Temp.prototype.fileExist = function(fileName,folder) {
    var fs = require('fs');
	var path = './img/' + String(folder) + "/" + String(fileName) + ".png";
	return fs.existsSync(path);
};

//=============================================================================
// ■■■ Game Character Base ■■■
//=============================================================================

//==============================
// ♦ ALIAS ♦  InitMembers
//==============================
var _mog_charPoses_initMembers = Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function() {
	_mog_charPoses_initMembers.call(this) 
	this.charPosesInitSetup();
};

//==============================
//  charPosesInitSetup
//==============================
Game_CharacterBase.prototype.charPosesInitSetup = function() {
	this._pose = {};
	this._pose.actor = null;
	this._pose.enabled = false;
	this._pose.originalFileName = null;
	this._pose.originalIndex = null;
	this._pose.pose = -1;
	this._pose.loadTime = 0;
	this._pose.moveLag = 5;
	this._pose.poseIndex = 0;	
	this._pose.duration = 0;
	this._pose.idleEnabled = false;
	this._pose.idleLagTimeDur = Number(Moghunter.charPose_idleTime);
	this._pose.idleLagTime = this._pose.idleLagTimeDur;
	this._pose.needRefresh = false;
	this._pose.needRename = false;
	this._pose.dashPoseEnabled = String(Moghunter.charPose_dashPose) == "true" ? true : false;
	this._pose.idlePoseEnabled = String(Moghunter.charPose_idlePose) == "true" ? true : false;
};

//==============================
//  getOriginalFileName
//==============================
Game_CharacterBase.prototype.getOriginalFileName = function(actor) {
	if (!actor) {return null};
	return actor.characterName();
};
	
//==============================
//  org Name
//==============================
Game_CharacterBase.prototype.orgName = function() {	
	return this._pose.originalFileName;
};

//==============================
//  char Pose Enable
//==============================
Game_CharacterBase.prototype.charPoseEnable = function(actor) {
     this._pose.originalFileName = this.getOriginalFileName(actor);
	 if (this._pose.originalFileName && this._pose.originalIndex == null) {
		 this._pose.originalIndex = actor.characterIndex();
	 };
	 this._pose.originalIndex = this._pose.originalFileName ? actor.characterIndex() : 0;	 
	 this._pose.enabled = this._pose.originalFileName ? true : false;	 
	 this._pose.actor = this._pose.enabled ? actor : null;
	 if (this._pose.enabled) {this.preLoadBasicPosesImg()};
};

//==============================
//  preLoadBasicPosesImg
//==============================
Game_CharacterBase.prototype.preLoadBasicPosesImg = function() {
    this.preLoadPoseFiles("_Dash")
    this.preLoadPoseFiles("_Idle")
};

//==============================
//  preLoadPoseFiles
//==============================
Game_CharacterBase.prototype.preLoadPoseFiles= function(pose) {
     var SufixName = pose;
	 var name = this._pose.originalFileName;
	 var fileName = String(name) + String(SufixName)
	 var folder = "characters"
     var exist = $gameTemp.fileExist(fileName,folder);	 
	 if (exist) {		 
	     var imgTemp = ImageManager.loadCharacter(fileName); 
	 };	  
};

//==============================
//  refreshPoses
//==============================
Game_CharacterBase.prototype.refreshPoses = function() {	
    this._pose.pose = this._pose.poseIndex;
	this._pose.needRefresh = false;
	this.setCharPoses();
};

//==============================
//  set Image
//==============================
var _mog_charPose_gchar_base_setImage = Game_CharacterBase.prototype.setImage;
Game_CharacterBase.prototype.setImage = function(characterName,characterIndex) {
	_mog_charPose_gchar_base_setImage.call(this,characterName,characterIndex);	
	if (this._pose.needRename && this._pose.actor) {
		this._pose.originalFileName = this._characterName 
		this._pose.originalIndex = this._characterIndex;		
		this._pose.needRename = false;
		if (this._pose.enabled) {this.preLoadBasicPosesImg()};
	};
};

//==============================
//  update Move
//==============================
var _mog_chaPose_gcharbase_updateMove = Game_CharacterBase.prototype.updateMove;
Game_CharacterBase.prototype.updateMove = function() {
	_mog_chaPose_gcharbase_updateMove.call(this);
	 this._pose.moveLag = 1;
	 this._pose.idleEnabled = false;
	 this._pose.idleLagTime = this._pose.idleLagTimeDur;
};

//==============================
//  setCharPoses
//==============================
Game_CharacterBase.prototype.setCharPoses = function() {	
     var SufixName = this.getpPoseSufix();
	 var name = this._pose.originalFileName;
	 var fileName = String(name) + String(SufixName)
	 var folder = "characters"
     var exist = $gameTemp.fileExist(fileName,folder);	 
	 if (exist) {		 
		 this._pose.needRename = false;
		 this.setImage(fileName,this._pose.originalIndex);		 
	 };
};

//==============================
//  getpPoseSufix
//==============================
Game_CharacterBase.prototype.getpPoseSufix = function() {
	if (this._pose.pose == 1) {this.poseActionSufix();
	} else if (this._pose.pose == 2) {return "_Dead";
	} else if (this._pose.pose == 3) {return "_Damage";
	} else if (this._pose.pose == 4) {return "_Pick";
	} else if (this._pose.pose == 5) {return "_Thrown";
	} else if (this._pose.pose == 6) {return "_Heal";
	} else if (this._pose.pose == 7) {return "_Dash";
	} else if (this._pose.pose == 8) {return "_Jump";
	} else if (this._pose.pose == 9) {return "_Fall";
	} else if (this._pose.pose == 0) {return "_Idle";
	} else {return "";
	};
};

//==============================
//  poseActionSufix
//==============================
Game_CharacterBase.prototype.poseActionSufix = function() {
     return "_act"
};

//==============================
//  isPoseActing
//==============================
Game_CharacterBase.prototype.isPoseActing = function() {
	 return false;
};

//==============================
//  isPoseDamage
//==============================
Game_CharacterBase.prototype.isPoseDamage = function() {
	 return false;
};

//==============================
//  isPoseDead
//==============================
Game_CharacterBase.prototype.isPoseDead = function() {
	 return false;
};

//==============================
// isPosePickUP
//==============================
Game_CharacterBase.prototype.isPosePickUP = function() {
	 return false;
};

//==============================
// isPoseThrown
//==============================
Game_CharacterBase.prototype.isPoseThrown = function() {
	 return false;
};

//==============================
// isPoseHealing
//==============================
Game_CharacterBase.prototype.isPoseHealing = function() {
	 return false;
};

//==============================
// isPoseDashing
//==============================
Game_CharacterBase.prototype.isPoseDashing = function() {
	 if (!this._pose.dashPoseEnabled) {return false};
	 if (this._pose.moveLag == 0) {return false};
	 if (this._memberIndex != null) {return $gamePlayer.isDashing()};
     return this.isDashing() ;
};

//==============================
// isPoseJumping
//==============================
Game_CharacterBase.prototype.isPoseJumping = function() {
     return false;
};

//==============================
// poseFalling
//==============================
Game_CharacterBase.prototype.isPoseFalling = function() {
     return false;
};

//==============================
// pose Sick
//==============================
Game_CharacterBase.prototype.isPoseSick = function() {
     return false;
}; 

//==============================
// pose Idle
//==============================
Game_CharacterBase.prototype.isPoseIdle = function() {
	if (!this._pose.idlePoseEnabled) {return false};
    return !this.isMoving() && this._pose.idleEnabled;
};

//==============================
//  update Pose Index
//==============================
Game_CharacterBase.prototype.updatePoseIndex = function() {
	  if (this._moveRoute) {
		  this._pose.poseIndex = -1;
       } else if (this.isPoseActing()) {
	      this._pose.poseIndex = 1;
	  } else if (this.isPoseDead()) {
	      this._pose.poseIndex = 2; 
	  } else if (this.isPoseDamage()) {
		  this._pose.poseIndex = 3;
	  } else if (this.isPosePickUP()) {
		  this._pose.poseIndex = 4;
	  } else if (this.isPoseThrown()) {	  
		  this._pose.poseIndex = 5;
	  } else if (this.isPoseHealing()) {
	      this._pose.poseIndex = 6;
	  } else if (this.isPoseDashing()) {
		  this._pose.poseIndex = 7;
	  } else if (this.isPoseJumping()) {
		  this._pose.poseIndex = 8;
	  } else if (this.isPoseFalling()) {
		  this._pose.poseIndex = 9;
	  } else if (this.isPoseSick()) {	  
		  this._pose.poseIndex = 10;
	  } else if (this.isPoseIdle()) {
		  this._pose.poseIndex = 0;
	  } else {
		  this._pose.poseIndex = -1;
	  };
};

//==============================
//  pdate Pose Wait
//==============================
Game_CharacterBase.prototype.updatePoseWait = function() {
	 if (this._pose.idleLagTime > 0) {
		 this._pose.idleLagTime -= 1;
		 if (this._pose.idleLagTime == 0) {
			 this._pose.idleEnabled = true}; 
	 };
	 if (!this._pose.idleEnabled) {this._stepAnime = false};
};

//==============================
//  updatePoseAnimation
//==============================
Game_CharacterBase.prototype.updatePoseAnimation = function() {
	if (this._pose.idleEnabled) {this._stepAnime = true};
};

//==============================
//  Update Poses
//==============================
Game_CharacterBase.prototype.updatePoses = function() {
	this._pose.needRename = false;
	this.updatePoseIndex();
	if (this._pose.poseIndex == -1) {
		this.updatePoseWait();
	} else {
		this.updatePoseAnimation();
	}
	this._pose.needRename = true;
	if (this._pose.moveLag > 0) {this._pose.moveLag -= 1};
};

//==============================
//  needRefreshPoses
//==============================
Game_CharacterBase.prototype.needRefreshPoses = function() {
   if (this._pose.poseIndex != this._pose.pose) {return true};   
   if (this._pose.needRefresh) {return true};
   return false;
};

//==============================
//  canUpdatePosesBase
//==============================
Game_CharacterBase.prototype.canUpdatePosesBase = function() {
   if (!this._pose.enabled) {return false};
   if (!this._pose.actor) {return false};
   if ($gameMap.isEventRunning()) {return false};
   return true;
};


//==============================
//  needResetPoses
//==============================
Game_CharacterBase.prototype.needResetPoses = function() {
 if (!this._pose.enabled) {return false};
 if (this._pose.poseIndex != -1) {return true};
 if (this._pose.pose != -1) {return true};
 return false;
};

//==============================
//  resetPoses
//==============================
Game_CharacterBase.prototype.resetPoses = function() {
	this._pose.poseIndex = -1;
	this._pose.pose = this._pose.poseIndex;
    this._pose.idleEnabled = false;
	this._stepAnime = false;
	this._pose.idleLagTime = this._pose.idleLagTimeDur;
	this.refreshPoses();
};

//==============================
//  Update
//==============================
var _mog_charPoses_gchar_base_update = Game_CharacterBase.prototype.update;
Game_CharacterBase.prototype.update = function() {
	_mog_charPoses_gchar_base_update.call(this);
	if (this.canUpdatePosesBase()) {
		this.updatePoses()
	} else {
		if (this.needResetPoses()) {
		    this.resetPoses();
		};
	};
	if (this.needRefreshPoses()) {this.refreshPoses()};
	
};

//=============================================================================
// ■■■ Game Player ■■■
//=============================================================================

//==============================
//  Refresh
//==============================
var _mog_charPoses_gPlayer_refresh = Game_Player.prototype.refresh;
Game_Player.prototype.refresh = function() {
	_mog_charPoses_gPlayer_refresh.call(this);
	var actor = $gameParty.leader();
	this.charPoseEnable(actor);
};

//=============================================================================
// ■■■ Game Follower  ■■■
//=============================================================================

//==============================
//  Refresh
//==============================
var _mog_charPoses_gFollower_refresh = Game_Follower.prototype.refresh;
Game_Follower.prototype.refresh = function() {
	_mog_charPoses_gFollower_refresh.call(this);
	if (this.isVisible()) {
	    var actor = this.actor();
	    this.charPoseEnable(actor);
	};
};