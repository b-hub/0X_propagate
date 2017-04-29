(function(namespace) {

	namespace.copyCanvas = function(canvas) {
		// create backing canvas
		var backCanvas = document.createElement('canvas');
		backCanvas.width = canvas.width;
		backCanvas.height = canvas.height;
		var backCtx = backCanvas.getContext('2d');

		// save main canvas contents
		backCtx.drawImage(canvas, 0,0);
		return backCanvas;
	};

})(window.utils = window.utils || {});
