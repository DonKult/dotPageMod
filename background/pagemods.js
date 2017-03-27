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
	s.then(() => {console.log('script in', tabId, 'at', runat, 'for', p.collection, '/', p.hostname, '/', p.filename, 'okay');},
		() => {console.log('script in', tabId, 'at', runat, 'for', p.collection, '/', p.hostname, '/', p.filename, 'failed');});
	return s;
};
const executePageModsForHost = (db, host) => details => {
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
			if (host === 'ALL')
				;
			else if (host.startsWith('ALL_')) {
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
