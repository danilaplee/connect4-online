//TURN SERVER 
//turnserver --syslog -a -L 127.0.0.1 -L ::1 -E 127.0.0.1 -E ::1 --max-bps=3000000 -f -m 10 --min-port=32355 --max-port=65535 --user=282245111379330808:JZEOEt2V3Qb0y27GRntt2u2PAYA= -r starp.tech --log-file=stdout -v
import React 	from 'react';
import ReactDOM from 'react-dom';
import generateName from 'sillyname';
import matrix	from 'matrix-js-sdk';
import uuid 	from 'uuid';

//COMPONENTS
import basic_modal from './components/basic_modal.jsx';

var PeerConnection 		= window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var IceCandidate 		= window.mozRTCIceCandidate || window.RTCIceCandidate;
var SessionDescription 	= window.mozRTCSessionDescription || window.RTCSessionDescription;
navigator.getUserMedia 	= navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
export default {
	bindMultiplayer()
	{
		var self = this
		if(window.location.hash.search('#multiplayer_session_') > -1 && !this.multiplayer_session_active) 
		{
			this.mode = "multi"
			this.multiplayer_session = window.location.hash.replace("#call", "").replace('#multiplayer_session_', '')
			setTimeout(function(){

				const component_title 	= "Connecting to Multiplayer Session"
				const component_text 	= "Please, wait. Connecting to session "+self.multiplayer_session+"..."

				ReactDOM.render(React.createElement(basic_modal, {
					title:component_title,
					text:component_text,
					modal_container:self.modal_container
				}), self.modal_container);

			}, 300)
		}
		return this.matrixInit()
	},
	ajaxReq(url, method, body) 
	{
		return new Promise(function(resolve, reject) 
		{
			var req = new XMLHttpRequest()
			const d = JSON.stringify(body)
				req.onreadystatechange = function(evnt) 
				{
					if (req.readyState != 4) return;
				  	if (req.status != 200) return reject("STATUS OF REQUEST == "+req.status+", ERROR MESSAGE == "+req.statusText);
				  	resolve(req.responseText)
				}
				req.open(method, url, true);
				req.setRequestHeader("Content-Type","application/json") 
				if(!body) req.send();
				else req.send(d);
		});
	},
	dropMultiPlayerBall(column){
		var self = this
		if(self.dropTimer) clearTimeout(self.dropTimer)
		self.dropTimer = setTimeout(function(){
			self.matrixClient.sendTextMessage(self.mxroomid, self.matrix_user.name+" dropped ball on column "+column)
		},300)
	},
	sendRestartMXGame()
	{
		const self = this
		if(self.restartTimer) clearTimeout(self.restartTimer)
		self.restartTimer = setTimeout(function(){
			self.matrixClient.sendTextMessage(self.mxroomid, self.matrix_user.name+" restarted the game ")
		}, 300)
	},
	startMXGame() {
		if(!this.player_two) return
		if(!this.multiplayer_promise) {
			this.active_user = this.player_two;
			this.modal_container.style.display = 'none';
			this.startGame();
			return;
		}
		this.modal_container.style.display = 'none';
		this.active_user = this.player_two;
		this.multiplayer_promise()
	},
	restartMXGame(starting_player) {
		if(!this.player_two || this.player_two == {}) return
		var self = this
		self.restarting_multiplayer = true;
		if(starting_player === 1) 
		{
			if(self.guest) self.active_user = self.player_two;
			else self.active_user = self.player_one
		}
		if(starting_player === 2) 
		{
			if(self.guest) self.active_user = self.player_one;
			else self.active_user = self.player_two
		}
		self.startGame();
	},
	assignSecondPlayer()
	{
		var self 		= this
			self.is_assigned = true;
		const assign 	= function(data) {	
			self.player_two = data
			self.player_two.id = 2;
			self.player_two.ai = false;
			self.player_two.name = self.player2
			if(self.creator) self.active_user = self.player_two
			self.startMXGame();
		}
		const user = this.matrixClient.getUser(this.player2mxid)
		if(!user || !user.avatarUrl) return this.getUserById(this.player2mxid)
		.then(d => {
			const user 	= JSON.parse(d) 
			const data 	= JSON.parse(user.avatar_url)
			assign(data)
		})
		const data = JSON.parse(user.avatarUrl)
		assign(data)
	},
	timelineUpdate(event, room, toStartOfTimeline, removed, data) 
    {
	    if(!this.mxroomid) return;
	    var self = this
	    const lastmessage = room.timeline[room.timeline.length - 1];

	    if(lastmessage.event && lastmessage.event.room_id != this.mxroomid) return;
	    
	    this.mxroom_timeline = room.timeline;

	    if(!self.player_two && !self.is_assigned) {
	    	const users = room.currentState.getMembers()
    		var not_me;
	    	if(users.length >= 2) {
	    		for (var i = 0; i < users.length; i++) {
	    			var userID = users[i].userId
	    			if(!userID && users[i].user) userID = users[i].user.userId
	    			if(userID && userID != self.matrix_user.mdata.user_id) {
	    				not_me = users[i]
	    				if(users[i].user) not_me.userId = users[i].user.userId
	    				break;
	    			}
	    		}
	    		if(not_me.powerLevel == 100) self.creator = false;
	    		else self.creator = true;
		    	self.player2mxid 	= not_me.userId
		    	self.player2 		= not_me.userId
		    	self.assignSecondPlayer()
	    	}
	    }

	    if(lastmessage.event && lastmessage.event.type == "m.room.message")
	    {
		    var text = lastmessage.event.content.body

		    this.showNotification(text)
		    if(self.player_two == null) return;
		    const restarted = (text.search("restarted") > -1)
		    if(restarted && text.split(" restarted")[0] == self.matrix_user.name) return self.restartMXGame(1)
		    if(restarted && text.split(" restarted")[0] != self.matrix_user.name) return self.restartMXGame(2)
		    if(text.search("dropped") > -1 && text.split(" dropped")[0] != self.matrix_user.name && self.active_user && self.active_user.id == 2) self.updateColumn(text.split("column ")[1])

	    }
    },
    showNotification(txt)
    {
	    this._notificationSystem.addNotification({
	      message: txt,
	      level: 'success',
	      autoDismiss: 10,
	      position: 'br'
	    });
    },

	createMatrixSession()
	{
		if(this.multiplayer_session) return;
		this.mode 			= "multi"
		this.player_two 	= null;
		const self 			= this
		const client 		= self.matrixClient
		const session_id 	= generateName().split(" ")[0].toLowerCase()
		return new Promise(function(resolve)
		{
			self.multiplayer_promise = resolve;
			client
			.createRoom(
			{
			  	"preset": "public_chat",
				"room_alias_name":session_id,
				"topic":self.matrix_user.mdata.user_id,
				"visibility":"public"
			})
			.then(function()
			{
				return client.joinRoom("#"+session_id+":matrix.starpy.me")
			})	
			.then(function(data)
			{
				self.mxroomObject = data;
				self.mxroomid = data.roomId
				self.multiplayer_session_active = true;
				var session = {
					id:session_id
				}
				session.link = window.location.origin+window.location.pathname+'#multiplayer_session_'+session_id
				window.location.hash = "#multiplayer_session_"+session_id
				self.multiplayer_session = session_id
				var subject = "Your are invited you to play Connect4 Online!"
				var body 	= 'Your Friend has Invited you to Play Connect4 Online with Him!'
					body	+= '\n Press here to start! ->'
					body 	+= '\n'+session.link
				var mailto  = "<a class='multi-player-link' href='mailto:?subject="+subject+'&body='+encodeURIComponent(body)+"'>Email It</a>"
				var copy_ln = "<a id='copy_ln' class='multi-player-link' href='#multiplayer_session_"+session_id+"' onclick='window.copyToClipboard(\""+session.link+"\")'>Copy To Clipboad</a>";
				var component_text = "<p style='font-size:16px;'>"+session.link+"</p>"+mailto+"<br>"+copy_ln
				var component_title = "Share this link to play a multiplayer game!"

				ReactDOM.render(React.createElement(basic_modal, {
					title:component_title,
					text:component_text,
					modal_container:self.modal_container
				}), self.modal_container);

				self.modal_container.style.display = "block";
				return client.sendTextMessage(self.mxroomid, self.matrix_user.name+" has created room "+session_id)

			})
		})

	},

	openMatrixSession()
	{
		var self = this
		var client = this.matrixClient
		self.mxid = "#"+self.multiplayer_session+":matrix.starpy.me"
		return new Promise(function(resolve)
		{
			self.modal_container.style.display = "block";

			return client
			.joinRoom(self.mxid)
			.then(function(data)
			{
				self.mxroomObject = data;
				self.mxroomid = data.roomId
				self.multiplayer_session_active = true;
				return client
				.sendTextMessage(self.mxroomid, self.matrix_user.name+" has joined "+self.multiplayer_session)
			})
		})
	},

	createSession() 
	{
		var self 	= this
		var myNode 	= self.modal_container;
		while (myNode.firstChild) {
			ReactDOM.unmountComponentAtNode(myNode)
		};

		return self.createMatrixSession()
	}
}
