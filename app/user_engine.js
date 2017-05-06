
import React 		from 'react';
import ReactDOM 	from 'react-dom';
//COMPONENTS
import customizer from './components/customizer.jsx';

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
				color:null,
				color_obj:
				{
					hex:'#fffff'
				}
			}
			ReactDOM.render(React.createElement(customizer, {game:self, player:hot_seat, hot_promise:resolve}), self.modal_container);
		 	self.modal_container.style.display = "block";
		})
	},
	initUser() 
	{
		try {
			var user_data = JSON.parse(localStorage.getItem('connect4'));
			if(user_data.profile.emoji_img && user_data.profile.color_obj.hex)
			{
				if(!this.is_second_window) this.user_token.innerHTML = '<img src="'+user_data.profile.emoji_img+'" style="width:80px">';
				if(!this.is_second_window) this.user_token.style.background = user_data.profile.color_obj.hex
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
				color:null,
				is_new:true,
				color_obj:
				{
					hex:'#fffff'
				}
			}

		}
	}
}