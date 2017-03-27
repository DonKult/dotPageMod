"use strict";
let hostmap = { "FRAMEWORK": { js: [], css: [] } };
let hostlistener = {};

const makePageModFile = (_collection, _hostname, _filename, _type, _lastmod, _content) => {
	return {
		"collection": _collection,
		"hostname": _hostname,
		"filename": _filename,
		"type": _type,
		"lastmod": _lastmod,
		"content": _content
	};
};
const errorlog = e => console.error("Database error:", e);

const db = new Promise((resolve, reject) => {
	let dbo = indexedDB.open("dotpagemod", 1);
	dbo.onerror = reject;
	dbo.onsuccess = e => resolve(e.target.result);
	dbo.onupgradeneeded = e => {
		let files = e.target.result.createObjectStore(
			"files", { keyPath: ['collection', 'hostname', 'filename'] }
		);
		files.createIndex('hostname', 'hostname', { unique: false });
	};
});
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

const port = browser.runtime.connectNative('dotpagemod_app');
const handleCatResult = r => db => {
	let type;
	if (r.filename.endsWith('.js'))
		type = 'js';
	else if (r.filename.endsWith('.css'))
		type = 'css';
	else
		return;
	const filepath = DOTPAGEMOD_PATH + '/' + r.collection + '/' + r.hostname + '/' + r.filename;
	db.transaction(['files'], 'readwrite').objectStore('files').put(makePageModFile(
		r.collection, r.hostname, r.filename, type, r.lastmod,
		r.filecontent + '\n/*# sourceURL=file://' + filepath + ' */\n'
	)).onsuccess = e => registerAddedPageModFile(e.target.result);
};
const handleListResult = r => {
	let files = {};
	r.results.forEach(f => {
		if (files[f.collection] === undefined)
			files[f.collection] = {};
		if (files[f.collection][f.hostname] === undefined)
			files[f.collection][f.hostname] = {};
		files[f.collection][f.hostname][f.filename] = f.lastmod;
	});
	db.then(db => {
		let os = db.transaction(['files'], 'readwrite').objectStore('files');
		os.openCursor().onsuccess = e => {
			const cursor = e.target.result;
			if (cursor === null) {
				// get all new files into the storage
				for (let collection in files) {
					if (files.hasOwnProperty(collection)) {
						for (let hostname in files[collection]) {
							if (files[collection].hasOwnProperty(hostname)) {
								for (let filename in files[collection][hostname]) {
									if (files[collection][hostname].hasOwnProperty(filename)) {
										port.postMessage({
											'cmd': 'cat',
											'path': DOTPAGEMOD_PATH,
											'collection': collection,
											'hostname': hostname,
											'filename': filename,
										});
									}
								}
							}
						}
					}
				}
				return;
			}
			if (files[cursor.key[0]] === undefined ||
				files[cursor.key[0]][cursor.key[1]] === undefined ||
				files[cursor.key[0]][cursor.key[1]][cursor.key[2]] === undefined) {
				// the file is no longer on disk, so remove it from db storage as well
				os.delete(cursor.key);
			} else {
				// we have the file on record, but perhaps not the latest version
				if (files[cursor.key[0]][cursor.key[1]][cursor.key[2]] > cursor.value.lastmod) {
					port.postMessage({
						'cmd': 'cat',
						'path': DOTPAGEMOD_PATH,
						'collection': cursor.key[0],
						'hostname': cursor.key[1],
						'filename': cursor.key[2],
					});
				} else {
					registerAddedPageModFile(cursor.key);
				}
				delete files[cursor.key[0]][cursor.key[1]][cursor.key[2]];
			}
			cursor.continue();
		};
	}, errorlog);
};
port.onMessage.addListener(r => {
	if (r.cmd === 'catresult') {
		db.then(handleCatResult(r), errorlog);
	} else if (r.cmd === 'listresult') {
		handleListResult(r);
	}
});
port.postMessage({cmd: 'list', path: DOTPAGEMOD_PATH});
