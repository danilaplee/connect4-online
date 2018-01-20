//LIBS
import React 	from 'react';
import ReactDOM from 'react-dom';
import ChatApp from './components/chat.jsx'

const dom = {
	appendHtml(el, str) {
	  var div = document.createElement('div');
	  div.innerHTML = str;
	  while (div.children.length > 0) el.appendChild(div.children[0])
	  div = null
	},
	createGameControls() {
		this.restartGameButton.className = "ui-button"
		if(this.game_controls_binded) return
		this.game_controls_binded = true;
		var self = this
		this.restartGameButton.addEventListener("click", function(){
			if(self.is_restarting) return;
			self.is_restarting = true;
			if(self.mode == "multi") return self.sendRestartMXGame().then(function(){
				setTimeout(function(){
					self.is_restarting = false;	
				},300)
			})
			self.startGame().then(function(){
				self.is_restarting = false;
			})
		})
		this.openChatButton.addEventListener("click", function(){
			self.createChatControls();
		})
		this.callUserButton.addEventListener("click", function(){
			if(self.callUserButton.innerHTML == "End Call") return self.endVideoCall(true);
			if(self.callUserButton.innerHTML == "Answer Call") return self.acceptVideoCall()
			return self.startVideoCall()
		})
	},
	createChatControls() {
		var self = this
		return new Promise(function(resolve){
			self.chatPromise = resolve
			if(!self.chatApp) self.chatApp = ReactDOM.render(React.createElement(ChatApp, {app:self}), self.gamechat);
			else {
				self.gamechat.className = "botui-app-container"
				self.scrollToBottom()
				resolve();
			}
			self.openChatButton.className = "ui-button";
		})
	},
	scrollToBottom()
	{
		var el = document.getElementById("chat-bot")
		var ele = el.querySelector(".botui-messages-container")
		ele.scrollTop = ele.scrollHeight
	},
	createMainDom() {

		var html  = '<div class="gametable-container">'
		  	html += 	'<div id="gametable"></div>'
		    html += 	'<div id="winner_text">'
		    html +=  		'<h5 class="winner_title" style="margin-top:100px;">Welcome to Emoji Connect!</h5>'
		    html +=		'</div>'
		  	html +=	'</div>'
			html +=	'<div id="gametoolbar"></div>'
			html += '<div id="gamechat" class="botui-app-container hidden"></div>'
			html += '<div id="gamemodal"></div>'
			html +=	'<div id="active_user_token"></div>'
			html +=	'<video id="remote_video" autoplay class="video_container hidden"></video>'
			html +=	'<video id="local_video" autoplay class="video_container hidden"></video>'
		  	html += '<div class="bottom-menu">'
		  	html += 	'<div id="restartGame" class="ui-button hidden">Restart Game</div>'
		  	html += 	'<div id="changeLevel" class="ui-button hidden">Change Level</div>'
		  	html += 	'<div id="openChat" class="ui-button hidden">Open Chat</div>'
		  	html += 	'<div id="callUser" class="ui-button hidden">Start Call</div>'
		  	html += 	'<div id="initEncryption" class="ui-button hidden">Enable Encryption</div>'
		  	html += '</div>'
		  	dom.appendHtml(document.body, html);
	},
	createMinimalDom() {
		var html  = '<video id="mainVideo" autoplay></video>'
			html += '<div id="closeIcon"></div>'
		  	html += '<div id="remoteVideoDisclaimer">WAITING FOR CAMERA</div>'
		  	dom.appendHtml(document.body, html);
	},
	createAndroidBlocker() {
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
		  	dom.appendHtml(document.body, html);
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
export default dom;