"use strict";
(function(){
const saveOptions = e => {
	e.preventDefault();
	browser.storage.local.set({
		configdir: document.querySelector("#configdir").value
	});
};
const setCurrentChoice = result => document.querySelector("#configdir").value = result.configdir || "";
const onError = error => console.log(`Error: ${error}`);
const restoreOptions = () => browser.storage.local.get("configdir").then(setCurrentChoice, onError);

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
})();
