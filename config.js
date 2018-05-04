function getColorSize(value){
	switch(value){
        case 2:
        	return { color: '#1abc9c', size: 52 };
        case 4:
        	return { color: '#2ecc71', size: 52 };
        case 8:
        	return { color: '#27ae60', size: 52 };
        case 16:
        	return { color: '#3498db', size: 52 };
        case 32:
        	return { color: '#9b59b6', size: 52 };
        case 64:
        	return { color: '#f1c40f', size: 52 };
        case 128:
        	return { color: '#f39c12', size: 42 };
        case 256:
        	return { color: '#e67e22', size: 42 };
        case 512:
        	return { color: '#d35400', size: 42 };
        case 1024:
        	return { color: '#e74c3c', size: 36 };
        case 2048:
        	return { color: '#c0392b', size: 36 };
        case 4096:
        	return { color: '#ccff00', size: 36 };
        case 8192:
        	return { color: '#952097', size: 36 };
        case 16384:
        	return { color: '#88a61b', size: 30 };
        case 32768:
        	return { color: '#f02929', size: 30 };
        default:
        	return { color: '#e86800', size: 30 };
    }
}