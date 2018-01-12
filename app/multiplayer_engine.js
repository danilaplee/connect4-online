//TURN SERVER 
//turnserver --syslog -a -L 127.0.0.1 -L ::1 -E 127.0.0.1 -E ::1 --max-bps=3000000 -f -m 10 --min-port=32355 --max-port=65535 --user=282245111379330808:JZEOEt2V3Qb0y27GRntt2u2PAYA= -r starp.tech --log-file=stdout -v
import React 	from 'react';
import ReactDOM from 'react-dom';
import io 		from 'socket.io-client';
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
	//////OLD///////
	bindMultiplayer()
	{
		if(window.location.hash.search('#multiplayer_session_') > -1 && !this.multiplayer_session_active) {
			this.multiplayer_session = window.location.hash.replace("#call", "").replace('#multiplayer_session_', '')
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

	timelineUpdate(event, room, toStartOfTimeline, removed, data) 
    {
	    if(!this.mxroomid) return;
	    const lastmessage = room.timeline[room.timeline.length - 1];
	    if(lastmessage.event.room_id != this.mxroomid) return;
	    if(lastmessage.event && lastmessage.event.type == "m.room.message")
	    {
		    var text = lastmessage.event.content.body
		    if(text.search("has joined ") > -1) {

		    }
		    console.log(lastmessage.event)
		    console.log(text)
		    this.showNotification(text)

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
		const self = this
		const client = self.matrixClient
		const session_id = generateName().split(" ")[0].toLowerCase()
		return new Promise(function(resolve)
		{

			self.multiplayer_promise = resolve;
			client
			.createRoom(
			{
			  	"preset": "public_chat",
				"room_alias_name":session_id,
				"topic":"emoji-connect",
				"visibility":"public"
			})
			.then(function()
			{
				return client.joinRoom("#"+session_id+":matrix.starpy.me")
			})	
			.then(function(data)
			{
				self.mxroomid = data.roomId
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
			return client
			.joinRoom(self.mxid)
			.then(function(data)
			{
				console.log("joined room")
				console.log(data)
				self.mxroomid = data.roomId
				console.log("==============")
				return client.sendTextMessage(self.mxroomid, self.matrix_user.name+" has joined "+self.multiplayer_session)
			})
		})
	},
	beginGame()
	{
		var self = this
		self.socket = io('https://starpy.me/',{path:"/c4/socket.io"})
		self.modal_container.style.display = 'none';
		
		self.socket.emit('openSession', self.multiplayer_session)
		var dataReceived = false;
		var time = null;
		self.socket.on('yourSession', function(info)
		{
			if(dataReceived == true) return;
			console.log("==== game pre start session info ====")
			console.log(info)
			dataReceived = true;
			self.socket.removeListener('yourSession')
			self.mode = "multi";
			self.multiplayer_session_active = true;
			self.socket.emit("replaceGameSocket", self.player_one, self.multiplayer_session)

			time = setTimeout(function(){
				clearTimeout(time)
				self.socket.on('ballDropped', function(column)
				{
					self.updateColumn(column)
				})

				self.socket.on('restartGame', function(starting_player)
				{
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
				})
				if(!self.multiplayer_promise) {
					self.player_two 	= info.player1
					self.player_two.id 	= 2;
					self.active_user = self.player_two;
					self.modal_container.style.display = 'none';
					self.startGame();
					return;
				}
				self.player_two 	= info.player2
				self.player_two.id 	= 2;
				self.modal_container.style.display = 'none';
				self.multiplayer_promise()
			}, 1000)
		})
	},

	openSession()
	{
		var self = this

		if(!this.is_second_window){

			self.guest = true;
			self.modal_container.style.display = "block";
			ReactDOM.render(React.createElement(basic_modal, 
			{
				title:"Connecting to multiplayer session",
				text:'Please allow access to your microphone and camera to talk to the other player.',
				modal_container:self.modal_container
			}), self.modal_container);

			self.openSecondWindow();
			return 
		}
		console.log("====== opening session ====")
		self.socket.emit('openSession', this.multiplayer_session, this.player_one)
		self.socket.on('yourSession', function(session)
		{
			self.player_two = session.player1
			self.player_two.id = 2;
			self.socket.removeListener('yourSession')
			self.getLocalStream(function()
		  	{
			  	self.createOffer();
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
	},
	copyToClipboard(sText) {
		var oText = false,
		    bResult = false;
		var hash = window.location.hash.toString()
		try {
		  	oText = document.createElement("textarea");
		  	oText.className = "clipboard"
		  	oText.value = sText
		  	document.body.appendChild(oText)
		  	oText.select();
		  	oText.focus()
		  	document.execCommand("Copy");
		  	bResult = true;
		} 	catch(e) {
			console.error("cp error")
			console.error(e)
		}
		document.body.removeChild(oText)
		var copy_ln = document.getElementById("copy_ln")
		var prev_txt = copy_ln.innerHTML +""
		copy_ln.innerHTML = "Done!"
		setTimeout(function(){
			copy_ln.innerHTML = prev_txt
		}, 600)
		return bResult;
    }
}
