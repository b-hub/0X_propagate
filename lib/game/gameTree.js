(function(namespace) {

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

	namespace.calculateWinTree = function() {
		return calculateWinTreeHelper([]);
	}

})(window.game = window.game || {});
