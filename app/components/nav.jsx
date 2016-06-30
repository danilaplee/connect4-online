import React from 'react';

export default React.createClass({
	startGame(mode)
	{
		this.props.game.mode = mode
		if(this.props.game.player_one.is_new) this.props.game.openColorDialog();
		else this.props.game.startGame();
	},
	render() {
		var self 	  = this
		var handleClick = function(mode)
		{
			self.startGame(mode)
		}
	    return <ul className="list-group">
			<li className="list-group-item">
				<a href="#" onClick={handleClick.bind(this,'single')}>Play Singleplayer Game</a>
			</li>
			<li className="list-group-item">
			    <a href="#" onClick={handleClick.bind(this,'multi')}>Play Multiplayer Game</a>
			</li>
			<li className="list-group-item">
			   <a href="#" onClick={handleClick.bind(this,'hot')}>Play Hotseat Game</a>
			</li>
			<li className="list-group-item">
			   <a href="#" onClick={this.props.game.openColorDialog}>Settings</a>
			</li>
			<li className="list-group-item">
			   <a href="https://danilaplee.github.io">About</a>
			</li>
		</ul>;
	}
});