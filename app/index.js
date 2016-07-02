//LIBS
import React 	from 'react';
import ReactDOM from 'react-dom';

//MY ENGINES
import game 		from './game_engine';
import user 		from './user_engine';
import multiplayer 	from './multiplayer_engine';

//COMPONENTS
import Nav from './components/nav.jsx';

var instance = 
{
	init() 
	{
		this.width 					= 600;
		this.height 				= 400;
		this.tile_size 				= 100;
		this.engine 				= game.name
		this.game_count 			= 0;
		this.mode 					= 'single'
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
		this.createSession 			= multiplayer.createSession.bind(this)
		this.bindMultiplayer 		= multiplayer.bindMultiplayer.bind(this)
		this.openSession 			= multiplayer.openSession.bind(this)
		this.getLocalStream 		= multiplayer.getLocalStream.bind(this)
		this.createOffer 			= multiplayer.createOffer.bind(this)
		this.gotLocalDescription	= multiplayer.gotLocalDescription.bind(this)
		this.gotRemoteStream 		= multiplayer.gotRemoteStream.bind(this)
		this.gotIceCandidate 		= multiplayer.gotIceCandidate.bind(this)
		this.createAnswer 			= multiplayer.createAnswer.bind(this)
		this.help 					= '1) to start a new game run game.startGame() \n'
									+ '2) to set game mode edit game.mode \n'
									+ 'available options are "single", "multi" and "hot" '
									+ '3) to make a turn run game.updateColumn(column_id) \n'
									+ '4) to edit your player info edit game.player_one \n'
									+ 'the icon will update on turn change ;) '

		ReactDOM.render(React.createElement(Nav, {game:this}), this.navbar);

		this.player_one = this.initUser();
		this.bindMultiplayer()
		return this;
	}
}

window.Connect4 = instance.init
