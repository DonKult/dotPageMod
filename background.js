"use strict";
const db = getDatabaseConnection();
const port = browser.runtime.connectNative('dotpagemod_app');
// tell the user if we couldn't connect to the native app
const noNativeConnection = () => browser.tabs.create({'active': true, 'url': '/pages/nonative.html'});
port.onDisconnect.addListener(noNativeConnection);
const clearErrorPage = () => {
	port.onDisconnect.removeListener(noNativeConnection);
	port.onMessage.removeListener(clearErrorPage);
};
port.onMessage.addListener(clearErrorPage);

port.onMessage.addListener(r => {
	let ret;
	if (r.cmd === 'catresult') {
		ret = db.then(handleCatResult(r), errorlog);
	} else if (r.cmd === 'listresult') {
		ret = db.then(handleListResult(r), errorlog);
	} else if (r.cmd === 'doneresult') {
		ret = applyToOpenTabs();
	}
});

browser.runtime.onMessage.addListener((n, sender, sendResponse) => {
	let ret;
	if (typeof n === 'string') {
		n = { 'cmd': n };
	}
	if (n.cmd === 'notify') {
		ret = browser.notifications.create(n.id === undefined ? "" : n.id, {
			"type": "basic",
			"title": n.title,
			"message": n.message,
		});
	} else if (n.cmd.startsWith('tab/')) {
		if ('tab' in sender && sender.tab.id !== browser.tabs.TAB_ID_NONE) {
			let action;
			if (n.cmd === 'tab/activate')
				action = { active: true };
			else if (n.cmd === 'tab/mute')
				action = { muted: true };
			else if (n.cmd === 'tab/unmute')
				action = { muted: false };
			else if (n.cmd === 'tab/pin')
				action = { pinned: true };
			else if (n.cmd === 'tab/unpin')
				action = { pinned: false };
			else if (n.cmd === 'tab/url')
				action = { url: n.url };
			else if (n.cmd === 'tab/reload')
				ret = browser.tabs.reload();
			else if (n.cmd === 'tab/force-reload')
				ret = browser.tabs.reload({bypassCache: true});
			else if (n.cmd === 'tab/close')
				ret = browser.tabs.remove(sender.tab.id);
			else if (n.cmd === 'tab/open') {
				let creat = { 'url': n.url };
				if ('active' in n)
					creat.active = n.active;
				if ('pinned' in n)
					creat.pinned = n.pinned;
				if ('window' in n)
					;
				else
					n.window = 'tab';
				if (n.window === 'tab')
					creat.windowId = sender.tab.windowId;
				else if (n.window !== 'current')
					console.warn('Ignore unknown window option for new tab', n.window, creat);
				ret = browser.tabs.create(creat);
			} else {
				console.warn("got an unknown tab action from tab", sender.tab.id, n);
				return;
			}
			if (ret === undefined)
				ret = browser.tabs.update(sender.tab.id, action);
		} else {
			console.warn("got tab action, but not from a valid sender", n, sender);
			return;
		}
	} else if (n.cmd === 'reloadfiles') {
		ret = port.postMessage({cmd: 'list', path: DOTPAGEMOD_PATH});
	} else if (n.cmd === 'openeditor') {
		ret = port.postMessage({cmd: 'openeditor', path: n.path});
	}
	else
		return;
	if (ret === undefined)
		sendResponse();
	else
		ret.then(() => sendResponse());
});
port.postMessage({cmd: 'list', path: DOTPAGEMOD_PATH});
