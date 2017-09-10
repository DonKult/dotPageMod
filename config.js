"use strict";
let DOTPAGEMOD_PATH = "";
const reloadConfigDirectory = r => {
	DOTPAGEMOD_PATH = r.configdir;
	if (r.configdir)
		port.postMessage({cmd: 'list', path: r.configdir});
	else
		console.error("No configuration directory set, so it can't be reloaded");
};
const getAndReloadConfigDirectory = () => {
	return browser.storage.local.get("configdir").then(reloadConfigDirectory,
		e => console.error("Reloading fails because we couldn't get the configuration directory", e));
};
browser.storage.onChanged.addListener(changes => {
	if (changes.hasOwnProperty('configdir'))
		reloadConfigDirectory({ 'configdir': changes.configdir.newValue });
});
