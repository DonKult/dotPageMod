"use strict";

const handleCatResult = r => db => {
	let type;
	if (r.filename.endsWith('.js'))
		type = 'js';
	else if (r.filename.endsWith('.css'))
		type = 'css';
	else
		return;
	const filepath = DOTPAGEMOD_PATH + '/' + r.collection + '/' + r.hostname + '/' + r.filename;
	const prefix = type === 'js' ? '"use strict";\n' : '';
	const suffix = '\n/*# sourceURL=file://' + filepath + ' */\n';
	db.transaction(['files'], 'readwrite').objectStore('files').put(makePageModFile(
		r.collection, r.hostname, r.filename, type, r.lastmod,
		prefix + r.filecontent + suffix
	)).onsuccess = e => registerAddedPageModFile(db, e.target.result);
};
const handleListResult = r => db => {
	let files = {};
	r.results.forEach(f => {
		if (files[f.collection] === undefined)
			files[f.collection] = {};
		if (files[f.collection][f.hostname] === undefined)
			files[f.collection][f.hostname] = {};
		files[f.collection][f.hostname][f.filename] = f.lastmod;
	});
	unregisterPageMods(db).then(() => {
		let cating = false;
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
										cating = true;
									}
								}
							}
						}
					}
				}
				if (cating === false)
					applyToOpenTabs();
				else
					port.postMessage({'cmd': 'done?'});
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
					cating = true;
				} else {
					registerAddedPageModFile(db, cursor.key);
				}
				delete files[cursor.key[0]][cursor.key[1]][cursor.key[2]];
			}
			cursor.continue();
		};
	});
};
