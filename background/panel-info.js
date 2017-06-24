"use strict";

let tabInfo = {};
const UPDATE_TAB = { GOOD: '1', BAD: '2', REMOVE: '3' };
const updateTabInfo = (tabId, file, type) => {
	if (file !== null) {
		if (tabInfo[tabId] === undefined)
			tabInfo[tabId] = {};
		if (type === UPDATE_TAB.GOOD)
			tabInfo[tabId][file] = true;
		else if (type === UPDATE_TAB.BAD)
			tabInfo[tabId][file] = false;
		else if (type === UPDATE_TAB.REMOVE) {
			if (file === "js") {
				for (let f in tabInfo[tabId])
					if (tabInfo[tabId].hasOwnProperty(f) && f.endsWith(".js"))
						delete tabInfo[tabId][f];
			} else
				delete tabInfo[tabId][file];
		}
	}
	let i = 0;
	let allgood = true;
	for (let f in tabInfo[tabId]) {
		if (tabInfo[tabId].hasOwnProperty(f)) {
			++i;
			if (allgood)
				allgood = tabInfo[tabId][f];
		}
	}
	if (i === 0)
		browser.browserAction.setBadgeText({'text': '', 'tabId': tabId});
	else
		browser.browserAction.setBadgeText({'text': '' + i, 'tabId': tabId});
	browser.browserAction.setBadgeBackgroundColor({'color': allgood ? 'black' : 'red', 'tabId': tabId});
};
const tabInfoQuery = filename => {
	let ret = [];
	for (let t in tabInfo)
		if (tabInfo.hasOwnProperty(t))
			if (tabInfo[t].hasOwnProperty(filename))
				ret.push({'id': parseInt(t) });
	return ret;
};
const isAlreadyInTab = (tabId, filename) => {
	if (tabInfo.hasOwnProperty(tabId))
		if (tabInfo[tabId].hasOwnProperty(filename))
			return true;
	return false;
};
const sendDetachMessageToTab = tab => {
	let found = false;
	for (let t in tabInfo)
		if (tabInfo.hasOwnProperty(t))
			for (let f in tabInfo[t])
				if (tabInfo[t].hasOwnProperty(f) && f.endsWith('.js'))
					found = true;
	if (found === false)
		return Promise.resolve();
	return browser.tabs.sendMessage(parseInt(tab), { 'cmd': 'detach' }).catch(() => {
		// sending detach fails if the content script has no listener, so just ignore it
		return Promise.resolve();
	});
};

browser.tabs.onRemoved.addListener(tab => {
	if (tabInfo["" + tab.id] !== undefined)
		delete tabInfo["" + tab.id];
});
browser.webNavigation.onBeforeNavigate.addListener(d => {
	if (d.frameId !== 0)
		return;
	if (tabInfo[d.tabId] !== undefined)
		delete tabInfo[d.tabId];
	tabInfo[d.tabId] = {};
	updateTabInfo(d.tabId, null);
});
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.cmd === 'getfilelist')
		sendResponse({baseuri: 'file://' + DOTPAGEMOD_PATH, files: tabInfo[request.tabId]});
});
