function createMatrix(rowCount, colCount, value){
	let matrix = new Array(rowCount);
	for(let i = 0; i < rowCount; ++i){
		matrix[i] = new Array(colCount);
	}
	matrix.forEach(row => row.fill(value));
	return matrix;
}

function copyMatrix(matrix){
	let newMatrix = new Array(matrix.length);
	for(let i = 0; i < newMatrix.length; ++i){
		newMatrix[i] = new Array(matrix[i].length);
	}
	newMatrix.forEach(row => row.fill(0));
	return newMatrix;
}



function transposeMatrix(matrix){
	for(let i = 0; i < matrix.length; ++i){
		for(let j = 0; j < i; ++j){
			[ matrix[i][j], matrix[j][i] ] 
			= [ matrix[j][i], matrix[i][j] ];
		}
	}
}

function flipMatrix(matrix, horizontally = true){
	if(horizontally){
		matrix.forEach(row => row.reverse());
	} else {
		matrix.reverse();
	}
}

function rotateMatrix(matrix, clockwise = true){
	transposeMatrix(matrix);
	flipMatrix(matrix, clockwise);
}

function getTransposedSpot(spot){
	return { x: spot.y, y: spot.x };
}

function getFlippedSpot(spot, dimension, horizontally = true){
	if(horizontally){
		return { x: dimension - 1 - spot.x, y: spot.y };
	} else {
		return { x: spot.x, y: dimension - 1 - spot.y };
	}
}

function getRotatedSpot(spot, dimension, clockwise = true){
	if(clockwise){
		return { x: spot.y, y: dimension - 1 - spot.x };		
	} else {
		return { x: dimension - 1 - spot.y, y: spot.x };
	}
}