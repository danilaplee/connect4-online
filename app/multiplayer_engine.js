//TURN SERVER 
//turnserver --syslog -a -L 127.0.0.1 -L ::1 -E 127.0.0.1 -E ::1 --max-bps=3000000 -f -m 10 --min-port=32355 --max-port=65535 --user=282245111379330808:JZEOEt2V3Qb0y27GRntt2u2PAYA= -r starp.tech --log-file=stdout -v
import React 	from 'react';
import ReactDOM from 'react-dom';
import io 		from 'socket.io-client';

//COMPONENTS
import basic_modal from './components/basic_modal.jsx';

var PeerConnection 		= window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var IceCandidate 		= window.mozRTCIceCandidate || window.RTCIceCandidate;
var SessionDescription 	= window.mozRTCSessionDescription || window.RTCSessionDescription;
navigator.getUserMedia 	= navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;

export default {
	bindMultiplayer()
	{
		localStorage.setItem("connection_status", "offline")
		var self 	= this
		this.socket = io('https://starpy.me/',{path:"/c4/socket.io"})
		this.candidatesQueue = []
		var processQueue = function()
		{
			var candidates = self.candidatesQueue
			try {
				var c = JSON.parse(localStorage.getItem("connection_candidates"))
				console.log("======== total candidates in localStorage ==========")
				console.log(c)
				if(c != null) for (var i = c.length - 1; i >= 0; i--) candidates.push(c[i])
			}
			catch(err) {
				console.error("========================")
				console.error("storage queue err")
				console.error(err)
				console.error("========================")
			}
			console.log("total queue")
			console.log(candidates)
			if(candidates.length) while(candidates.length) self.pc.addIceCandidate(candidates.pop())
		}
		this.socket.on('callData', function(data)
		{
			if(data.type == 'offer') {
				localStorage.setItem("connection_offer", JSON.stringify(data))
				if(self.is_second_window) { 
					self.getLocalStream(function()
				  	{
				  		self.pc.setRemoteDescription(new SessionDescription(data))
				  		self.description_set = true;
				  		self.createAnswer();
						processQueue();
				  	})
				} 
				else {
					self.openSecondWindow()
				}
			}
			if(data.type == 'answer') 
			{
				self.pc.setRemoteDescription(new SessionDescription(data))
				self.description_set = true;
				processQueue()
			};
			if(data.type == 'candidate')
			{
				console.log("====================== received candidate ============================")
				console.log(data)
				var candidate = new IceCandidate({sdpMLineIndex: data.candidate.sdpMLineIndex, candidate: data.candidate.candidate});
			    console.log(candidate)
			    console.log("============== is description set = "+self.description_set+" =========")
			    if(self.description_set) self.pc.addIceCandidate(candidate);
			    else self.candidatesQueue.push(candidate)
			    console.log("======== total candidates queue = "+self.candidatesQueue.length+" =========")
			    localStorage.setItem("connection_candidates", JSON.stringify(self.candidatesQueue))
			};
		})
		try {
			var offer = JSON.parse(localStorage.getItem("connection_offer"))
			if(offer != null)
			{
			  	self.offer = offer
				self.multiplayer_session = window.location.hash.replace("#call", "").replace('#multiplayer_session_', '')
				self.socket.emit("replaceGameSocket", self.player_one, self.multiplayer_session)
				console.log("===== connecting master player =====")
				console.log("starting session id "+this.multiplayer_session)
				console.log(self.player_one)
				self.getLocalStream(function()
			  	{
			  		self.pc.setRemoteDescription(new SessionDescription(offer))
			  		self.description_set = true;
			  		self.createAnswer();
					processQueue();
			  	})
			  	return
			}
		}
		catch(err){
			self.offer = null
			console.error("==== offer parse error =====")
			console.error(err)
		}
		if(window.location.hash.search('#multiplayer_session_') > -1 && !this.multiplayer_session_active)
		{
			this.multiplayer_session = window.location.hash.replace("#call", "").replace('#multiplayer_session_', '')
			console.log("===== connecting guest player =====")
			console.log("starting session id "+this.multiplayer_session)
			if(navigator.vendor != 'Google Inc.') 
			{
				ReactDOM.render(React.createElement(basic_modal, 
				{
					title:'Multiplayer issue',
					text:'Looks like you are using an unsupported browser :( <br> please user Chrome or Opera for Multiplayer. <br> Thank you.',
					modal_container:self.modal_container
				}), self.modal_container);
				return self.modal_container.style.display = "block";
			};
			if(this.player_one.is_new && !this.is_second_window) return this.openColorDialog().then(this.openSession);
			return this.openSession()
		}
	},
	openSecondWindow()
	{
		console.log("opening new window")
		var hsh = window.location.hash
		var hasBegunGame = false;
		var self = this

		if(hsh == "" || hsh == null) { hsh = "#multiplayer_session_"+this.multiplayer_session}
		var link = window.location.origin + window.location.pathname + "#call" + hsh

		console.log(link)
		console.log("===================")

		if(navigator.userAgent.search("Android") == -1)
		{
			console.log("==== browser opening new window =====")
			var win_ops = "width=512,height=384,resizable=yes,scrollbars=no,status=no,location=no,toolbar=no,menubar=no"
			self.second_window = window.open(link, "multiplayer_session", win_ops)
			self.second_window.focus()
		}
		else {
			console.log("android transferring location")
			window.location = "app://"+link
			self.drop_speed = 2;
		}
		self.socket.disconnect()
		self.socket = null;
		window.addEventListener("storage", function(evt){
			console.log("===== got a new message =====")
			console.log(evt)
			if(evt.newValue == "online" && hasBegunGame == false){
				console.log("communication estabilished")
				window.removeEventListener("storage", null);
				hasBegunGame = true;
				self.beginGame();
			}
		})
	},
	enableMainWindow()
	{
		console.log("connection estabilished")
		console.log("running game")
		setTimeout(function(){
			localStorage.setItem("connection_status", "online")
		}, 1000)
	},
	beginGame()
	{
		var self = this
		self.socket = io('https://starpy.me/',{path:"/c4/socket.io"})
		self.modal_container.style.display = 'none';
		
		self.socket.emit('openSession', self.multiplayer_session)
		var dataReceived = false;
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
	getLocalStream(callback) 
	{
		var self = this
		var addLocalStream = function(stream)
		{
			var pc = new PeerConnection(
			{	'iceServers': 
				[
				    {
				      'urls': 'stun:137.74.113.238:3478',
				      'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA',
				      'username': '282245111379330808'
				    },
				    {
				      'urls': 'turn:137.74.113.238:3478',
				      'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA',
				      'username': '282245111379330808'
				    }
				]
			});
			if(stream) pc.addStream(stream);
			pc.onicecandidate 	= self.gotIceCandidate;
			pc.onaddstream 		= self.gotRemoteStream;
			self.pc 			= pc;
			if(callback) callback()
		}
		navigator.getUserMedia(
		{ audio: true, video: true }, 
		addLocalStream, 
		function(error) 
		{ 
			console.log(error) 
			self.noVideo = true;
			addLocalStream()
		});
	},
	createOffer() 
	{
		var params 				=  { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true }
		if(navigator.userAgent.search("Android") == -1)
		{
			params.maxWidth 	= 320
	       	params.maxHeight 	= 240
	    }
	 	this.pc.createOffer(
	    	this.gotLocalDescription, 
	    	function(error) { console.log(error) }, 
	    	{ 'mandatory':params }
	  	);
	},
	gotLocalDescription(event)
	{
		console.log("sending local description")
		this.pc.setLocalDescription(new SessionDescription(event))
		this.socket.emit('transferCallData', this.multiplayer_session, event);
	},
	gotRemoteStream(evt)
	{
		var self = this
		self.multiplayer_session_active = true;
		self.remoteVideo.style.display = 'block';
		self.remoteVideoDisclaimer.style.display = 'block';
		if(self.remoteVideo) self.remoteVideo.src = URL.createObjectURL(evt.stream)
		if(self.multiplayer_promise) 
		{
			self.socket.emit('openSession', this.multiplayer_session)
			self.socket.on('yourSession', function(info)
			{
				self.socket.removeListener('yourSession')
				self.player_two 	= info.player2
				self.player_two.id 	= 2;
				self.active_user 	= self.player_two
				self.modal_container.style.display = 'none';
				self.multiplayer_promise()
			})
		}
		else 
		{
			console.log("==== running hide modal container =====")
			if(self.is_second_window) return self.enableMainWindow();
			self.modal_container.style.display = 'none';
			self.mode = "multi";
			self.startGame();
		}
		setTimeout(function(){
			self.remoteVideoDisclaimer.innerHTML = 'YOUR FRIEND HAS NOT ENABLED CAMERA'
		}, 1000)
	},
	createAnswer() 
	{
	  this.pc.createAnswer(
	    this.gotLocalDescription,
	    function(error) { console.log(error) }, 
	    { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
	  );
	},
	gotIceCandidate(event)
	{
		console.log('======== created ice candidate ========')
		console.log(event)
		console.log("=======================================")
		if(event.candidate) this.socket.emit('transferCallData', this.multiplayer_session, {type:"candidate", candidate:event.candidate});
	},
	createSession() 
	{
		var self 	= this
		var myNode 	= self.modal_container;
		while (myNode.firstChild) {
			ReactDOM.unmountComponentAtNode(myNode)
		};
		if(navigator.vendor != 'Google Inc.') 
		{
			ReactDOM.render(React.createElement(basic_modal, 
			{
				title:'Multiplayer issue',
				text:'Looks like you are using an unsupported browser :( \n please user Chrome or Opera for Multiplayer. \n Thank you.',
				modal_container:self.modal_container
			}), self.modal_container);
			return self.modal_container.style.display = "block";
		};
		var socket = this.socket
			socket.emit('initSession', this.player_one)
		return new Promise(function(resolve, reject)
		{
			socket.on('newSession', function(session_id)
			{

				var session = {
					id:session_id
				}
				session.link = window.location.origin+window.location.pathname+'#multiplayer_session_'+session_id
				self.multiplayer_session = session_id
				var subject = "Your are invited you to play Connect4 Online!"
				var body 	= 'Your Friend has Invited you to Play Connect4 Online with Him!'
					body	+= '\n Press here to start! ->'
					body 	+= '\n'+session.link
				var mailto  = "<a href='mailto:?subject="+subject+'&body='+encodeURIComponent(body)+"'>Email this link to someone!</a>"
				ReactDOM.render(React.createElement(basic_modal, {
					title:"Share this link to play a multiplayer game!",
					text:mailto,
					modal_container:self.modal_container
				}), self.modal_container);

				self.modal_container.style.display = "block";
				self.multiplayer_promise = resolve;
				self.socket.removeListener('newSession')
			})
		})
	}
}
