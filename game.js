const GameState = Object.freeze({ 
	PLAYING: 0,
	SUCCEEDED_2048: 1,
	PLAYING_AFTER_2048: 2,
	DEFEAT: 3
});

const FOUR_PROBABILITY = 0.1;
const HALF_GAP = 5;

var tileSize = 100;
let rowCount = 4;
let colCount = 4;
var canvasWidth = colCount * tileSize + HALF_GAP;
var canvasHeight = rowCount * tileSize + HALF_GAP;
let grid, oldGrid;
let tiles = [];
let merging_tiles = [];
let gameState = GameState.PLAYING;

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    frameRate(10);
    grid = createMatrix(rowCount,colCount);
    addTile();
    addTile();
}

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
		let randValue = random(1);
		grid[randSpot.y][randSpot.x] = randValue < FOUR_PROBABILITY ?  4 : 2;
		tiles.push(new Tile(randSpot.x * tileSize, randSpot.y * tileSize,
		 grid[randSpot.y][randSpot.x]));

	} else {
		//Check von Neumann neighbourhood
		//and if there are no possible merging game over
	}
}

function getNeighbours(x, y){
	let neighbours = [];
	let offsets = [ { dx:1, dy:0 }, { dx:0, dy:1 }, { dx:-1, dy:0 }, { dx:0, dy:-1 } ];
	for(let offset = 0; offset < offsets.length; ++offset){
		let nx = x + offset.dx;
		let ny = y + offset.dy;
		if(isValidSpot(nx, ny)){
			neighbours.push();
		}
	}
	return neighbours;
}

function isValidSpot(x,y){
	return x >= 0 && x < grid.length && y >= 0 && y < grid[y].length;
}

function keyReleased(){
	switch(keyCode){
		case LEFT_ARROW:
			break;
		case RIGHT_ARROW:
			break;
		case UP_ARROW:
			break;
		case DOWN_ARROW:
			break;
	}
}

/*
//self.COLOR_BACKGROUND = color(157, 129, 111);
//self.COLOR_EMPTY_SPOT = color(178, 142, 119);
*/

function renderEmptyField(){
	fill(color(178, 142, 119))
	grid.forEach((row, y) => {
		row.forEach((val, x) => {
			rect(x * tileSize + HALF_GAP, y * tileSize + HALF_GAP,
			 tileSize - HALF_GAP, tileSize - HALF_GAP);
		});
	});
}

//main loop
function draw() {
	background(color(157, 129, 111));
	renderEmptyField();
	tiles.forEach(tile => tile.render());
}

/*
def __slide_right_( self ):
        for i in range( self.field_height ):
            for j in range( self.field_width - 2, -1, -1 ):
                if self.__grid[i][j] > 0:
                    tile_to_slide = self.__find_tile_by_coords_(
                     j * self.__tile_size, i * self.__tile_size )
                    col = j
                    is_merging = False
                    while col < self.field_width - 1:
                        if self.__grid[i][col + 1] == 0:
                            self.__grid[i][col + 1] = self.__grid[i][col]
                            self.__grid[i][col] = 0
                            col += 1
                        elif self.__grid[i][col] == self.__grid[i][col + 1]:
                            tile_to_merge = self.__find_tile_by_coords_(
                             ( col + 1 ) * self.__tile_size, i * self.__tile_size )
                            if not tile_to_merge.is_merged:
                                tile_to_merge.is_merged = True
                                tile_to_slide.is_merged = True
                                self.__grid[i][col + 1] *= 2
                                self.__grid[i][col] = 0
                                print( str( tile_to_slide ) )
                                print( str( tile_to_merge ) )
                                self.__merging_tiles.append( [ tile_to_slide,
                                 tile_to_merge, False ] )
                                is_merging = True
                            break
                        else:
                            break
                    if is_merging:
                        tile_to_slide.dest_x = ( col + 1 ) * self.__tile_size
                    else:
                        tile_to_slide.dest_x = col * self.__tile_size
                    self.__is_animating = True
                    self.print_grid()
*/



