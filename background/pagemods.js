"use strict";
let hostmap = { "FRAMEWORK": { js: [], css: [] } };
let hostlistener = {};

const executePageMod = (tabId, runat, p) => {
	const opt = {
		'allFrames': false,
		'runAt': runat,
		'code': p.content,
	};
	let s;
	if (p.type === 'js')
		s = browser.tabs.executeScript(tabId, opt);
	else //if (p.type === 'css')
		s = browser.tabs.insertCSS(tabId, opt);
	const filename = p.collection + '/' + p.hostname + '/' + p.filename;
	s.then(() => updateTabInfo(tabId, filename, true),
		() => updateTabInfo(tabId, filename, false));
	return s;
};
const executePageModsForHost = (db, host) => details => {
	// we want to act only on pages, not on all their (i)frames.
	if (details.frameId !== 0)
		return;
	const css_framework = hostmap[host].css.length !== 0;
	const js_framework = hostmap[host].js.length !== 0;
	const i = db.transaction(['files'], 'readonly').objectStore('files').index("hostname");
	if (css_framework || js_framework) {
		i.openCursor(IDBKeyRange.only("FRAMEWORK")).onsuccess = e => {
			const cursor = e.target.result;
			if (cursor === null)
				return;
			if ((cursor.value.type === 'js' && js_framework) || (cursor.value.type === 'css' && css_framework))
				executePageMod(details.tabId, 'document_start', cursor.value);
			cursor.continue();
		};
	}
	i.openCursor(IDBKeyRange.only(host)).onsuccess = e => {
		const cursor = e.target.result;
		if (cursor === null)
			return;
		if (cursor.value.type === 'js')
			executePageMod(details.tabId, 'document_end', cursor.value);
		else if (cursor.value.type === 'css')
			executePageMod(details.tabId, 'document_start', cursor.value);
		cursor.continue();
	};
};
const registerAddedPageModFile = key => {
	const host = key[1];
	let type;
	if (key[2].endsWith('.js'))
		type = 'js';
	else if (key[2].endsWith('.css'))
		type = 'css';
	else
		return;
	if (hostmap[host] === undefined) {
		hostmap[host] = { js: [], css: [] };
		if (host !== 'FRAMEWORK') {
			let filters;
			if (host === 'ALL') {
				// This avoids Firefox trying to act on about: pages where we fail to insert scripts
				filters = { url: [ { schemes: [ "https", "http" ] } ] };
			} else if (host.startsWith('ALL_')) {
				filters = { url: [ { schemes: [ host.substr(4) ] } ] };
			} else {
				const h = host.split('_');
				if (h.length === 1) {
					filters = { url: [
						{ hostEquals: h[0] },
						{ hostSuffix: '.' + h[0] }
					] };
				} else {
					const port = parseInt(h[1]);
					filters = { url: [
						{ hostEquals: h[0], ports: [ port ] },
						{ hostSuffix: '.' + h[0], ports: [ port ] }
					] };
				}
			}
			db.then(db => {
				hostlistener[host] = executePageModsForHost(db, host);
				browser.webNavigation.onCommitted.addListener(
					hostlistener[host], filters
				);
			});
		}
	}
	hostmap[host][type].push(key);
};
const unregisterPageMods = () => {
	hostmap = { "FRAMEWORK": { js: [], css: [] } };
	for (let listener in hostlistener)
		if (hostlistener.hasOwnProperty(listener))
			browser.webNavigation.onCommitted.removeListener(hostlistener[listener]);
	hostlistener = {};
};
const callHostListener = (host, tab) => {
	if (hostlistener.hasOwnProperty(host)) {
		hostlistener[host]({'tabId': tab.id, 'frameId': 0});
	}
};
const applyToOpenTabs = () => {
	browser.tabs.query({}).then(tabs => tabs.forEach(tab => {
		// tabs which aren't loaded have no size, don't execute scripts on them
		if (tab.width === 0 && tab.height === 0)
			return;
		const u = tab.url.split('/', 3);
		if (u[0] === 'http:' || u[0] === 'https:' || u[0] === 'ftp:') {
			// this builds an array like [ ALL, com, example.com, foo.example.com ]
			let preset;
			if (u[0] === 'ftp:')
				preset = [ 'ALL_ftp' ];
			else if (u[0] === 'https:')
				preset = [ 'ALL', 'ALL_https' ];
			else
				preset = [ 'ALL', 'ALL_http' ];
			u[2].split('.').reverse().reduce((a,v,i) => {
				if (i === 0)
					a.push(v);
				else
					a.push([v,a[a.length - 1]].join('.'));
				return a;
			}, preset).forEach(host => callHostListener(host, tab));
		} else if (u[0] === 'file:')
			callHostListener('ALL_file', tab);
	}));
};
