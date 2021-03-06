var size = 729;

var namespaces = [utils, game];
if (namespaces.some(function(ns){ return ns === undefined; })) {
	console.log("Name spaces not loaded");
} else {
	main();
}

function main() {
    console.log("start");
    createColourLegend(document.getElementById('legendContainer'), colourMapping);

    var levelDicts = [];

    var content = $.get('resources/gameTree.json');
    var tree = content.length ? JSON.parse(content) : game.calculateWinTree();
    console.log(tree);
    var options = { drawSubpixels: false };
    var col = populateDrawDict(levelDicts, tree, { x: 0, y: 0, width: size, height: size }, options);
    //utils.downloadString(JSON.stringify(tree), "gameTree.json");
    var cs = createToggleableLayers(levelDicts.length, size, document.getElementById('canvasContainer'), document.getElementById('toggleContainer'));
    for (var i = 0; i < cs.length; i++) {
        render(cs[i].getContext('2d'), levelDicts[i]);
    }

    //var originalCanvas = utils.copyCanvas(c);
    console.log(levelDicts.length);
    console.log("done");
}

function colourMapping(score) {
	var drawOffset = 1-Math.abs(0.5 - score)/0.5;
	return [255 * score + drawOffset * 127, drawOffset * 255, 255 * (1-score) - drawOffset * 127];
}

function populateDrawDict(levelDicts, node, ref, options) {
	var score = node.score;
	var level = node.id.length;
	if (levelDicts.length < level) {
		levelDicts.push({});
	}
	var dict = levelDicts[level-1];
	
	
	var fill = rgbArrToHexStr(colourMapping(score));
	var rect = [ref.x, ref.y, ref.width, ref.height];
	
	if (node.children.length) {
		var subWidth = ref.width / 3;
		var subHeight = ref.height / 3;
		if (!options.drawSubpixels && subWidth < 1) return; 
		var cols = [];
		for (var i = 0; i < node.children.length; i++) {
			var child = node.children[i];
			var move = parseInt(child.id[child.id.length-1]);
			var subX = ref.x + subWidth * (move % 3);
			var subY = ref.y + subHeight * Math.floor(move / 3);
			populateDrawDict(levelDicts, child, {x: subX, y: subY, width: subWidth, height: subHeight}, options);
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

function createToggleableLayers(n, size, canvasContainer, toggleContainer) {
	var cs = [];
	for (var i = 0; i < n; i++) {
		var cLayer = document.createElement('CANVAS');
		cLayer.width = size;
		cLayer.height = size;
		cLayer.id = "layer_" + i;
		cLayer.className = "canvasLayer";
		
		var toggle = document.createElement('INPUT');
		toggle.id = "toggle_" + i;
		toggle.type = "checkbox";
		toggle.target = cLayer.id;
		toggle.onclick = function(e) {
			document.getElementById(this.target).style.display = this.checked ? "none" : "";
		};
		
		var label = document.createElement('LABEL');
		label.htmlFor = toggle.id;
		label.innerHTML = "Level " + i;
		
		toggleContainer.appendChild(label);
		toggleContainer.appendChild(toggle);
		canvasContainer.appendChild(cLayer);
		
		cs.push(cLayer);
	}
	
	return cs;
}

function render(ctx, drawDict) {
		for (col in drawDict) {
			ctx.fillStyle = "#" + col;
			var rects = drawDict[col];
			for (var i = 0; i < rects.length; i++) {
				var rect = rects[i];
				ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
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

function createColourLegend(container, colourFunction) {
	var canvas = document.createElement('CANVAS');
	canvas.width = size;
	canvas.height = 100;
	container.appendChild(canvas);
	var ctx = canvas.getContext('2d');
	
	var pixelLine = [];
	for (var i = 0; i < canvas.width; i++) {
		pixelLine = pixelLine.concat(colourFunction(i/999).map(function(x){return Math.floor(x);})).concat([255]);
	}
	
	var data = [];
	for (var i = 0; i < canvas.height; i++) {
		data = data.concat(pixelLine);
	}
	
	var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	
	for (var i = 0; i < img.data.length; i++) {
		img.data[i] = data[i];
	}
	
	//img.data = data; can't do this for some reason...
	ctx.putImageData(img, 0, 0);
}

function toggleExaggerate(isExaggerated) {
	return;
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

