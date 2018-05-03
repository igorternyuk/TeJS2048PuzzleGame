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
		this.x += direction.dx;
		this.y += direction.dy;
	}

	render(){
		if(this.value > 0){
			noStroke();
			fill(getColor(this.value));
			rect(this.x + HALF_GAP, this.y + HALF_GAP, tileSize - HALF_GAP,
			 tileSize - HALF_GAP);
			fill(0,0,0);
			textFont('Consolas');
			textAlign(CENTER, CENTER);
			textSize(54);
			noStroke();
			text(this.value, this.x + tileSize / 2 + HALF_GAP,
			 this.y + tileSize / 2 + HALF_GAP);
		}
	}
}

function getColor(value){
	switch(value){
        case 2:
        	return '#1abc9c';
        case 4:
        	return '#2ecc71';
        case 8:
        	return '#27ae60';
        case 16:
        	return '#3498db';
        case 32:
        	return '#9b59b6';
        case 64:
        	return '#f1c40f';
        case 128:
        	return '#f39c12';
        case 256:
        	return '#e67e22';
        case 512:
        	return '#d35400';
        case 1024:
        	return '#e74c3c';
        case 2048:
        	return '#c0392b';
        case 4096:
        	return '#ccff00';
        case 8192:
        	return '#952097';
        case 16384:
        	return '#88a61b';
        case 32768:
        	return '#f02929';
        default:
        	return '#f69603';
    }
}

