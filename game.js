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
let slidingDirection = Direction.RIGHT;
let maxTileValue = 2;
let score = 0;
let isAnimationActive = false;

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    frameRate(50);
    grid = createMatrix(rowCount,colCount, 0);
    oldGrid = copyMatrix(grid);
    console.log(getFlippedSpot({x:0, y:0}, 4));
    console.log(getFlippedSpot({x:1, y:0}, 4));
    console.log(getFlippedSpot({x:1, y:1}, 4));
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
	console.log("findTileByCoords => x= " + x + " y = " + y);
	console.log("slidingDirection = ", slidingDirection);
	var spot = { x: x, y: y };
	switch(slidingDirection){
		case Direction.RIGHT:
			break;
		case Direction.DOWN:
			spot = getTransposedSpot(spot);
			//rotateMatrix(grid, false);
			break;
		case Direction.UP:
			spot = getFlippedSpot(getTransposedSpot(spot), colCount, false);
			//rotateMatrix(grid, true);
			break;
		case Direction.LEFT:
			spot = getFlippedSpot(spot, rowCount, true);
			//flipMatrix(grid, true);
			break;
	}

	console.log("spot = ", spot);
	for(let i = 0; i < tiles.length; ++i){
		if(tiles[i].destX === spot.x * tileSize && tiles[i].destY === spot.y * tileSize){
			console.log("tile found: ", tiles[i]);
			return tiles[i];
		}
	}
	return undefined;
}

function slide(direction){
	//oldGrid = copyMatrix(grid);
	if(isAnimationActive)
		return;

	switch(direction){
		case Direction.RIGHT:
			slidingDirection = Direction.RIGHT;
			break;
		case Direction.DOWN:
			slidingDirection = Direction.DOWN;
			transposeMatrix(grid);
			break;
		case Direction.UP:
			slidingDirection = Direction.UP;
			rotateMatrix(grid, true);
			break;
		case Direction.LEFT:
			slidingDirection = Direction.LEFT;
			//console.log("trying to slide left");
			flipMatrix(grid, true);
			//console.table(grid);
			break;
	}

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
						console.log("col = " + col + " y = " + y);
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

				let destSpot = { x: 0, y: 0 };
				if(isMerging){
					destSpot.x = col + 1;
				} else {
					destSpot.x = col;
				}
				destSpot.y = y;
				console.log("destSpot = ", destSpot);

				switch(direction){
					case Direction.RIGHT:
						break;
					case Direction.DOWN:
						destSpot = getTransposedSpot(destSpot);
						//rotateMatrix(grid, false);
						break;
					case Direction.UP:
						destSpot = getRotatedSpot(destSpot, rowCount, false);
						//rotateMatrix(grid, true);
						break;
					case Direction.LEFT:
						destSpot = getFlippedSpot(destSpot, rowCount, true);
						//flipMatrix(grid, true);
						break;
				}

				
				tileToSlide.destX = destSpot.x * tileSize;
				tileToSlide.destY = destSpot.y * tileSize;
				console.log("tileToSlide.destX = " + tileToSlide.destX);
				console.log("tileToSlide.destY = " + tileToSlide.destY);
				console.log("tileToSlide.isSliding() = ", tileToSlide.isSliding());
				isAnimationActive = true;
			}
		}
	}

	switch(direction){
		case Direction.RIGHT:
			break;
		case Direction.DOWN:
			transposeMatrix(grid);
			break;
		case Direction.UP:
			rotateMatrix(grid, false);
			break;
		case Direction.LEFT:
			flipMatrix(grid, true);
			break;
	}

	//console.log("exit function slide(direction)");
	//(grid);
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
				tile.slide(slidingDirection);
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
	//console.table(grid);
}

function keyReleased(){
	//console.log("enter keyReleased()");
	//console.table(grid);
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
			//console.log("case DOWN_ARROW");
			//console.table(grid);
			slide(Direction.DOWN);
			//rotateMatrix(grid, false);
			break;
	}
	//console.log("exit keyReleased()");
	//console.table(grid);
}