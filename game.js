const GameState = Object.freeze({ 
	PLAYING: 0,
	SUCCEEDED_2048: 1,
	PLAYING_AFTER_2048: 2,
	DEFEAT: 3
});

const Direction = Object.freeze({
 	LEFT: { dx: -1, dy: 0 },
 	RIGHT: { dx: +1, dy: 0 },
 	UP: { dx: 0, dy: -1 },
 	DOWN: { dx: 0, dy: 1 }
 });

const FOUR_PROBABILITY = 0.1;
const HALF_GAP = 7;
const WINNIG_SCORE = 2048;
var tileSize = 100;
let rowCount = 4;
let colCount = 4;
var canvasWidth = colCount * tileSize + HALF_GAP;
var canvasHeight = rowCount * tileSize + HALF_GAP;
let grid, oldGrid;
let gridRotation = 0;
let tiles = [];
let mergingTiles = [];
let gameState = GameState.PLAYING;
let slideDirection = Direction.RIGHT;
let maxTileValue = 2;
let score = 0;
let isAnimationActive = false;

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    frameRate(50);
    grid = createMatrix(rowCount,colCount, 0);
    //addTile();
    //addTile();
    createTestTiles();
}

function createTestTiles(){
	grid[0][0] = 2;
    let tile = new Tile(0 * tileSize, 0 * tileSize, 2);
	tiles.push(tile);
	grid[0][2] = 2;
	tiles.push(new Tile(2 * tileSize, 0 * tileSize, 2));
	grid[0][3] = 4;
	tiles.push(new Tile(3 * tileSize, 0 * tileSize, 4));
	for(let i = 0; i < 4; ++i){
		grid[1][i] = 2;
		tiles.push(new Tile(i * tileSize, tileSize, 2));
	}

	grid[2][0] = 4;
	tiles.push(new Tile(0 * tileSize, 2 * tileSize, 4));

	grid[2][2] = 4;
	tiles.push(new Tile(2 * tileSize, 2 * tileSize, 4));
}
    /*
}
function getFlippedSpot(spot, dimension, horizontally = true){
function getRotatedSpot(spot, dimension, clockwise = true){
    */

function addTile(){
	emptySpots = [];
	grid.forEach((row, i) => {
		row.forEach((val, j) => {
			if(val === 0){
				emptySpots.push({x:j, y:i});
			}
		});
	});

	if(emptySpots.length > 0){
		let randSpot = random(emptySpots);
		let randValue = random(1) < FOUR_PROBABILITY ?  4 : 2;
		grid[randSpot.y][randSpot.x] = randValue;
		tiles.push(new Tile(randSpot.x * tileSize, randSpot.y * tileSize, randValue));

	} else {
		if(checkGameOver()){
			gameState = GameState.DEFEAT;
		}
	}
}



function getNeighbours(x, y){
	let neighbours = [];
	let offsets = [ { dx:1, dy:0 }, { dx:0, dy:1 }, { dx:-1, dy:0 }, { dx:0, dy:-1 } ];
	for(let offset = 0; offset < offsets.length; ++offset){
		let nx = x + offset.dx;
		let ny = y + offset.dy;
		if(isValidSpot(nx, ny)){
			neighbours.push(grid[ny][nx]);
		}
	}
	return neighbours;
}

function isValidSpot(x,y){
	return x >= 0 && x < grid.length && y >= 0 && y < grid[y].length;
}

function findTileByCoords(x,y){
	for(let i = 0; i < tiles.length; ++i){
		if(tiles[i].destX === x * tileSize && tiles[i].destY === y * tileSize){
			return tiles[i];
		}
	}
	return undefined;
}

function slide(direction){
	for(let y = 0; y < grid.length; ++y){
		for(let x = grid[y].length - 2; x >= 0; --x){
			if(grid[y][x] > 0){
				let tileToSlide = findTileByCoords(x,y); 
				let col = x;
				let isMerging = false;
				inner:
				while(col < grid[y].length - 1){
					if(grid[y][col + 1] === 0){
						grid[y][col + 1] = grid[y][col];
						grid[y][col] = 0;
						++col;
					} else if(grid[y][col + 1] === grid[y][col]){
						let tileToMerge = findTileByCoords(col + 1, y);
						if(!tileToMerge.isMerged){
							tileToMerge.isMerged = true;
							tileToSlide.isMerged = true;
							grid[y][col + 1] *= 2;
							grid[y][col] = 0;
							mergingTiles.push({toMerge: tileToMerge, toRemove: tileToSlide, merged: false });
							isMerging = true;
							break inner;
						}
					} else {
						break inner;
					}
				}
				if(isMerging){
					tileToSlide.destX = (col + 1) * tileSize;
				} else {
					tileToSlide.destX = col * tileSize;
				}
				isAnimationActive = true;
			}
		}
	}

}



function renderEmptyField(){
	grid.forEach((row, y) => {
		row.forEach((value, x) => {			
			fill("#b28e77");
			noStroke();
			rect(x * tileSize + HALF_GAP, y * tileSize + HALF_GAP,
		 		 tileSize - HALF_GAP, tileSize - HALF_GAP);	
		});
	});
}

function mergeTiles(couple){
	couple.toMerge.value *= 2;
	score += couple.toMerge.value;
	if(maxTileValue < couple.toMerge.value){
		maxTileValue = couple.toMerge.value;
	}
	couple.merged = true;
	let indexToRemove = 0;
	for(let i = 0; i < tiles.length; ++i){
		if(tiles[i] === couple.toRemove){
			indexToRemove = i;
			break;
		}
	}
	tiles.splice(indexToRemove, 1);
}

function mayBeStopAnimation(){
	for(let i = 0; i < tiles.length; ++i){
		if(tiles[i].isSliding()){
			return false;
		}
	}
	for(let i = 0; i < mergingTiles.length; ++i){
		if(!mergingTiles[i].merged){
			return false;
		}
	}
	return true;
}



function gameTick(){
	if(isAnimationActive){
		tiles.forEach(tile => {
			if(tile.isSliding()){
				tile.slide(slideDirection);
			}
		});
		for(let i = 0; i < mergingTiles.length; ++i){
			if(!mergingTiles[i].merged
			 && mergingTiles[i].toRemove.x === mergingTiles[i].toMerge.x
			  && mergingTiles[i].toRemove.y === mergingTiles[i].toMerge.y){
				mergeTiles(mergingTiles[i]);
			}
		}
		isAnimationActive = !mayBeStopAnimation();
		if(!isAnimationActive){
			mergingTiles = [];
			if(gameState === GameState.PLAYING){
				checkWin();
			}
			resetMergingFactor();
		}
	}
}

/*
  def tick( self ):
        if self.__is_animating:
            for tile in self.tiles:
                if tile.is_sliding():
                    tile.slide( self.__animation_direction )
            for pair in self.__merging_tiles:
                if ( not pair[2] ) and pair[0].x == pair[1].x and pair[0].y == pair[1].y:
                     self.__merge_tiles_( pair )
            self.__is_animating = self.__check_animation_()
            if not self.__is_animating:
                self.__merging_tiles.clear()
                #self.__synchronize_tiles_with_grid_()
                if self.game_state == GameState.PLAYING:
                    self.__check_win_()
                self.__reset_merging_factor_()
                if self.__check_if_something_moved_():
                    self.__place_new_tile_()
                    if ( self.__count_free_spots_() == 0
                     and not self.__check_if_player_has_merging_moves_() ):
                        self.__game_over_()
                self.print_grid()
*/

function checkWin(){
	if(maxTileValue >= WINNIG_SCORE){
		gameState = GameState.SUCCEEDED_2048;
	}
}

function checkGameOver(){
	for(let y = 0; y < grid.length; ++y){
		for(let x = 0; x < grid[y].length; ++x){
			let neighbours = getNeighbours(x,y);
			for(let i = 0; i < neighbours.length; ++i){
				if(neighbours[i] === grid[y][x]){
					return false;
				}
			}
		}
	}
	return true;
}

function resetMergingFactor(){
	tiles.forEach(tile => tile.isMerged = false);
}

//main loop
function draw() {
	gameTick();
	background("#9d816f");
	renderEmptyField();
	tiles.forEach(tile => tile.render());
}

function keyReleased(){
	if(key === ' '){
		addTile();
	}
	switch(keyCode){
		case LEFT_ARROW:
			slide(Direction.LEFT);
			//flipMatrix(grid);
			break;
		case RIGHT_ARROW:
			slide(Direction.RIGHT);
			//flipMatrix(grid, false);
			break;
		case UP_ARROW:
			slide(Direction.UP);
			//rotateMatrix(grid);
			break;
		case DOWN_ARROW:
			slide(Direction.DOWN);
			//rotateMatrix(grid, false);
			break;
	}
	console.table(grid);
}