class Tile {
	constructor(x, y, value){
		this.x = x;
		this.y = y;
		this.destX = x;
		this.destY = y;
		this.value = value;
		this.isMerged = false;
		this.highlight = false;
	}

	isSliding(){
		return this.x !== this.destX || this.y !== this.destY;
	}

	slide(direction){
		this.x += ANIMATION_SPEED * direction.dx;
		this.y += ANIMATION_SPEED * direction.dy;
	}

	render(){
		if(this.value > 0){
			noStroke();
			let style = getColorSize(this.value);
			fill(style.color);
			if(this.highlight){
				stroke(127,0,0);
				strokeWeight(HALF_GAP);
			} else {
				noStroke();
			}			

			rect(this.x + HALF_GAP, this.y + HALF_GAP, tileSize - HALF_GAP,
			 tileSize - HALF_GAP);
			fill(0,0,0);
			textFont('Arial');
			textAlign(CENTER, CENTER);
			textSize(style.size);
			noStroke();
			text(this.value, this.x + (tileSize + HALF_GAP) / 2,
			 this.y + tileSize / 2 + HALF_GAP);
		}
	}
}
