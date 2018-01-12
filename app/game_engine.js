import PIXI from 'pixi.js';
var ai_profile =
{
	id:2,
	ai:true,
	color:0xFFA07A,
	color_obj:
	{
		hex:'#FFA07A'
	},
	emoji_img:"https://twemoji.maxcdn.com/svg/1f479.svg",
	emoji:':japanese_ogre:'
}
var getRandomInt = function(min, max) 
{
  return Math.floor(Math.random() * (max - min)) + min;
}
export default {
	'name':'CONNECT4 GAME_ENGINE',
	createCanvas()
	{
		this.canvas 			 = window.document.createElement("canvas")
		this.canvas.style.height = this.height + "px"
		this.canvas.style.width  = this.width + "px"
		this.gametable.appendChild(this.canvas)	
		this.renderOptions 	= 
		{
			view:this.canvas,
			transparent:true,
			resolution:window.devicePixelRatio
		}
		this.renderer 		= new PIXI.CanvasRenderer(this.width, this.height, this.renderOptions);
		this.stage 		 	= new PIXI.Container();
	},
	animate() 
	{
		window.requestAnimationFrame(this.animate);
		this.renderer.render(this.stage)
	},
	animateFall(column)
	{
		var self 		= this
		let size 		= this.tile_size;
		let color 		= this.active_user.color
		return new Promise(function(resolve, reject)
		{
			var x 	 		= parseInt(column.index * size)+(size / 2)
			var y 			= parseInt(column.height * size)-(size / 2);
			if(y < 0) y = this.height + y - 6
			var start_y 	= size / 2;
			var y_speed 	= size / self.drop_speed;
			var opacity 	= 0.1;
			if(start_y => y) opacity = 1;
			if(!self.unused_balls.length) var circle = new PIXI.Graphics();
			else
			{
				var circle = self.unused_balls.pop()
					circle.visible = true;
			}
			circle.lineStyle(0);
			circle.beginFill(color, opacity);
			circle.drawCircle(x, start_y, 48, 0);
			circle.endFill();
			var ball_count = column.positions.length - 1
			self.stage.addChild(circle);
			self.balls.push(circle)
			column.positions[ball_count].ball = circle;
			column.positions[ball_count].x = x;
			column.positions[ball_count].y = y;
			var drawFall = function()
			{
				if(start_y < y)
				{
					start_y += y_speed;
					if(parseInt(opacity) < 0.5) opacity += opacity;
					if(start_y => y) opacity = 1;
					circle.clear();
					circle.beginFill(color, opacity);
					circle.drawCircle(x, start_y, 48, 0);
					circle.endFill();
					window.requestAnimationFrame(drawFall);
					return self.renderer.render(self.stage)
				}
				setTimeout(function()
				{
					return resolve()

				}, 100)
			}
			return drawFall()
		});
	},
	switchTurn(column)
	{
		let user  	= this.player_one
		let other 	= this.player_two
		let winner 	= this.findWinner(column)
		if(winner) return this.endGame(winner);
		if(this.active_user.id === user.id) this.active_user = other;
		else this.active_user = user;
		this.user_token.style.background = this.active_user.color_obj.hex
		this.user_token.innerHTML 		 = '<img src="'+this.active_user.emoji_img+'" style="width:80px">';
		if(this.active_user.ai) return this.makeAiTurn();
		if(this.active_user.id == 2 && this.multiplayer_session_active) return;
		this.controls_blocked = null;
	},
	endGame(winner)
	{
		var balls 				= winner.balls
		var half_tile 			= this.tile_size / 2
		var quad_tile 			= this.tile_size / 4
		var emoji 				= balls[0].emoji_img
		for (var i = balls.length - 1; i >= 0; i--) 
		{
			var sprite 			= PIXI.Sprite.fromImage(emoji)
				sprite.x 		= balls[i].x - quad_tile;
				sprite.y 		= balls[i].y - quad_tile;
				sprite.width 	= half_tile;
				sprite.height 	= half_tile;
				sprite.tint 	= 0xFFFFFFFFF;
			balls[i].ball.addChild(sprite);
		}
		this.animate()
		this.in_progress = false;
		self.winner_text.innerHTML  = '<h5 class="winner_title">PLAYER #'+winner.id+' HAS WON!</h4>'
								 	+ '<h5 class="winner_title" style="cursor:pointer;color:saddlebrown" id="play_again">PLAY AGAIN</h4>';
		self.restart_button = document.getElementById("play_again")
		self.restart_button.addEventListener(function(){
			self.startGame()
		})
		self.winner_text.style.display = 'block';
	},
	updateColumn(column, position) 
	{
		var self = this
		if(!column && position) column = position.x / this.tile_size
		if(this.multiplayer_session_active && this.active_user.id === 1) this.socket.emit('dropBall', this.multiplayer_session, column);
		// console.log('===== updating column #'+column+' =====')
		let ball 	= JSON.parse(JSON.stringify(self.active_user));
		if(self.column_counter[column]) 
		{
			if(self.column_counter[column].height == 1) return null;
			self.column_counter[column].height--;
			self.column_counter[column].positions.push(ball);
		}
		else self.column_counter[column] = {
			index:column,
			height:this.rows,
			positions:[ball]
		}
		self.controls_blocked = true;
		self
		.animateFall(self.column_counter[column])
		.then(function()
		{
			self.switchTurn(column)
		})
	},
	createLevel()
	{
		var self 				= this;
			self.background 	= new PIXI.Container();
			self.background.x 	= this.width;
			self.background.y 	= this.height;
			self.tiles 			= []
			self.balls 			= []
			self.column_counter = {}
			self.unused_balls 	= []
			self.stage.addChild(self.background)

		var field_length 			= 10;
		var tile_size 	 			= self.tile_size

		self.columns 		= this.width / tile_size
		self.rows		 	= this.height / tile_size
		self.column_counter = {}


		var onColumnDown = function() {
			if(self.controls_blocked) return;
			if(self.multiplayer_session_active && self.active_user.id === 2) return;
			self.updateColumn(null, this.position)
		}

		for (var j = 0; j < field_length; j++) 
		{
		    for (var i = 0; i < field_length; i++) 
		    {
		        var tile = PIXI.Sprite.fromImage('texture.jpg');
		        	tile.x = tile_size * i;
		        	tile.y = tile_size * j;
		        	tile.interactive = true;
		        	tile.on('mousedown', onColumnDown);
		        	tile.on('touchstart', onColumnDown);
		        self.tiles.push(tile);
		        self.stage.addChild(tile);
		    };
		}
		self.animate()
	},
	startGame(options)
	{
		if(!this.restarting_multiplayer) this.active_user = this.player_one
		var self  		= this
		self.winner_text.innerHTML = '';
		self.winner_text.style.display = 'none';
		var runGame 		= function()
		{
			// console.log('===== running game #'+self.game_count+' starting player #'+self.active_user.id+' =======')
			self.game_count++;
			self.user_token.style.background = self.active_user.color_obj.hex
			self.user_token.innerHTML 		 = '<img src="'+self.active_user.emoji_img+'" style="width:80px">';
			self.controls_blocked 			 = null;
			self.in_progress 				 = true;
			self.restarting_multiplayer   	 = null;

		}
		if(this.canvas) 
		{
			if(this.balls.length)
			{
				for (var i = this.balls.length - 1; i >= 0; i--) 
				{
					this.stage.removeChild(this.balls[i])
					this.balls[i].removeChildren();
					this.balls[i].clear()
					this.balls[i].visible = false;
					this.unused_balls.push(this.balls[i])
				}
				this.balls.length 	= 0
				this.column_counter = {}
			}
		}
		else
		{
			this.createCanvas();
			this.createLevel();
		} 
		if(this.mode == 'single') this.player_two = ai_profile
		if(this.mode == 'multi' && !this.restarting_multiplayer) 
		{
			if(!this.multiplayer_session_active) return this.createSession().then(runGame);
			return this.socket.emit('restartGame', this.multiplayer_session)
		}
		if(this.mode == 'hot') 	return this.addHotSeat().then(runGame);
		return runGame();
	},
	makeAiTurn()
	{
		var self = this
		var cols = self.columns
		var counter = self.column_counter
		var getRandomColumn = function()
		{
			var col = getRandomInt(0, cols-1)
			if(counter[col] && counter[col].positions.length === self.rows) 
			{
				var keys = Object.keys(self.column_counter)
				for (var i = keys.length - 1; i >= 0; i--) if(counter[keys[i]].positions.length < self.rows) return keys[i];
			}
			return col;
		}
		var random = getRandomColumn()

		// console.log('===== making ai move random is '+random+' =====')

		var tryTargetedMove = function(move)
		{
			if(move.column && counter[move.column] && counter[move.column].positions.length < self.rows)
			{
				// console.log('==== making targeted move '+move.type+' '+move.column+' =====')
				if(move.type == 'vertical') 	return self.updateColumn(move.column);
				if(move.type == 'horizontal') 	return self.updateColumn(move.column);
				if(move.type == 'cross') 		return self.updateColumn(move.column);
			}
			self.updateColumn(random)
		}
		var perfect_move = this.findWinner(null, 3)
		if(perfect_move)
		{
			if(perfect_move.id === 1) return tryTargetedMove(perfect_move)
			else 
			{
				if(perfect_move.column) return tryTargetedMove(perfect_move)
			}
		}
		setTimeout(function(){
			self.updateColumn(random)
		}, 400)

	},
	findWinner(changed_column, winning_number)
	{
		var counter = this.column_counter
		var keys  	= Object.keys(counter) 
		if(!winning_number) winning_number = 4
		var checkVertical = function(column)
		{
			var winner 	= {}
			var balls 	= column.positions
			var prevID 	= 0;
			for (var i = balls.length - 1; i >= 0; i--) 
			{
				if(balls[i].id == prevID) 
				{
					if(prevID == winner.id) 
					{
						winner.score++;
						winner.balls.push(balls[i])
						continue;
					}
					winner.id 	  = balls[i].id
					winner.score  = 2;
					winner.type   = 'vertical';
					winner.column = column.index;
					winner.balls  = [balls[i], balls[i+1]] 
				}
				if(checkHorizontal(column, balls[i], i)) return checkHorizontal(column, balls[i], i)
				prevID = balls[i].id
			}
			if(winner.score === winning_number) return winner;
			return null;
		}
		var checkHorizontal = function(column, ball, ball_index)
		{
			var winner 	= {}
			for (var i = keys.length - 1; i >= 0; i--) 
			{
				var col 		= counter[keys[i]];
				var id 			= col.index
				var side_ball 	= col.positions[ball_index]

				var score		= 2;
				if(winner.score) score = winner.score;
				var range 		= column.index - id
				if(range > 0) var adjacent = range < score;
				if(range < 0) var adjacent = range > -score;
				if(adjacent && checkCross(column, ball, ball_index, col)) return checkCross(column, ball, ball_index, col);
				if(side_ball && adjacent && ball.id == side_ball.id) 
				{
					if(ball.id == winner.id) 
					{
						winner.score++;
						winner.balls.push(side_ball)
						continue;
					}
					winner.id 	 = side_ball.id
					winner.score = 1;
					winner.type  = 'horizontal';
					winner.balls = [ball, side_ball]

				}
			}
			if(winner.score === winning_number) return winner;
			return null;

		}
		var checkCross = function(column, ball, ball_index, adjacent_column)
		{
			var balls 		= adjacent_column.positions
			var winner 		= 
			{
				id:ball.id,
				balls:[ball],
				score:1,
				type:'cross'
			}
			if(column.index > adjacent_column.index) var column_direction = -1 
			else var column_direction = 1;
			var angleMatch 	= function(direction, diff)
			{
				var angle_column = counter[adjacent_column.index + diff]
				if(angle_column && angle_column.index != column.index)
				{
					var column_ball  = angle_column.positions[ball_index+direction]
					var match = (column_ball && ball.id === column_ball.id)
					if(match) return column_ball;
				}
				return null
			}
			var lower_ball 	= angleMatch(-1, 0)
			var upper_ball 	= angleMatch(+1, 0)
			if(lower_ball || upper_ball)
			{
				var direction   = 1;
				var second_ball = upper_ball;
				if(lower_ball) 
				{
					direction 	= -1;
					second_ball = lower_ball;
				}

				winner.score++;
				winner.balls.push(second_ball)
				let third_ball = angleMatch(2*direction, 1*column_direction)
				if(third_ball)
				{
					winner.score++;
					winner.balls.push(third_ball)
					let fourth_ball = angleMatch(3*direction, 2*column_direction)
					if(fourth_ball)
					{
						winner.score++;
						winner.balls.push(fourth_ball)
					}
					else
					{
						var fourth_column = counter[adjacent_column.index + (2*column_direction)]
						if(fourth_column && !fourth_column.positions[ball_index+(3*direction)])
						{
							winner.column = fourth_column.index;
						}
					}
				}
				else
				{
					winner.horz_step = column_direction
					winner.vert_step = direction
				}
			}

			if(winner.score === winning_number) return winner;
			return null;
		}
		if(changed_column)
		{
			var items = [counter[changed_column]]
			if(counter[changed_column-1]) items.push(counter[changed_column-1])
			if(counter[changed_column+1]) items.push(counter[changed_column+1])
			for (var i = items.length - 1; i >= 0; i--) if(checkVertical(items[i])) return checkVertical(items[i]);
		}
		for (var i = keys.length - 1; i >= 0; i--) 
		{
			let item = counter[keys[i]]
			if(checkVertical(item)) return checkVertical(item);
		}
		return null;
	},

}