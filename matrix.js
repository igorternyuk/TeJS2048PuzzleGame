function createMatrix(rowCount, colCount){
	let matrix = new Array(rowCount);
	for(let i = 0; i < rowCount; ++i){
		matrix[i] = new Array(colCount);
	}

	/*matrix.forEach((row, i) => {
		row.forEach((val, j) => {
			val = 0;
		});
	});*/
	matrix.forEach(row => row.fill(0));

	return matrix;
}

function copyMatrix(matrix){
	let newMatrix = new Array(matrix.length);
	for(let i = 0; i < newMatrix.length; ++i){
		newMatrix[i] = new Array(matrix[i].length);
	}

	newMatrix.forEach(row => row.fill(0));

	/*newMatrix.forEach((row, i) => {
		row.forEach((val, j) => {
			val = matrix[i][j];
		});
	});*/

	return newMatrix;
}

function rotateMatrix(matrix, clockwise = true){
	transposeMatrix(matrix);
	flipMatrix(matrix, clockwise);
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