(function(namespace) {

	namespace.downloadString = function(str, filename) {
		//var url = "data:text/json;charset=utf-8," + encodeURIComponent(str);
		var url = URL.createObjectURL( new Blob( [str], {type:'text/plain'} ) );
		var downloadElem = document.createElement('A');
		downloadElem.setAttribute("href", url);
		downloadElem.setAttribute("download", filename);
		document.body.appendChild(downloadElem);
		downloadElem.click();
		document.body.removeChild(downloadElem);
	};

})(window.utils = window.utils || {});
