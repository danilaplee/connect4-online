import React 			from 'react';
import { SliderPicker } from 'react-color';
import ReactEmoji 		from 'react-emoji';
import EmojiPicker 		from 'react-emoji-picker';
import emojiMap 		from '../../node_modules/react-emoji-picker/lib/emojiMap';
import helpers 			from './helpers'
var handleColorPick = function(color) {
	this.props.player.color 					= color.hex.replace('#', '0x')
	this.props.game.user_token.style.background = color.hex
	this.props.player.color_obj 				= color;
}
var setEmoji = function(emoji)
{
	this.props.player.emoji = emoji;
	this.props.player.emoji_img = this.emojify(emoji)[0].props.src
	this.props.game.user_token.innerHTML = '<img src="'+this.props.player.emoji_img+'" style="width:80px">';
}
export default class Customizer extends React.Component {
	props:{}
	constructor(prop) {
		super(prop);
		console.log(ReactEmoji)
		this.props = prop
		this.emojify = ReactEmoji.emojify.bind(this)
		this.closeModal = helpers.closeModal.bind(this)
		this.setEmoji = setEmoji.bind(this)
		this.handleColorPick = handleColorPick.bind(this)
	}
	mixins: [
	    ReactEmoji
	]
	render() {
		var self = this
		var saveCustomizing = function()
		{
			var player = self.props.player
			if(player.color && player.emoji) 
			{
				if(player.id == 1)
				{
					player.is_new = null;
					var user_data = JSON.stringify({
						profile:player
					})
					localStorage.setItem('connect4', user_data)
					self.props.promise();
					if(!self.props.game.in_progress && self.props.game.multiplayer_session) self.props.game.startGame();
				}
				else
				{
					self.props.game.player_two = player;
					self.props.hot_promise();
				}
			}
			self.closeModal()
		}
		var emojiPickerStyles = 
		{
		  position: 'absolute',
		  left: 0, top: '3.9rem',
		  backgroundColor: 'white',
		  width: '100%',
		  padding: '.3em .6em',
		  zIndex: '2'
		};
		console.log(this.props)
	    return <div className="modal">
		  <div className="modal-dialog">
		    <div className="modal-content">
		      <div className="modal-header">
		        <button type="button" className="close" onClick={this.closeModal}>&times;</button>
		        <h4 className="modal-title">{this.props.player.name} pick a color & emoji</h4>
		      </div>
		      <div className="modal-body">
		      	<div className="col-xs-12" style={{padding:0}}>
				    <SliderPicker 
						color={ this.props.player.color_obj.hex }
						onChangeComplete={ this.handleColorPick }
					/>
				</div>
				<div className="col-xs-12" style={{padding:0,height:"250px"}}>
			        <EmojiPicker 
				        style={emojiPickerStyles} 
				        onSelect={this.setEmoji} 
			        />
			    </div>
		      </div>
		      <div className="modal-footer">
		        <button 
		        onClick={saveCustomizing} 
		        type="button" 
		        style={{margin:"10px 0"}} 
		        className="btn btn-primary">
		        	Save changes
		        </button>
		      </div>
		    </div>
		  </div>
		</div>;
	}
}