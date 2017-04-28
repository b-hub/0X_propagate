console.log("start");
var size = 729;
var c = document.createElement('CANVAS');
c.height = size;
c.width = size;
c.style.border = "1px solid white";

document.body.appendChild(c);

var ctx = c.getContext('2d');
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

function calculateWinTree() {
	return calculateWinTreeHelper([]);
}

function calculateWinTreeHelper(path) {
	var nodeId = path.join("");
	var level = path.length;

	if (gameover(path)) {
		return new Node(nodeId, (level % 2) ? 1 : 0);
	}
	
	if (level == 9) {
		return new Node(nodeId, 0.5);
	}
	
	var node = new Node(nodeId);
	
	for (var i = 0; i < 9; i++) {
		if (path.indexOf(i) > -1) continue;
		node.children.push(calculateWinTreeHelper(path.concat([i])));
	}
	
	node.score = node.children.map(function(n){
		return n.score;
	}).reduce(function(a,b){
		return a + b;
	}, 0) / node.children.length;
	
	return node;
}

function Node(id, score) {
	this.id = id;
	this.score = score !== undefined ? score : 0;
	this.children = [];
}

function populateDrawDict(levelDicts, node, ref) {
	var score = node.score;
	var level = node.id.length;
	if (levelDicts.length < level) {
		levelDicts.push({});
	}
	var dict = levelDicts[level-1];
	
	var drawOffset = 1-Math.abs(0.5 - score)/0.5;
	var fill = rgbArrToHexStr([255 * score + drawOffset * 127, drawOffset * 255, 255 * (1-score) - drawOffset * 127]);
	var rect = [ref.x, ref.y, ref.width, ref.height];
	
	if (node.children.length) {
		var subWidth = ref.width / 3;
		var subHeight = ref.height / 3; 
		var cols = [];
		for (var i = 0; i < node.children.length; i++) {
			var child = node.children[i];
			var move = parseInt(child.id[child.id.length-1]);
			var subX = ref.x + subWidth * (move % 3);
			var subY = ref.y + subHeight * Math.floor(move / 3);
			populateDrawDict(levelDicts, child, {x: subX, y: subY, width: subWidth, height: subHeight});
		}
	}
	
	if (level === 0) return;
	
	if (dict[fill] !== undefined) dict[fill].push(rect);
	else dict[fill] = [rect];
}

function rgbArrToHexStr(arr) {
	return arr.map(byteToHex).join("");
}

function byteToHex(byte) {
	var hexStr = Number(Math.floor(byte)).toString(16);
	return (hexStr.length === 2) ? hexStr : "0" + hexStr;
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

function toRGB(channels) {
	return "rgb(" + channels.map(function(e){
		return Math.floor(e);
	});
}

ctx.strokeStyle = "white";
var levelDicts = [];

var content = document.getElementById('gameTree').innerHTML;
var tree = content.length ? JSON.parse(content) : calculateWinTree();
console.log(tree);
var col = populateDrawDict(levelDicts, tree, {x: 0, y: 0, width: c.width, height: c.height});
//downloadString(JSON.stringify(tree), "gameTree.json");
render(ctx, levelDicts);
var originalCanvas = copyCanvas(c);
console.log(levelDicts.length);
console.log("done");

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

