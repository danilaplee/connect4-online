
import React 	from 'react';
import ReactDOM from 'react-dom';
import MapModal from './components/map_modal.jsx'

import {profiles, getRandomInt, fire_id} from './game_engine';

const ai_profile = profiles[0]
const fire_profile = profiles[1]
const default_column = (id, burn_index) => {
	const obj = {
		index:id,
		height:11,
		positions:[fire_profile]
	}
	return obj
}
export default {
	burnTower(burn_index) {
		return new Promise(resolve => {
			if(this.burned == burn_index) return resolve();
			if(!this.fires) this.fires = []
			if(this.burned) var prev_burn = parseInt(this.burned)
			this.burned = burn_index;
			var fire_diff = 0;
			if(burn_index > 2) fire_diff = (burn_index - 2)*this.tile_size
			const bottom_tiles = []
			for (var i = 0; i < this.tiles.length; i++) {
				if(prev_burn && this.tiles[i].position.y - (prev_burn*this.tile_size) <= 0) continue;
				if(this.tiles[i].position.y - (burn_index*this.tile_size) <= 0) bottom_tiles.push(this.tiles[i]);
			} 

			const burn = (resources) => {	

				const fire_height = ((this.height/this.tile_size) - burn_index) + 1;
				const width_length = this.width/this.tile_size

				const fire_textures = [
					PIXI.Texture.fromFrame('fire_sequence_1.png'),
					PIXI.Texture.fromFrame('fire_sequence_2.png'),
					PIXI.Texture.fromFrame('fire_sequence_3.png'),
					PIXI.Texture.fromFrame('fire_sequence_4.png')
				]

				for (var i = 0; i < bottom_tiles.length; i++) {
					var fire_animation = new PIXI.extras.AnimatedSprite(fire_textures);
						fire_animation.x = bottom_tiles[i].x
						fire_animation.y = this.height - bottom_tiles[i].y
						fire_animation.loop = true;
					    fire_animation.animationSpeed = 0.2;
						fire_animation.alpha = 1;
						fire_animation.scale.x = 0.5;
						fire_animation.scale.y = 0.5;
						fire_animation.play()
						this.fires.push(fire_animation)
						this.stage.addChild(fire_animation)
				}
				var counter = 0;
				while(counter <= width_length)
				{
					if(!this.column_counter[counter]) this.column_counter[counter] = default_column(counter, burn_index)
					else {
						for (var i = 0; i < burn_index; i++) this.column_counter[counter].positions[i] = fire_profile;
						if(this.column_counter[counter].height > fire_height) this.column_counter[counter].height = fire_height
					}
					counter += 1;
				}
				resolve()
			}

			if(!this.loaded_fire_sequence) return PIXI.loader
				.add('fire_sequence', "/bin/fire.json")
				.load((loader, resources) => {

					this.loaded_fire_sequence = true;
					burn(resources)
			})
			setTimeout(burn, 300)
		})
	},
	runFX()
	{
		return new Promise(resolve => {

			if(this.map_type == "tower")
			{
				var theight = 20;
				var keys 	= Object.keys(this.column_counter)

				for (var i = keys.length - 1; i >= 0; i--) if(theight > this.column_counter[keys[i]].height) theight = this.column_counter[keys[i]].height
				
				if(theight == 9) return this.burnTower(1).then(resolve)
				if(theight == 7) return this.burnTower(2).then(resolve)
				if(theight == 5) return this.burnTower(3).then(resolve)
				if(theight == 3) return this.burnTower(4).then(resolve)
				if(theight == 2) return this.burnTower(5).then(resolve)
				if(theight == 1) return this.burnTower(7).then(resolve)
			}

			resolve()
		})
	},
	selectLevel(map)
	{
		const fixClass = (add) => {
			this.gametable.className = this.gametable.className.replace("game-cog", "")
			this.gametable.className = this.gametable.className.replace("game-tower", "")
			this.gametable.className = this.gametable.className.replace("game-classic", "")
			this.gametable.className = this.gametable.className.replace(" game-cog", "")
			this.gametable.className = this.gametable.className.replace(" game-tower", "")
			this.gametable.className = this.gametable.className.replace(" game-classic", "")
			this.gametable.parentElement.style.width = this.width + "px"
			if(add) this.gametable.className += "game-"+add
		}

		const setMap = 
		{
			tower:() => {
				this.width  = 600;
				this.height = 1100;
				fixClass(this.map_type)
			},
			classic:() => {
				this.width  = 1000;
				this.height = 600;
				fixClass(this.map_type)	
			},
			cog:() => {
				this.width  = 700;
				this.height = 700;
				fixClass(this.map_type)	
			}
		}

		if(map)
		{
			this.map_type = map;
			setMap[map]()
			this.createCanvas()
			this.createLevel()
			return this.startGame();
		}
		
		return new Promise(resolve => {

			var myNode 	= this.modal_container;
			
			while (myNode.firstChild) ReactDOM.unmountComponentAtNode(myNode)
				
			new Promise(res => {
				ReactDOM.render(React.createElement(MapModal, {game:this, promise:res, title:"Select a Level"}), myNode);
				myNode.style.display = "block";
			})
			.then(map => {
				this.map_type = map;
				setMap[map]()
				this.createCanvas()
				this.createLevel()
				resolve(this.startGame())
			})
		})
	},
	createLevel()
	{
		delete this.burned;
		var self 				= this;
			self.background 	= new PIXI.Container();
			self.background.x 	= this.width;
			self.background.y 	= this.height;
			self.tiles 			= []
			self.balls 			= []
			self.column_counter = {}
			self.unused_balls 	= []
			self.fires 			= []
			self.stage.addChild(this.background)

		const tile_size 	 	= this.tile_size
		const width_length 		= this.width / tile_size;
		const height_length 	= this.height / tile_size;

		self.columns 		= this.width / tile_size
		self.rows		 	= this.height / tile_size
		self.column_counter = {}


		var onColumnDown = function() {
			if(self.controls_blocked) return;
			if(self.multiplayer_session_active && self.active_user.id === 2) return;
			self.updateColumn(null, this.position)
		}
		for (var i = 0; i < width_length; i++) {
			for (var j = 0; j < height_length; j++) {
		        var tile = PIXI.Sprite.fromImage('texture.png');
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
}