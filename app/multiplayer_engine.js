//TURN SERVER 
//turnserver --syslog -a -L 127.0.0.1 -L ::1 -E 127.0.0.1 -E ::1 --max-bps=3000000 -f -m 10 --min-port=32355 --max-port=65535 --user=282245111379330808:JZEOEt2V3Qb0y27GRntt2u2PAYA= -r starp.tech --log-file=stdout -v
import React 	from 'react';
import ReactDOM from 'react-dom';
import generateName from 'sillyname';
import matrix	from 'matrix-js-sdk';
import uuid 	from 'uuid';

//COMPONENTS
import basic_modal from './components/basic_modal.jsx';
function strip(html){
   var doc = new DOMParser().parseFromString(html, 'text/html');
   return doc.body.textContent || "";
}

var PeerConnection 		= window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var IceCandidate 		= window.mozRTCIceCandidate || window.RTCIceCandidate;
var SessionDescription 	= window.mozRTCSessionDescription || window.RTCSessionDescription;
navigator.getUserMedia 	= navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
export default {
	bindMultiplayer()
	{
		var self = this
		if(window.location.hash.search('#room_') > -1 && !this.multiplayer_session_active) 
		{
			this.mode = "multi"
			this.multiplayer_session = window.location.hash.replace("#call", "").replace('#room_', '')
		}
		return this.matrixInit()
	},
	sendBotMessage(txt, human)
	{
		var self = this
		if(txt && txt.human) human = txt.human
		if(txt && txt.content) txt = txt.content
		return new Promise(function(resolve,reject){
			self.botui.message.add({ 
	    		human:human,
			  	content: txt,
			}).then(function(){
				self.scrollToBottom()
				resolve()
			})
		})
	},
    showNotification(txt, human)
    {
    	const self = this
    	return self.sendBotMessage({ 
    		human:human,
		  	content: txt,
		}).then(function(){
		    return self._notificationSystem.addNotification({
		      message: strip(txt),
		      level: 'success',
		      autoDismiss: 10,
		      position: 'br'
		    });
		})
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
		var self = this
		if(self.restartTimer) clearTimeout(self.restartTimer)
		self.restartTimer = setTimeout(function(){
			self.matrixClient.sendTextMessage(self.mxroomid, self.matrix_user.name+" restarted the game ")
		}, 300)
	},
	sendMXMessage(text)
	{
		if(!this.mxroomid) return
		var self = this
		if(self.mxMessageTimer) clearTimeout(self.mxMessageTimer)
		self.mxMessageTimer = setTimeout(function(){
			self.matrixClient.sendTextMessage(self.mxroomid, self.matrix_user.name+" says: <b>"+text+"</b>")
		}, 300)
	},
	startMXGame() {
		if(!this.player_two) return
		if(!this.game_is_new) {
			this.active_user = this.player_two;
			this.startGame();
			return;
		}
		this.game_is_new = false;
		if(this.new_game_promise) this.new_game_promise()
	},
	restartMXGame(starting_player) {
		if(!this.player_two) return
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
			self.is_assigned = false;
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
			if(!user.avatar_url) return new Promise(resolve=>{
				setTimeout(function(){
					self.getUserById(self.player2mxid).then(n_d=>{
						const u 	= JSON.parse(n_d) 
						const da 	= JSON.parse(u.avatar_url)
						assign(da)
						resolve()
					})
				}, 1000)
			})
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
	    		if(not_me.powerLevel == 100) {
	    			self.creator = false;
	    			self.guest 	 = true;
	    		}
	    		else {
	    			self.creator = true;
	    			self.guest = false;
	    		}
		    	self.player2mxid 	= not_me.userId
		    	self.player2 		= not_me.userId
		    	self.assignSecondPlayer()
	    	}
	    }

	    if(lastmessage.event && lastmessage.event.type == "m.room.message")
	    {
		    var text = lastmessage.event.content.body

		    if(text.split(" ")[0] == self.matrix_user.name) this.showNotification(text, true)
		    else this.showNotification(text)
		    if(self.player_two == null) return;
		    const restarted = (text.search("restarted") > -1)
		    if(restarted && self.player_two){
		    	const author = text.split(" restarted")[0]
		    	if(author == self.matrix_user.name && self.creator) return self.restartMXGame(1)
		    	if(author == self.matrix_user.name && !self.creator) return self.restartMXGame(2)
		    	if(author != self.matrix_user.name && self.creator) return self.restartMXGame(2)
		    	if(author != self.matrix_user.name && !self.creator) return self.restartMXGame(1)
		    } 
		    if(text.search("dropped") > -1 && text.split(" dropped")[0] != self.matrix_user.name && self.active_user && self.active_user.id == 2) self.updateColumn(strip(text).split("column ")[1])

	    }
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
			self.first_message_sent = false;
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
				self.creating_room = false;
				self.mxroomObject = data;
				self.mxroomid = data.roomId
				self.multiplayer_session_active = true;
				self.multiplayer_session = session_id
				self.game_is_new = true;
				window.location.hash = '#room_'+session_id
				resolve()
				return self.createChatControls()

			}).then(function(){

					client.sendTextMessage(self.mxroomid, self.matrix_user.name+" has created room "+session_id)
					.then(function(){
						self.first_message_sent = true;
					})
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
			self.first_message_sent = false;
			client
			.joinRoom(self.mxid)
			.then(function(data)
			{
				self.mxroomid = data.roomId;
				self.multiplayer_session_active = true;
				return self.createChatControls()
				
			}).then(function(){
				return client.sendTextMessage(self.mxroomid, self.matrix_user.name+" has joined "+self.multiplayer_session)
			})
			.then(function(){
				self.first_message_sent = true;
				resolve()
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
