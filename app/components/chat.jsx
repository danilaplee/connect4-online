import React from 'react';
import helpers from './helpers'
import Vue from 'vue'
import BotUI from 'botui'
import generateName from 'sillyname';

const list_commands = '/new /help'

export default class ChatApp extends React.Component {
	constructor(prop) {
		super(prop);
		this.props = prop
		this.getName = this.getName.bind(this)
		this.createRoom = this.createRoom.bind(this)
		this.mainMenu = this.mainMenu.bind(this)
		this.showError = this.showError.bind(this)
		this.hideChat = helpers.hideChat.bind(this)
		this.sendBotMessage = prop.app.sendBotMessage
		this.resolveChatInput = this.resolveChatInput.bind(this)
	}
	showError(res)
	{
		const self = this
		return new Promise(function(resolve){
			if(!self.mxroomid) return self.sendBotMessage({ 
			  	content: "<code>You should be in a room to send messages.</code>",
			}).then(resolve);
		})
	}
	getName()
	{	
		var self = this
		return new Promise(function(resolve, reject){
			if(self.props.app.matrix_user.name 
				&& !self.props.app.matrix_user.is_new) return resolve({value:self.props.app.matrix_user.name, old:true})
			self.sendBotMessage({ 
			  	content: "<code>Please, tell me your name?</code>",
			}).then(function () {
				return self.props.app.botui.action.text({ // show 'text' action
			    	action: {
			      		placeholder: generateName()
			    	}
			  	});
			})
			.then(function(res) {
				self.props.app.matrix_user.name = res.value
				self.props.app.matrix_user.is_new = false;
				localStorage.setItem("matrix_user", JSON.stringify(self.props.app.matrix_user))
				resolve(res)
			})
		});
	}
	createRoom()
	{
	
		var self = this	
		this.props.app.creating_room = true;
		this.props.app.multiplayer_session = null;
		this.props.app.restarting_multiplayer = false;
		var loading_id
		return self.sendBotMessage({ 
			loading: true,
		  	content: "<code> Creating new room, please wait... </code>",
		}).then(function(id){
			loading_id = id
			return self.props.app.startGame()
		})
		.then(function()
		{
			var session_id 	= self.props.app.multiplayer_session
			var session 	= {
				id:session_id
			}
				session.link = window.location.origin+window.location.pathname+'#room_'+session_id
			var subject = "Your are invited you to play Connect4 Online!"
			var body 	= 'Your Friend has Invited you to Play Connect4 Online with Him!'
				body	+= '\n Press here to start! ->'
				body 	+= '\n'+session.link
			var mailto  = "<a class='multi-player-link' href='mailto:?subject="+subject+'&body='+encodeURIComponent(body)+"'>Email It</a>"
			var copy_ln = "<a id='copy_ln' class='multi-player-link' href='#room_"+session_id+"' onclick='window.copyToClipboard(\""+session.link+"\")'>Copy To Clipboad</a>";
			var component_text = "<p style='font-size:16px;'>"+session.link+"</p>"+mailto+"<br>"+copy_ln
			var component_title = "this link to play a multiplayer game!"

			return self.sendBotMessage({ 
				update:loading_id,
				loading:false,
			  	content: "<code> !(link) Share "+component_title+" <br/> <b> ["+session.link+"]("+session.link+")^ </b> </code>",
			}).then(function () { 
				return self.sendBotMessage({ 
				  	content: "<code> !(envelope) <b> [Email](mailto:?subject="+subject+"&body="+encodeURIComponent(body)+") </b> this link to someone! </code>",
				})
			})
			.then(function(){
				return self.props.app.matrixClient.sendTextMessage(self.props.app.mxroomid, self.props.app.matrix_user.name+" has created room "+session_id)
			})
			.then(function(){
				self.props.app.first_message_sent = true;
			})
		})
		.catch(function(err){
			console.error(err)
		})

	}
	mainMenu(full)
	{
		const self = this

  		if(full) return self.sendBotMessage({ 
		  	content: "<code>To start a new multiplayer game type <br> <b>/new</b></code>",
		}).then(function () { 
			return self.sendBotMessage({ 
			  	content: "<code>To join a multiplayer session type <br/> <b>/join "+generateName().split(" ")[0].toLowerCase()+"</b></code>",
			})
		}).then(function () { 
			return self.sendBotMessage({ 
			  	content: "<code>To exit multiplayer gaming type <br/> <b>/exit</b></code>",
			})
		}).then(function () { 
			return self.sendBotMessage({ 
			  	content: "<code>To show this list type <br/> <b>/help</b></code>",
			})
		})
		return self.sendBotMessage({ 
		  	content: "<code>To start a new game type <b>/new</b></code>",
		}).then(function () { 
			return self.sendBotMessage({ 
			  	content: "<code>To show help type <b>/help</b></code>",
			})
		})

	}
	resolveChatInput(res)
	{
		// console.log("new chat input = ")
		const self = this
		if(res && res.value) {
			// console.log(res.value)
			// console.log("=============")
			if(res.value == "/help") return this.mainMenu(true).then(self.resolveChatInput).catch(self.resolveChatInput)
			if(res.value == "/new") return self.createRoom().then(self.resolveChatInput).catch(self.resolveChatInput)
			if(this.props.app.mxroomid) this.props.app.sendMXMessage(res.value)
			else return this.showError(res).then(self.resolveChatInput)
		}
		// console.log("=============")
		return this.props.app.botui.action.text({
		  	addMessage: false,
	    	action: {
	      		placeholder: list_commands
	    	}
	  	}).then(this.resolveChatInput)
	  	.catch(this.resolveChatInput)
	}
  	componentDidMount() {
  		var self = this

		const botui = new BotUI('chat-bot', {
		  	vue: Vue
		})

		this.props.app.botui = botui;

  		self.sendBotMessage({ 
		  	
		  	content: "<code>Hi! I'am <b>Game Bot!</b></code>",

		}).then(function () { 
			return self.sendBotMessage({content:'![Game Bot](./BMO_wp.png)'})
		}).then(function(){

			self.props.app.gamechat.className = "botui-app-container"
		  	
		  	return self.getName();
		}).then(function (res) { 

			var content = '<code> Welcome, <b>' + res.value + "</b></code>"
			if(res.old) content = '<code>Welcome Back, <b>'+res.value+"</b></code>"

		  	return self.sendBotMessage({
		    	content: content
		  	})

		}).then(function () {

		  	return self.mainMenu();

		}).then(function () {


		  	if(self.props.app.multiplayer_session) return self.sendBotMessage({
		    	content: '<code> Joining to game <b>'+self.props.app.multiplayer_session+"</b> </code>"
		  	})

			if(self.props.app.chatPromise) self.props.app.chatPromise()
		  	return self.resolveChatInput()
		}).then(function () {

			if(self.props.app.chatPromise) self.props.app.chatPromise()
		  	return self.resolveChatInput()
		})

  	}
	render() {

	    return <div>
		    <button type="button" className="close" onClick={this.hideChat}>×</button>
		    <div id="chat-bot">
		    	<bot-ui></bot-ui>
		    </div>
		</div>
	}
}