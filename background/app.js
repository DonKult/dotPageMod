"use strict";

const handleCatResult = r => db => {
	let type;
	if (r.filename.endsWith('.js'))
		type = 'js';
	else if (r.filename.endsWith('.css'))
		type = 'css';
	else
		return Promise.resolve();
	return new Promise((resolve, reject) => {
		const filepath = DOTPAGEMOD_PATH + '/' + r.collection + '/' + r.hostname + '/' + r.filename;
		let prefix = '', suffix = '\n';
		if (type === 'js') {
			if (r.hostname !== 'FRAMEWORK') {
				prefix += '(function(){';
				suffix += '})();';
			}
			prefix += '"use strict";\n';
		}
		suffix += '/*# sourceURL=file://' + filepath + ' */\n';
		let req = db.transaction(['files'], 'readwrite').objectStore('files').put(makePageModFile(
			r.collection, r.hostname, r.filename, type, r.lastmod,
			prefix + r.filecontent + suffix
		));
		req.onsuccess = e => resolve(registerPageModFile(db, e.target.result));
		req.onerror = e => reject(e);
	});
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
	return new Promise((resolve, reject) => {
		let os = db.transaction(['files'], 'readwrite').objectStore('files');
		let removeTriggered = {};
		let actions = [];
		const req = os.openCursor();
		req.onsuccess = e => {
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
				port.postMessage({'cmd': 'done?'});
				resolve(Promise.all(actions));
				return;
			}
			if (files[cursor.key[0]] === undefined ||
					files[cursor.key[0]][cursor.key[1]] === undefined ||
					files[cursor.key[0]][cursor.key[1]][cursor.key[2]] === undefined) {
				// the file is no longer on disk, so remove it from db storage as well
				actions.push(unregisterPageModFile(cursor.key, cursor.value));
				actions.push(new Promise((resolve,reject) => {
					let req = cursor.delete();
					req.onsuccess = e => resolve(cursor.key);
					req.onerror = e => reject(e);
				}));
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
					actions.push(unregisterPageModFile(cursor.key, cursor.value));
				} else
					actions.push(registerPageModFile(db, cursor.key));
				delete files[cursor.key[0]][cursor.key[1]][cursor.key[2]];
			}
			cursor.continue();
		};
		req.onerror = e => reject(e);
	});
};
