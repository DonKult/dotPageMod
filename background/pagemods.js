"use strict";
let hostmap = { "FRAMEWORK": { js: [], css: [] } };
let hostlistener = {};

const executePageMod = (tabId, runat, p) => {
	const opt = {
		'runAt': runat,
		'code': p.content,
	};
	let s;
	if (p.type === 'js')
		s = browser.tabs.executeScript(tabId, opt);
	else //if (p.type === 'css')
		s = browser.tabs.insertCSS(tabId, opt);
	const filename = p.collection + '/' + p.hostname + '/' + p.filename;
	return s.then(
		() => updateTabInfo(tabId, filename, true),
		() => updateTabInfo(tabId, filename, false)
	);
};
const removePageMod = (tabId, p) => {
	if (p.type === 'css')
		return browser.tabs.removeCSS(tabId, { 'code': p.content });
};
const promiseRunOnCursor = (index, key, runon) => {
	return new Promise((resolve, reject) => {
		const req = index.openCursor(IDBKeyRange.only(key));
		let pagefiles = [];
		req.onsuccess = e => {
			const cursor = e.target.result;
			if (cursor === null) {
				resolve(Promise.all(pagefiles));
				return;
			}
			pagefiles.push(runon(cursor.value));
			cursor.continue();
		};
		req.onerror = e => reject(e);
	});
};
const executePageModsForHost = (db, host, runOnFramework, runOnHost) => details => {
	// we want to act only on pages, not on all their (i)frames.
	if (details.frameId !== 0)
		return;
	const css_framework = hostmap[host].css.length !== 0;
	const js_framework = hostmap[host].js.length !== 0;
	const i = db.transaction(['files'], 'readonly').objectStore('files').index("hostname");
	let pagemods = [];
	if (css_framework || js_framework) {
		pagemods.push(promiseRunOnCursor(i, "FRAMEWORK", value => {
			if ((value.type === 'js' && js_framework) || (value.type === 'css' && css_framework))
				return runOnFramework(details.tabId, value);
			return Promise.resolve();
		}));
	}
	pagemods.push(promiseRunOnCursor(i, host, value => runOnHost(details.tabId, value)));
	return Promise.all(pagemods);
};
const registerAddedPageModFile = (db, key) => {
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
			hostlistener[host] = executePageModsForHost(db, host,
				(tabId, value) => executePageMod(tabId, 'document_start', value),
				(tabId, value) => {
					if (value.type === 'js')
						return executePageMod(tabId, 'document_end', value);
					else if (value.type === 'css')
						return executePageMod(tabId, 'document_start', value);
				}
			);
			browser.webNavigation.onCommitted.addListener(
				hostlistener[host], filters
			);
		}
	}
	hostmap[host][type].push(key);
};
const removePageModsForHost = (db, host, details) => executePageModsForHost(db, host, removePageMod, removePageMod)(details);
const runOnOpenTabs = runOnHost => {
	return browser.tabs.query({}).then(tabs => Promise.all(tabs.map(tab => {
		// tabs which aren't loaded have no size, don't execute scripts on them
		if (tab.width === 0 && tab.height === 0)
			return;
		if (tab.id === tabs.TAB_ID_NONE)
			return;
		let pros = [];
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
			Array.prototype.push.apply(pros, u[2].split('.').reverse().reduce((a,v,i) => {
				if (i === 0)
					a.push(v);
				else
					a.push([v,a[a.length - 1]].join('.'));
				return a;
			}, preset).map(host => runOnHost(host, tab)));
		} else if (u[0] === 'file:')
			pros.push(runOnHost('ALL_file', tab));
		return Promise.all(pros);
	})));
};
const callHostRemover = db => (host, tab) => {
	if (hostlistener.hasOwnProperty(host))
		return removePageModsForHost(db, host, { 'tabId': tab.id, 'frameId': 0 });
};
const unregisterPageMods = db => {
	let list = [];
	for (let listener in hostlistener)
		if (hostlistener.hasOwnProperty(listener))
			list.push(browser.webNavigation.onCommitted.removeListener(hostlistener[listener]));
	return Promise.all(list).then(() => Promise.all([
		sendDetachToTabs(),
		runOnOpenTabs(callHostRemover(db)).then(() => {
			hostmap = { "FRAMEWORK": { js: [], css: [] } };
			hostlistener = {};
		})
	]));
};
const callHostListener = (host, tab) => {
	if (hostlistener.hasOwnProperty(host))
		return hostlistener[host]({'tabId': tab.id, 'frameId': 0});
};
const applyToOpenTabs = () => runOnOpenTabs(callHostListener);
