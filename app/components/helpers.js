export default {
	closeModal: function()
	{
		var container = this.props.game.modal_container 
		container.style.display = 'none';
	},
  	hideChat(){
		this.props.app.gamechat.className = "botui-app-container hidden"
	}
}