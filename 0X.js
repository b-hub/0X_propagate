console.log("start");
var size = 1000;
var c = document.createElement('CANVAS');
c.height = size;
c.width = size;
c.style.border = "1px solid white";

document.body.appendChild(c);

var ctx = c.getContext('2d');
var fCols = fractalCols(9);
var counts = [0, 0, 0];
var gameoverMapping = [
	[[1,2],[4,8],[3,6]],
	[[0,2],[4,7]],
	[[1,0],[4,6],[5,8]],
	[[0,6],[4,5]],
	[[1,7],[3,5],[0,8],[2,6]],
	[[8,2],[4,3]],
	[[0,3],[4,2],[7,8]],
	[[6,8],[1,4]],
	[[6,7],[5,2],[0,4]],
];

function fractalCols(n) {
		cols = [];
		for (var i = n; i > 0; i--) {	
			var x = Number(Math.floor(i / n * 255)).toString(16);
			cols.push("#" + x + x + x);
		}
		
		return cols;
}

function gameover(path) {
	if (path.length < 5) return false;
	var lastPlayer = (path.length-1) % 2;
	var lastPlayerMoves = path.filter(function(move, i) {
		return i % 2 === lastPlayer;
	});

	return gameoverMapping[path[path.length-1]].some(function(ops){
		return ops.every(function(op){
			return lastPlayerMoves.indexOf(op) != -1; 
		});
	});
}

function populateDrawDict(levelDicts, path, ref) {
	
	var level = path.length;
	if (levelDicts.length < level) {
		levelDicts.push({});
	}
	var dict = levelDicts[level-1];
	
	var col;
	var fill;
	var rect = [ref.x, ref.y, ref.width, ref.height];
	if (gameover(path)) {
		col = (level % 2) ? [255,0,0] : [0,0,255];
		fill = (level % 2) ? "f00" : "00f";
	
	} else if (level == 9) {
		col = [255,0,255];
		fill = "f0f";
	} else {
		var subWidth = ref.width / 3;
		var subHeight = ref.height / 3; 
		var cols = [];
		for (var i = 0; i < 9; i++) {
			var subX = ref.x + subWidth * (i % 3);
			var subY = ref.y + subHeight * Math.floor(i / 3);
			var depth = path.indexOf(i);
			if (depth > -1) {
	
			} else {
				cols.push(populateDrawDict(levelDicts, path.concat([i]), {x: subX, y: subY, width: subWidth, height: subHeight}));
			}
		}
		col = cols.reduce(function(a, b) {
			return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
		}, [0,0,0]).map(function(e){return e/cols.length;});
		
		fill = col.map(function(byte){
			var hexStr = Number(Math.floor(byte)).toString(16);
			return (hexStr.length === 2) ? hexStr : "0" + hexStr;
		}).join("");
	}
	
	if (level === 0) return col;
	
	if (dict[fill] !== undefined) dict[fill].push(rect);
	else dict[fill] = [rect];
	return col;
}

function render(ctx, levelDicts) {
	for (var level = 0; level < levelDicts.length; level++) {
		var drawDict = levelDicts[level];
		for (col in drawDict) {
			ctx.fillStyle = "#" + col;
			var rects = drawDict[col];
			for (var i = 0; i < rects.length; i++) {
				var rect = rects[i];
				ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
			}
		}
	}
}

function exaggerateCol(col) {
	return col.map(function(byte){
		return 255 * exaggerate(byte/255);
	});
}

function exaggerate(x) {
	//return 2.875 * Math.pow(x, 3) - 4.3125 * Math.pow(x, 2) + 2.4375 * x;
	//return - 2.133333 * Math.pow(x, 3) + 3.2 * Math.pow(x, 2) - 0.06666667 * x;
	return - 2.577643 * Math.pow(x, 3) + 3.866464 * Math.pow(x, 2) - 0.2931411 * x + 0.002159838;
}

console.log(0, exaggerate(0));
console.log(1, exaggerate(1));
console.log(0.5, exaggerate(0.5));
console.log(0.75, exaggerate(0.75));
console.log(0.25, exaggerate(0.25));
console.log(0.1, exaggerate(0.1));
console.log(0.9, exaggerate(0.9));

console.log(exaggerateCol([200, 0, 100]));

function toRGB(channels) {
	return "rgb(" + channels.map(function(e){
		return Math.floor(e);
	});
}

ctx.strokeStyle = "white";
var levelDicts = [];
var col = populateDrawDict(levelDicts, [], {x: 0, y: 0, width: c.width, height: c.height});
render(ctx, levelDicts);
var originalCanvas = copyCanvas(c);
console.log(levelDicts.length);
console.log("done");
console.log(counts);

function toggleExaggerate(isExaggerated) {
	ctx.clearRect(0,0,c.width, c.height);
	ctx.drawImage(originalCanvas, 0, 0);
	if (isExaggerated) {
		var img = ctx.getImageData(0,0,c.width,c.height);
		var data = img.data;
		for (var i = 0; i < data.length; i+=4) {
			data[i+0] = 255 * exaggerate(data[i]/255);
			data[i+1] = 255 * exaggerate(data[i+1]/255);
			data[i+2] = 255 * exaggerate(data[i+2]/255);
		}
		ctx.clearRect(0,0,c.width, c.height);
		ctx.putImageData(img, 0,0);
	}
}

function copyCanvas(canvas) {
	// create backing canvas
	var backCanvas = document.createElement('canvas');
	backCanvas.width = canvas.width;
	backCanvas.height = canvas.height;
	var backCtx = backCanvas.getContext('2d');

	// save main canvas contents
	backCtx.drawImage(canvas, 0,0);
	return backCanvas;
}

