"use strict";
const NAME = require("./package.json").title;

const PageMod = require('sdk/page-mod').PageMod;
const forEach = require('sdk/util/object').each;

const files = require('./lib/files');
const hostname2include = require('./lib/utils').hostname2include;

/* enable all logging to console for this extension to allow
   easy debugging of the loaded selfmade js files */
require('./lib/loglevel').setExtension('all');

files.registerConfigDir(NAME);

let curPageMods = [];
const loadPageMods = changes => {
	try {
		curPageMods.forEach(mod => mod.destroy());
		curPageMods = [];
		console.info('loadPageMods triggered by', changes);
		forEach(files.getFilesPerConfigSubDir(NAME, ['js', 'css']), (files, hostname) => {
			const match = hostname2include(hostname);
			console.log('hostname', hostname, 'matched with', match, 'gets a pagemod created with', files);
			curPageMods.push(PageMod({
				include: match,
				contentScriptFile: files.js,
				contentScriptWhen: 'ready',
				contentStyleFile: files.css,
				attachTo: [ 'top', 'existing' ],
				onAttach: worker => console.info('pagemod', hostname, 'attached to worker', worker.url.toString())
			}));
		});
	} catch (error) {
		console.error('' + error);
	}
};
loadPageMods([]);

const testInterestingNotify = line => {
	if (line[1].includes('ISDIR')) {
		return line[1].includes('CREATE') === false;
	}
	return line[2].endsWith('.css') || line[2].endsWith('.js');
};
const { DirectoryWatch } = require('./lib/inotify');
const watch = DirectoryWatch(files.getConfigPath(NAME), testInterestingNotify);
watch.on('stablized', loadPageMods);
