"use strict";

let tabInfo = {};
const updateTabInfo = (tabId, file, good) => {
	if (file !== null) {
		if (tabInfo[tabId] === undefined)
			tabInfo[tabId] = {};
		tabInfo[tabId][file] = good;
	}
	let i = 0;
	let allgood = good;
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
browser.tabs.onRemoved.addListener(tab => {
	if (tabInfo[tab.id] !== undefined)
		delete tabInfo[tab.id];
});

browser.webNavigation.onCommitted.addListener(d => {
	if (d.frameId !== 0)
		return;
	if (tabInfo[d.tabId] !== undefined)
		delete tabInfo[d.tabId];
	tabInfo[d.tabId] = {};
	updateTabInfo(d.tabId, null, true);
});
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.cmd === 'getfilelist')
		sendResponse({baseuri: 'file://' + DOTPAGEMOD_PATH, files: tabInfo[request.tabId]});
});
