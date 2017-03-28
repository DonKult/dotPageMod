"use strict";
const db = getDatabaseConnection();
const port = browser.runtime.connectNative('dotpagemod_app');

port.onMessage.addListener(r => {
	if (r.cmd === 'catresult') {
		db.then(handleCatResult(r), errorlog);
	} else if (r.cmd === 'listresult') {
		handleListResult(r);
	}
});
port.postMessage({cmd: 'list', path: DOTPAGEMOD_PATH});

browser.runtime.onMessage.addListener((n, sender, sendResponse) => {
	if (n.cmd === 'notify') {
		browser.notifications.create(n.id === undefined ? "" : n.id, {
			"type": "basic",
			"title": n.title,
			"message": n.message,
		});
	} else if (n.cmd === 'reloadfiles') {
		port.postMessage({cmd: 'list', path: DOTPAGEMOD_PATH});
		sendResponse();
	}
});
