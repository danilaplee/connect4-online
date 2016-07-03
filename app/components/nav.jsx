import React from 'react';

export default React.createClass({
	startGame(mode)
	{
		var self = this
		this.props.game.mode = mode
		if(this.props.game.player_one.is_new) this.props.game.openColorDialog();
		else this.props.game.startGame();
		setTimeout(function()
		{
			self.props.single_restart = null
			self.props.multi_restart = null
			self.props.hot_restart = null
			switch(mode)
			{
				case 'single':
				self.props.single_restart = 'Restart'
				break;
				case 'multi':
				self.props.multi_restart = 'Restart'
				break;
				case 'hot':
				self.props.hot_restart = 'Restart'
				break;
			}
		}, 2000)
	},
	render() {
		var self 	  = this
		var handleClick = function(mode)
		{
			self.startGame(mode)
		}
	    return <ul className="list-group">
			<li className="list-group-item">
				<a href="#" onClick={handleClick.bind(this,'single')}>{this.props.single_restart || 'Play'} Singleplayer Game</a>
			</li>
			<li className="list-group-item">
			    <a href="#" onClick={handleClick.bind(this,'multi')}>{this.props.multi_restart || 'Play'} Multiplayer Game</a>
			</li>
			<li className="list-group-item">
			   <a href="#" onClick={handleClick.bind(this,'hot')}>{this.props.hot_restart || 'Play'} Hotseat Game</a>
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