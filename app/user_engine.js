
import React 		from 'react';
import ReactDOM 	from 'react-dom';
import generateName from 'sillyname';
import matrix		from 'matrix-js-sdk';
import uuid 		from 'uuid';

//COMPONENTS
import customizer from './components/customizer.jsx';

//CONSTANTS
const matrixURL 	= "https://starpy.me"
const registerURL 	= "https://starpy.me/c4/register"

export default {

	openColorDialog() 
	{
		var self 	= this
		var player 	= self.player_one;
		var myNode 	= self.modal_container;

		while (myNode.firstChild) ReactDOM.unmountComponentAtNode(myNode)
			
		return new Promise(function(resolve, reject)
		{
			ReactDOM.render(React.createElement(customizer, {game:self, player:player, promise:resolve}), myNode);
			myNode.style.display = "block";
		})
	},

	addHotSeat()
	{
		var self = this
		var myNode = this.modal_container;

		while (myNode.firstChild) ReactDOM.unmountComponentAtNode(myNode)

		return new Promise(function(resolve, reject)
		{
			var hot_seat = {
				id:2,
				name:'Player2',
				score:0,
				color:0xFFA07A,
				color_obj:
				{
					hex:'#FFA07A'
				},
				emoji_img:"https://twemoji.maxcdn.com/svg/1f479.svg",
				emoji:':japanese_ogre:'
			}
			ReactDOM.render(React.createElement(customizer, {game:self, player:hot_seat, hot_promise:resolve}), self.modal_container);
		 	self.modal_container.style.display = "block";
		})
	},
	initUser() 
	{
		try {
			if(localStorage.getItem("db_version") != "0.1.0") throw new Error("invalid db version");
			var user_data = JSON.parse(localStorage.getItem('connect4'));
			if(user_data.profile.emoji_img && user_data.profile.color_obj.hex)
			{
				this.user_token.innerHTML = '<img src="'+user_data.profile.emoji_img+'" style="width:80px">';
				this.user_token.style.background = user_data.profile.color_obj.hex
				return user_data.profile;
			}
			throw new Error('invalid profile')
		} 
		catch(err) 
		{
			return {
				id:1,
				name:'Player1',
				score:0,
				is_new:true,
				color:0x2d8638,
				color_obj:
				{
					hex:'#2d8638'
				},
				emoji:":dizzy:",
				emoji_img:"https://twemoji.maxcdn.com/svg/1f4ab.svg"
			}

		}
	},
	getUserById(userID)
	{
		return this.ajaxReq(matrixURL+"/_matrix/client/r0/profile/"+userID, "GET") //+"?access_token="+this.matrix_token,"GET")
	},
	getUser()
	{
		var matrixUser = {
			"name":generateName().split(" ")[0],
			"password":(uuid.v4()).replace("-", "").replace("-", "").split("-")[0]
		}
		try {
			const oldUser = JSON.parse(localStorage.getItem("matrix_user"))
			if(oldUser != null) matrixUser = oldUser;
		}
		catch(err){
			localStorage.setItem("matrix_user", JSON.stringify(matrixUser))
		}
		return matrixUser;
	},

	registerUser()
	{
		var self   = this
		const user = self.getUser()
		if(user.registered) return self.matrixAuth();
		return self.ajaxReq(registerURL, "POST", user)
		.then(function(data)
		{
			const d = JSON.parse(data)
			user.mdata = d;
			user.registered = true;

			localStorage.setItem("matrix_user", JSON.stringify(user))
			return self.matrixAuth()
		})
	},
	setMatrixAvatar()
	{
		return this.matrixClient.setAvatarUrl(JSON.stringify(this.player_one))
	},
	matrixAuth()
	{
		var self   = this
		return new Promise(function(resolve, reject)
		{
			const user = self.getUser()
			self.matrix_user = user;
			if(!user.registered) return self.registerUser().then(resolve);
			const url = matrixURL+"/_matrix/client/r0/login"
			const body = {
				type:"m.login.password",
				user:user.mdata.user_id,
				password:user.password,
				initial_device_display_name: generateName().split(" ")[0],
			}
			self
			.ajaxReq(url, "POST", body)
			.then(function(res)
			{
				var data = JSON.parse(res)
				self.matrix_token 	= data.access_token
				self.matrix_id 		= data.user_id
				resolve()
			})
		})
	},

	matrixInit()
	{
		var self = this
		return new Promise(function(resolve, reject)
		{
			self
			.matrixAuth()
			.then(function()
			{
				return matrix.createClient({
					baseUrl:matrixURL,
					accessToken:self.matrix_token,
					userId:self.matrix_id
				})
			})
			.then(function(client)
			{
				self.matrixClient = client
				setTimeout(function(){

					self.setMatrixAvatar()
					self.matrixClient.on("Room.timeline", self.timelineUpdate)
					
					if(self.multiplayer_session && self.player_one.is_new) return self.openColorDialog()
						.then(function(){ 
							console.log("created new custom user")
							console.log("openning previous matrix session")
							return self.openMatrixSession()
						}).then(resolve)

					if(self.multiplayer_session) return self.openMatrixSession().then(resolve)
				
				}, 800)
				
				self.matrixClient.startClient(10)
				if(!self.multiplayer_session)resolve()
			})
			.then(function(){
				resolve()
			})
		})
	},
}