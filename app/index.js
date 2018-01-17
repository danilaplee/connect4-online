//LIBS
import React 	from 'react';
import ReactDOM from 'react-dom';

//FUNCTIONAL PROGRAMMING LIBS
// global.Olm = require('../node_modules/olm/olm.js');
import game 		from './game_engine';
import user 		from './user_engine';
import multiplayer 	from './multiplayer_engine';
import dom 			from "./dom_engine";

//COMPONENTS
import Nav from './components/nav.jsx';

//CSS
require("../node_modules/botui/build/botui.min.css")
require("../node_modules/botui/build/botui-theme-default.css")
require("./style.css")
//OBJECTIVE GAME INSTANCE
var instance = 
{
	init() 
	{
		if(navigator.userAgent.search("Android") > -1 && navigator.userAgent.search("me.starpy.connect4") == -1) return dom.createAndroidBlocker();
		dom.createMainDom()
		this.drop_speed 			= 4;
		this.width 					= 800;
		this.height 				= 500;
		this.tile_size 				= 100;
		this.engine 				= game.name
		this.game_count 			= 0;
		this.mode 					= 'single'
		this.restart 				= {}
		this.winner_text 			= document.getElementById('winner_text')
		this.gametable				= document.getElementById('gametable')
		this.navbar   				= document.getElementById('gametoolbar')
		this.modal_container 		= document.getElementById('gamemodal')
		this.gamechat 				= document.getElementById('gamechat')
		this.user_token 			= document.getElementById('active_user_token')
		this.remoteVideo 			= document.getElementById('remoteVideo')
		this.remoteVideoDisclaimer 	= document.getElementById('remoteVideoDisclaimer')
		this.createCanvas 			= game.createCanvas.bind(this);
		this.animate 	 			= game.animate.bind(this);
		this.createLevel 			= game.createLevel.bind(this);
		this.startGame 	 			= game.startGame.bind(this);
		this.updateColumn			= game.updateColumn.bind(this);
		this.animateFall 			= game.animateFall.bind(this);
		this.switchTurn  			= game.switchTurn.bind(this);
		this.findWinner  			= game.findWinner.bind(this);
		this.endGame  	 			= game.endGame.bind(this);
		this.makeAiTurn				= game.makeAiTurn.bind(this);
		this.openColorDialog		= user.openColorDialog.bind(this);
		this.initUser				= user.initUser.bind(this);
		this.addHotSeat		 		= user.addHotSeat.bind(this);

		//NEW MULTIPLAYER
		this.createSession 			= multiplayer.createSession.bind(this)
		this.bindMultiplayer 		= multiplayer.bindMultiplayer.bind(this)
		this.ajaxReq				= multiplayer.ajaxReq.bind(this)
		this.getUser 				= user.getUser.bind(this)
		this.getUserById 			= user.getUserById.bind(this)
		this.registerUser 			= user.registerUser.bind(this)
		this.matrixAuth 			= user.matrixAuth.bind(this)
		this.matrixInit 			= user.matrixInit.bind(this)
		this.setMatrixAvatar 		= user.setMatrixAvatar.bind(this)
		this.timelineUpdate 		= multiplayer.timelineUpdate.bind(this)
		this.assignSecondPlayer 	= multiplayer.assignSecondPlayer.bind(this)
		this.sendRestartMXGame 		= multiplayer.sendRestartMXGame.bind(this)
		this.createMatrixSession 	= multiplayer.createMatrixSession.bind(this)
		this.openMatrixSession 		= multiplayer.openMatrixSession.bind(this)
		this.showNotification 		= multiplayer.showNotification.bind(this)
		this.startMXGame 			= multiplayer.startMXGame.bind(this)
		this.restartMXGame 			= multiplayer.restartMXGame.bind(this)
		this.dropMultiPlayerBall 	= multiplayer.dropMultiPlayerBall.bind(this)
		this.sendMXMessage 			= multiplayer.sendMXMessage.bind(this)
		this.sendBotMessage 		= multiplayer.sendBotMessage.bind(this)
		this.createChatControls 	= dom.createChatControls.bind(this)
		this.createGameControls 	= dom.createGameControls.bind(this)
		this.scrollToBottom 		= dom.scrollToBottom.bind(this)
		window.copyToClipboard 		= dom.copyToClipboard.bind(this)

		ReactDOM.render(React.createElement(Nav, {game:this, restart:{}}), this.navbar);

		this.player_one = this.initUser();
		var self = this
		if(this.player_one.is_new) return this.openColorDialog()
		.then(()=>this.bindMultiplayer())
		this.bindMultiplayer()

		return this;
	}
}

new instance.init()

