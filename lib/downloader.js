function downloadString(str, filename) {
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(str);
	var downloadElem = document.createElement('A');
	downloadElem.setAttribute("href", dataStr);
	downloadElem.setAttribute("download", filename);
	document.body.appendChild(downloadElem);
	downloadElem.click();
	document.body.removeChild(downloadElem);
}