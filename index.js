"use strict";
const NAME = require("./package.json").title;

const PageMod = require('sdk/page-mod').PageMod;
const forEach = require('sdk/util/object').each;

const files = require('./lib/files');
const hostname2include = require('./lib/utils').hostname2include;

/* enable all logging to console for this extension to allow
   easy debugging of the loaded selfmade js files */
require('./lib/loglevel').setExtension('all');

const notifications = require("sdk/notifications");
const sendNotification = worker => (ntitle, nbody, nicon, ndata) => {
	const options = {
		title: ntitle ? ntitle : 'From dotPageMod with love',
		text: nbody ? nbody : 'Can I have your attention?'
	};
	if (nicon)
		options.iconURL = nicon;
	if (ndata) {
		options.data = ndata;
		options.onClick = (data) => worker.port.emit('dotpagemod/notify-clicked', data);
	}
	notifications.notify(options);
};

files.registerConfigDir(NAME);

let curPageMods = [];
const loadPageMods = changes => {
	try {
		curPageMods.forEach(mod => mod.destroy());
		curPageMods = [];
		console.info('loadPageMods triggered by', changes);
		const filesByDir = files.getFilesPerConfigSubDir(NAME, ['js', 'css']);
		const framework = filesByDir.hasOwnProperty('FRAMEWORK') ? filesByDir.FRAMEWORK : {js: [], css: [] };
		forEach(filesByDir, (files, hostname) => {
			if (hostname === 'FRAMEWORK')
				return;
			const match = hostname2include(hostname);
			let jsfiles, cssfiles;
			if (framework === undefined || files.js.length === 0)
				jsfiles = files.js;
			else
				jsfiles = framework.js.concat(files.js);
			if (framework === undefined || files.css.length === 0)
				cssfiles = files.css;
			else
				cssfiles = framework.css.concat(files.css);
			console.log('hostname', hostname, 'matched with', match, 'gets a pagemod created with', jsfiles, cssfiles);
			curPageMods.push(PageMod({
				include: match,
				contentScriptFile: jsfiles,
				contentScriptWhen: 'ready',
				contentStyleFile: cssfiles,
				attachTo: [ 'top', 'existing' ],
				onAttach: worker => {
					worker.port.on('dotpagemod/notify', sendNotification(worker));
					console.info('pagemod', hostname, 'attached to worker', worker.url.toString());
				}
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
