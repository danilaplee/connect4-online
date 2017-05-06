export default {
	closeModal: function()
	{
		console.log("===== close modal =====")
		console.log(this.props)
		var container = this.props.modal_container
		if(this.props.game != null) container = this.props.game.modal_container 
		container.style.display = 'none';
	}
}