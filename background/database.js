"use strict";

const errorlog = e => console.error("Database error:", e);

const getDatabaseConnection = () => new Promise((resolve, reject) => {
	let dbo = indexedDB.open("dotpagemod", 1);
	dbo.onerror = reject === undefined ? errorlog : reject;
	dbo.onsuccess = e => resolve(e.target.result);
	dbo.onupgradeneeded = e => {
		let files = e.target.result.createObjectStore(
			"files", { keyPath: ['collection', 'hostname', 'filename'] }
		);
		files.createIndex('hostname', 'hostname', { unique: false });
	};
});

const makePageModFile = (_collection, _hostname, _filename, _type, _runat, _lastmod, _content) => {
	return {
		"collection": _collection,
		"hostname": _hostname,
		"filename": _filename,
		"type": _type,
		"runat": _runat,
		"lastmod": _lastmod,
		"content": _content
	};
};

const handleDatabaseClearing = db => {
	let req = db.transaction(['files'], 'readwrite').objectStore('files').clear();
	req.onsuccess = console.info("DB of dotPageMod was cleared successfully");
	req.onerror = errorlog;
};
