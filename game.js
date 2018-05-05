const ANIMATION_SPEED = 10;
const SIDE_INFO_PANEL_WIDTH = 300;
const RADIUS = 30;
const HALF_GAP = 7;
const TILE_SIZE = 100;
const WINNIG_SCORES = Object.freeze( { "3": 1024, "4": 2048, "5": 4096 } );
const FOUR_PROBABILITY = 0.1;
const START_TILE_COUNT = 2;
let rowCount = 4;
let colCount = 4;
var canvasWidth = colCount * TILE_SIZE + HALF_GAP + SIDE_INFO_PANEL_WIDTH;
var canvasHeight = rowCount * TILE_SIZE + HALF_GAP;
let grid, oldGrid;
let tiles = [];
let mergingTiles = [];

const GameState = Object.freeze({ 
	PLAYING: 0,
	SUCCEEDED_2048: 1,
	PLAYING_AFTER_2048: 2,
	DEFEAT: 3
});

let gameState = GameState.PLAYING;

const Direction = Object.freeze({
 	LEFT: { dx: -1, dy: 0 },
 	RIGHT: { dx: +1, dy: 0 },
 	UP: { dx: 0, dy: -1 },
 	DOWN: { dx: 0, dy: 1 }
 });

let slidingDirection = Direction.RIGHT;
let maxTileValue = 2;
let score = 0;
let numMoves = 0;
let isAnimationActive = false;
var buttons = [];

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    createButtons();
    frameRate(30);
    grid = createMatrix(rowCount,colCount, 0);
    startNewGame(rowCount, colCount);
}

function createButtons(){
	for(let i = 3; i <= 5; ++i){
		let button = createButton(i + "x" + i);
	    button.position(5 + (i - 3) * 105, canvasHeight + 5);
	    button.id("btn" + i);
	    button.mousePressed(event => {
	    	startNewGame(i, i);
	    });
	    buttons.push(button);
	}
}

function startNewGame(rows, cols){
	rowCount = rows;
	colCount = cols;
	canvasWidth = colCount * TILE_SIZE + HALF_GAP + SIDE_INFO_PANEL_WIDTH;
    canvasHeight = rowCount * TILE_SIZE + HALF_GAP;
    resizeCanvas(canvasWidth, canvasHeight);
    buttons.forEach(btn => {
    	btn.position(btn.position.x, height + 5);
    });

	maxTileValue = 2;
 	score = 0;
	isAnimationActive = false;
	numMoves = 0;
	tiles = [];
	mergingTiles = [];
	
	grid = createMatrix(rowCount,colCount, 0);
	oldGrid = copyMatrix(grid);
	for(let i = 0; i < START_TILE_COUNT; ++i){
    	placeNewTile();
    }
    gameState = GameState.PLAYING;
}

function getEmptySpots(){
	let emptySpots = [];
	grid.forEach((row, i) => {
		row.forEach((val, j) => {
			if(val === 0){
				emptySpots.push({x:j, y:i});
			}
		});
	});
	return emptySpots;
}

function placeNewTile(){
	let emptySpots = getEmptySpots();

	if(emptySpots.length > 0){
		let randSpot = random(emptySpots);
		let randValue = random(1) < FOUR_PROBABILITY ?  4 : 2;
		grid[randSpot.y][randSpot.x] = randValue;
		let newTile = new Tile(randSpot.x * TILE_SIZE, randSpot.y * TILE_SIZE, randValue);
		newTile.highlight = true;
		tiles.push(newTile);
		if(randValue > maxTileValue){
			maxTileValue = randValue;
		}
		if(checkGameOver()){
			gameState = GameState.DEFEAT;
			console.log("defeat from gameTick to placeNewTile");
		}
	} else {
		gameState = GameState.DEFEAT;
		console.log("defeat from placeNewTile");
	}
}

function checkGameOver(){
	console.log("checkGameOver");
	let emptySpots = getEmptySpots();
	if(emptySpots.length > 0){
		console.log("Empty spots founded");
		return false;
	} else {
		console.log("no emptySpots");
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
		console.log("no merging moves");
		return true;
	}
}

function getNeighbours(x, y){
	let neighbours = [];
	let offsets = [ { dx:1, dy:0 }, { dx:0, dy:1 }, { dx:-1, dy:0 }, { dx:0, dy:-1 } ];
	for(let i = 0; i < offsets.length; ++i){
		let nx = x + offsets[i].dx;
		let ny = y + offsets[i].dy;
		if(isValidSpot(nx, ny)){
			neighbours.push(grid[ny][nx]);
		}
	}
	return neighbours;
}

function isValidSpot(x,y){
	return y >= 0 && y < grid.length && x >= 0 && x < grid[y].length;
}

function findTileByCoords(x,y){
	var spot = { x: x, y: y };
	switch(slidingDirection){
		case Direction.RIGHT:
			break;
		case Direction.DOWN:
			spot = getTransposedSpot(spot);
			break;
		case Direction.UP:
			spot = getRotatedSpot(spot, rowCount, true);
			//spot = getTransposedSpot(getFlippedSpot(spot, rowCount, true));
			break;
		case Direction.LEFT:
			spot = getFlippedSpot(spot, colCount);
			break;
	}

	for(let i = 0; i < tiles.length; ++i){
		if(tiles[i].destX === spot.x * TILE_SIZE && tiles[i].destY === spot.y * TILE_SIZE){
			return tiles[i];
		}
	}
	return undefined;
}

function transformGrigBeforeSliding(direction){
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
			//transposeMatrix(grid);
			//flipMatrix(grid, true);
			rotateMatrix(grid, true);
			//console.log("Matrix after rotation");
			console.table(grid);
			break;
		case Direction.LEFT:
			slidingDirection = Direction.LEFT;
			flipMatrix(grid);
			break;
	}
}

function slide(direction){

	if(isAnimationActive)
		return;

	oldGrid = copyMatrix(grid);

	transformGrigBeforeSliding(direction);

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
							mergingTiles.push({toMerge: tileToMerge,
							 toRemove: tileToSlide, merged: false });
							isMerging = true;
						}
						break inner;
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

				switch(direction){
					case Direction.RIGHT:
						break;
					case Direction.DOWN:
						destSpot = getTransposedSpot(destSpot);
						break;
					case Direction.UP:
						destSpot = getRotatedSpot(destSpot, rowCount, true);
						break;
					case Direction.LEFT:
						destSpot = getFlippedSpot(destSpot, colCount);
						break;
				}

				tileToSlide.destX = destSpot.x * TILE_SIZE;
				tileToSlide.destY = destSpot.y * TILE_SIZE;
				isAnimationActive = true;
			}
		}
	}

	undoGridTransformations(direction);
	
}

function undoGridTransformations(direction){
	switch(direction){
		case Direction.RIGHT:
			break;
		case Direction.DOWN:
			transposeMatrix(grid);
			break;
		case Direction.UP:
			rotateMatrix(grid, false);
			//flipMatrix(grid, true);
			//transposeMatrix(grid);
			break;
		case Direction.LEFT:
			flipMatrix(grid);
			break;
	}
}

function renderEmptyField(){
	grid.forEach((row, y) => {
		row.forEach((value, x) => {			
			fill("#b28e77");
			stroke(0);
			strokeWeight(1);
			//noStroke();
			rect(x * TILE_SIZE + HALF_GAP, y * TILE_SIZE + HALF_GAP,
		 		 TILE_SIZE - HALF_GAP, TILE_SIZE - HALF_GAP, RADIUS, RADIUS);	
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
			resetTiles();

			if(checkIfSomethingMoved()){
				placeNewTile();
				++numMoves;
				/*if(checkGameOver()){
					gameState = GameState.DEFEAT;
					console.log("defeat from gameTick");
				}*/
			}
		}
	}
}

function checkIfSomethingMoved(){
	console.log("check if something moved")
	for(let y = 0; y < grid.length; ++y){
		for(let x = 0; x < grid[y].length; ++x){
			if(grid[y][x] !== oldGrid[y][x]){
				console.log("x = " + x + " y = " + y + " moved");
				return true;
			}
		}
	}
	console.log("nothing moved")
	return false;
}

function checkWin(){
	if(maxTileValue >= WINNIG_SCORES[rowCount + ""]){
		gameState = GameState.SUCCEEDED_2048;
	}
}


function resetTiles(){
	tiles.forEach(tile => tile.isMerged = false);
	tiles.forEach(tile => tile.highlight = false);
}

//main loop
function draw() {
	gameTick();
	background("#896751");
	renderEmptyField();
	renderGameInfo();
	tiles.forEach(tile => tile.render());
}

function renderGameInfo(){
	const rightBorder = colCount * TILE_SIZE;
	fill(200,200,200);
	noStroke();
	rect(rightBorder + HALF_GAP, 0, canvasWidth - rightBorder, canvasHeight);
	textSize(36);
	textAlign(LEFT, TOP);
	fill(0,127,0);
	text("Score: " + score, rightBorder + HALF_GAP, 5);
	fill(127,0,0);
	text("Max value: " + maxTileValue, rightBorder + HALF_GAP, 50);
	fill(255,255,0);
	text("Move number: " + numMoves, rightBorder + HALF_GAP, 100);
	fill(0,0,127);
	textSize(24);
	switch(gameState){
		case GameState.SUCCEEDED_2048:
			fill(0,127,0);
			text("Congratulations!You won!!!\n" +
				"Press space to keep going\n" + 
				"or N to start new game", rightBorder + HALF_GAP, 150);
			break;
		case GameState.DEFEAT:
			fill(255,0,0);
			text("Game over!!!\nPress N to start new game", 
				rightBorder + HALF_GAP, 150);
			break;
		default:
			break;
	}
}

function keyReleased(){
	if(key === 'N'){
		startNewGame(rowCount, colCount);
	} else if(key === ' ' && gameState === GameState.SUCCEEDED_2048){
		gameState = GameState.PLAYING_AFTER_2048;
	}

	if(gameState === GameState.PLAYING
	 || gameState === GameState.PLAYING_AFTER_2048){
	 	switch(keyCode){
			case LEFT_ARROW:
				slide(Direction.LEFT);
				break;
			case RIGHT_ARROW:
				slide(Direction.RIGHT);
				break;
			case UP_ARROW:
				slide(Direction.UP);
				break;
			case DOWN_ARROW:
				slide(Direction.DOWN);
				break;
		}
	}
}

function createTestTiles(){
	grid[0][0] = 2;
    let tile = new Tile(0 * TILE_SIZE, 0 * TILE_SIZE, 2);
	tiles.push(tile);
	grid[0][2] = 16384;
	tiles.push(new Tile(2 * TILE_SIZE, 0 * TILE_SIZE, 16384));
	grid[0][3] = 4;
	tiles.push(new Tile(3 * TILE_SIZE, 0 * TILE_SIZE, 4));
	for(let i = 0; i < 4; ++i){
		grid[1][i] = 2;
		tiles.push(new Tile(i * TILE_SIZE, TILE_SIZE, 2));
	}

	grid[2][0] = 1024;
	tiles.push(new Tile(0 * TILE_SIZE, 2 * TILE_SIZE, 1024));

	grid[2][2] = 512;
	tiles.push(new Tile(2 * TILE_SIZE, 2 * TILE_SIZE, 512));
}