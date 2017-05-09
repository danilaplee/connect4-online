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
  while (div.children.length > 0) el.append(div.children[0])
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
	var html  = '<div class="parent-vertical header-info">'
		html += '<div class="jumobtron">'
		html += 	'<div class="container">'
		html += 	'<img src="https://twemoji.maxcdn.com/svg/1f479.svg" style="width:100px;height:100px;padding:0 5px;">'
		html += 	'<h1>Please open the android app:</h1>'
		html += 	'<a class="btn btn-primary btn-lg" href="'+window.location.href+'">Click here!</a>'
		html += 	'</div>'
		html += '</div>'
		html += '</div>'
	  	appendHtml(document.body, html);
}

var instance = 
{
	init() 
	{
		if(navigator.userAgent.search("Android") > -1 && navigator.userAgent.search("me.starpy.connect4") == -1)
		{
			return createAndroidBlocker();
		}
		if(window.location.hash.search('#call') > -1)
		{
			createMinimalDom();
			this.mode 					= 'multi'
			this.is_second_window 		= true;
			this.initUser				= user.initUser.bind(this);
			this.player_one 			= this.initUser();
			this.remoteVideo 			= document.getElementById('mainVideo')
			this.remoteVideoDisclaimer 	= document.getElementById('remoteVideoDisclaimer')
			this.enableMainWindow 		= multiplayer.enableMainWindow.bind(this)
			this.createSession 			= multiplayer.createSession.bind(this)
			this.bindMultiplayer 		= multiplayer.bindMultiplayer.bind(this)
			this.openSession 			= multiplayer.openSession.bind(this)
			this.getLocalStream 		= multiplayer.getLocalStream.bind(this)
			this.createOffer 			= multiplayer.createOffer.bind(this)
			this.gotLocalDescription	= multiplayer.gotLocalDescription.bind(this)
			this.gotRemoteStream 		= multiplayer.gotRemoteStream.bind(this)
			this.gotIceCandidate 		= multiplayer.gotIceCandidate.bind(this)
			this.createAnswer 			= multiplayer.createAnswer.bind(this)
			this.bindMultiplayer()
			return this;
		}
		localStorage.removeItem("connection_offer")
		createMainDom()
		this.drop_speed 			= 4;
		this.width 					= 600;
		this.height 				= 400;
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
		this.addHotSeat		 		= user.addHotSeat.bind(this)
		this.openSecondWindow 		= multiplayer.openSecondWindow.bind(this)
		this.beginGame 				= multiplayer.beginGame.bind(this)
		this.createSession 			= multiplayer.createSession.bind(this)
		this.bindMultiplayer 		= multiplayer.bindMultiplayer.bind(this)
		this.openSession 			= multiplayer.openSession.bind(this)
		this.getLocalStream 		= multiplayer.getLocalStream.bind(this)
		this.createOffer 			= multiplayer.createOffer.bind(this)
		this.gotLocalDescription	= multiplayer.gotLocalDescription.bind(this)
		this.gotRemoteStream 		= multiplayer.gotRemoteStream.bind(this)
		this.gotIceCandidate 		= multiplayer.gotIceCandidate.bind(this)
		this.createAnswer 			= multiplayer.createAnswer.bind(this)
		this.copyToClipboard 		= multiplayer.copyToClipboard.bind(this)
		this.help 					= '1) to start a new game run game.startGame() \n'
									+ '2) to set game mode edit game.mode \n'
									+ 'available options are "single", "multi" and "hot" '
									+ '3) to make a turn run game.updateColumn(column_id) \n'
									+ '4) to edit your player info edit game.player_one \n'
									+ 'the icon will update on turn change ;) '

		ReactDOM.render(React.createElement(Nav, {game:this, restart:{}}), this.navbar);

		this.player_one = this.initUser();
		this.bindMultiplayer()
		return this;
	}
}

window.Connect4 = new instance.init()
window.game = Connect4
