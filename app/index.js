//LIBS
import React 	from 'react';
import ReactDOM from 'react-dom';

//MY ENGINES
import game 		from './game_engine';
import user 		from './user_engine';
import multiplayer 	from './multiplayer_engine';

//COMPONENTS
import Nav from './components/nav.jsx';

//CSS

require("./style.css")

var appendHtml = function(el, str) {
  var div = document.createElement('div');
  div.innerHTML = str;
  while (div.children.length > 0) el.appendChild(div.children[0])
  div = null
}

var createMainDom = function() {

	var html  = '<div class="gametable-container">'
	  	html += 	'<div id="gametable"></div>'
	    html += 	'<div id="winner_text">'
	    html +=  		'<h5 class="winner_title" style="margin-top:100px;">Welcome to Connect4 Online, </h5>'
	    html +=  		'<h5 class="winner_title">to win you have to connect 4 balls</h5>'
	    html +=  		'<h5 class="winner_title">vertically, horizontally</h5>'
	    html +=  		'<h5 class="winner_title"> or diagonally</h5>'
	    html +=		'</div>'
	  	html +=	'</div>'
		html +=	'<div id="gametoolbar"></div>'
		html += '<div id="gamemodal"></div>'
		html +=	'<div id="active_user_token"></div>'
		html +=	'<video id="remoteVideo" autoplay controls></video>'
	  	html += '<div id="remoteVideoDisclaimer">WAITING FOR CAMERA</div>'
	  	appendHtml(document.body, html);
}

var createMinimalDom = function() {
	var html  = '<video id="mainVideo" autoplay></video>'
		html += '<div id="closeIcon"></div>'
	  	html += '<div id="remoteVideoDisclaimer">WAITING FOR CAMERA</div>'
	  	appendHtml(document.body, html);
}

var createAndroidBlocker = function() {
	var app_prot = "me.starpy.connect4://"
	var app_link = window.location.href.replace("https://",app_prot)
	var html  = '<div class="container parent-vertical heading-info">'
		html += '<div class="jumbotron">'
		html += 	'<div class="container">'
		html += 	'<img src="https://twemoji.maxcdn.com/svg/1f479.svg" style="width:150px;height:150px;padding:0 5px;opacity:0.9">'
		html += 	'<h1 style="font-size:60px;" class="winner_title">Try the Connect4 2.0 <br> Android App!</h1>'
		html += 	'<a class="btn btn-primary btn-lg" style="background-color:indianred;font-family:\'Cabin Sketch\';font-weight:bold;" href="'+app_link+'">Touch Here to Open!</a>'
		html += 	'</div>'
		html += '</div>'
		html += '</div>'
	  	appendHtml(document.body, html);
}

var instance = 
{
	init() 
	{
		if(navigator.userAgent.search("Android") > -1 && navigator.userAgent.search("me.starpy.connect4") == -1) return createAndroidBlocker();
		createMainDom()
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
		window.copyToClipboard 		= multiplayer.copyToClipboard

		ReactDOM.render(React.createElement(Nav, {game:this, restart:{}}), this.navbar);

		this.player_one = this.initUser();
		var self = this
		if(this.player_one.is_new) return this.openColorDialog()
		.then(function(){ 
			return self.bindMultiplayer()
		})
		this.bindMultiplayer()


		return this;
	}
}

new instance.init()

