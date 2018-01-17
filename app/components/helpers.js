import React from 'react'
import ReactDOM from 'react-dom'
export default {
	closeModal: function()
	{
		var container = this.props.game.modal_container 
			container.style.display = 'none';

		setTimeout(function(){
			while (container.firstChild) {
				ReactDOM.unmountComponentAtNode(container)
			};
		}, 300)
	},
  	hideChat(){
		this.props.app.gamechat.className = "botui-app-container hidden"
	}
}