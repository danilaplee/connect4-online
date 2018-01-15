import React 	from 'react';
import NotificationSystem from 'react-notification-system';
import helpers 	from './helpers'
const startGame = function(mode)
{
	var self = this
	this.props.game.mode = mode
	if(this.props.game.player_one.is_new) this.props.game.openColorDialog();
	else this.props.game.startGame();
	return false;
}

export default class NavComponent extends React.Component {
	
	constructor(prop) {
		super(prop);
		this.props = prop
		this.startGame = startGame.bind(this)
	}

  	componentDidMount() {
    	this._notificationSystem = this.refs.notificationSystem;
    	this.props.game._notificationSystem = this._notificationSystem;
  	}
  	
	render() {
		var self 	  = this
		const handleClick = function(mode)
		{
			self.startGame(mode)
			return false;
		}
		const handleTransform = function(type){
	  		console.log(type)
	  		const el = document.getElementById("dynamic-nav")
	  		if(!el) return;
	  		if(type == "show") el.className = "list-group"
	  		else el.className = "list-group small"
	  	}
	    return (
	    <div>
	    	<ul id="dynamic-nav" className="list-group">
				<li className="list-group-item">
					<a onClick={handleClick.bind(this,'single')}>Play Singleplayer Game</a>
				</li>
				<li className="list-group-item">
				    <a onClick={handleClick.bind(this,'multi')}>Play Multiplayer Game</a>
				</li>
				<li className="list-group-item">
				   <a onClick={handleClick.bind(this,'hot')}>Play Hotseat Game</a>
				</li>
				<li className="list-group-item">
				   <a onClick={this.props.game.openColorDialog}>Settings</a>
				</li>
				<li className="list-group-item">
				   <a onClick={handleTransform.bind(this,"hide")}>Hide</a>
				</li>
				<li className="list-group-item show-if-small">
				   <a onClick={handleTransform.bind(this,"show")}>Open</a>
				</li>
			</ul>
			<div> 
				<NotificationSystem ref="notificationSystem" />
	        </div>
        </div>
        );
	}
}