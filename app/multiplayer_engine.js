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
		var self 	= this
		this.socket = io('http://localhost:2529')
		this.candidatesQueue = []
		var processQueue = function()
		{
			if(self.candidatesQueue.length) while(self.candidatesQueue.length) self.pc.addIceCandidate(self.candidatesQueue.pop())
		}
		this.socket.on('callData', function(data)
		{
			if(data.type == 'offer') self.getLocalStream(function()
		  	{
		  		self.pc.setRemoteDescription(new SessionDescription(data))
		  		self.description_set = true;
		  		self.createAnswer();
				processQueue();
		  	});
			if(data.type == 'answer') 
			{
				self.pc.setRemoteDescription(new SessionDescription(data))
				self.description_set = true;
				processQueue()
			};
			if(data.type == 'candidate')
			{
				var candidate = new IceCandidate({sdpMLineIndex: data.candidate.sdpMLineIndex, candidate: data.candidate.candidate});
			    if(self.description_set) self.pc.addIceCandidate(candidate);
			    else self.candidatesQueue.push(candidate)
			};
		})

		this.socket.on('ballDropped', function(column)
		{
			self.updateColumn(column)
		})

		this.socket.on('restartGame', function(starting_player)
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

		if(window.location.hash.search('#multiplayer_session_') > -1)
		{
			this.multiplayer_session = window.location.hash.replace('#multiplayer_session_', '')
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
			if(this.player_one.is_new) return this.openColorDialog().then(this.openSession);
			return this.openSession()
		}
	},
	openSession()
	{
		var self = this
		self.guest = true;
		self.modal_container.style.display = "block";
		ReactDOM.render(React.createElement(basic_modal, 
		{
			title:"Connecting to multiplayer session",
			text:'Please allow access to your microphone and camera to talk to the other player.',
			modal_container:self.modal_container
		}), self.modal_container);

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
			{'iceServers': 
			[
			    {
			      'url': 'stun:stun.l.google.com:19302'
			    },
			    {
			      'url': 'turn:192.158.29.39:3478?transport=udp',
			      'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
			      'username': '28224511:1379330808'
			    },
			    {
			      'url': 'turn:192.158.29.39:3478?transport=tcp',
			      'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
			      'username': '28224511:1379330808'
			    }
			]});
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
	 this.pc.createOffer(
	    this.gotLocalDescription, 
	    function(error) { console.log(error) }, 
	    { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
	  );
	},
	gotLocalDescription(event)
	{
		this.pc.setLocalDescription(new SessionDescription(event))
		this.socket.emit('transferCallData', this.multiplayer_session, event);

	},
	gotRemoteStream(evt)
	{
		var self = this
		console.log(evt.stream)
		self.multiplayer_session_active = true;
		self.remoteVideo.style.display = 'block';
		self.remoteVideoDisclaimer.style.display = 'block';
		if(self.remoteVideo) self.remoteVideo.src = URL.createObjectURL(evt.stream)
		if(self.multiplayer_promise) 
		{
			self.socket.emit('openSession', this.multiplayer_session)
			self.socket.on('yourSession', function(info)
			{
				self.player_two 	= info.player2
				self.player_two.id 	= 2;
				self.active_user 	= self.player_two
				self.modal_container.style.display = 'none';
				self.multiplayer_promise()
				self.socket.removeListener('yourSession')
			})
		}
		else 
		{
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
		if(event.candidate) this.socket.emit('transferCallData', this.multiplayer_session, {type:"candidate", candidate:event.candidate});
	},
	createSession() 
	{
		var self 	= this
		var myNode 	= self.modal_container;
		while (myNode.firstChild) myNode.removeChild(myNode.firstChild);
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
				ReactDOM.render(React.createElement(basic_modal, {
					title:"Share this link to play a multiplayer game!",
					text:session.link,
					modal_container:self.modal_container
				}), self.modal_container);

				self.modal_container.style.display = "block";
				self.multiplayer_promise = resolve;
				self.socket.removeListener('newSession')
			})
		})
	}
}