"use strict";
const NAME = require("./package.json").title;
const NAME_low = NAME.toLowerCase();

const PageMod = require('sdk/page-mod').PageMod;
const forEach = require('sdk/util/object').each;

const files = require('./lib/files');
const hostname2include = require('./lib/utils').hostname2include;
const noHostScriptsConfigured = hostname => script => console.warn('Not running', script, 'as none are configured for', hostname);

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
const tabs = require("sdk/tabs");
const loadPageMods = changes => {
	try {
		curPageMods.forEach(mod => mod.destroy());
		curPageMods = [];
		console.info('loadPageMods triggered by', changes);
		const filesByDir = files.getFilesPerConfigSubDir(NAME, ['js', 'css', 'sh']);
		const framework = filesByDir.hasOwnProperty('FRAMEWORK') ? filesByDir.FRAMEWORK : {js: [], css: [] };
		forEach(filesByDir, (filelist, hostname) => {
			if (hostname === 'FRAMEWORK')
				return;
			const match = hostname2include(hostname);
			let jsfiles, cssfiles;
			if (framework === undefined || filelist.js.length === 0)
				jsfiles = filelist.js;
			else
				jsfiles = framework.js.concat(filelist.js);
			if (framework === undefined || filelist.css.length === 0)
				cssfiles = filelist.css;
			else
				cssfiles = framework.css.concat(filelist.css);
			console.log('hostname', hostname, 'matched with', match, 'gets a pagemod created with', jsfiles, cssfiles);
			curPageMods.push(PageMod({
				include: match,
				contentScriptFile: jsfiles,
				contentScriptWhen: 'ready',
				contentStyleFile: cssfiles,
				attachTo: [ 'top', 'existing' ],
				onAttach: worker => {
					worker.port.on(NAME_low + '/notify', sendNotification(worker));
					if (filelist.sh.length !== 0)
						worker.port.on(NAME_low + '/run', files.runHostScript(worker, NAME, hostname, filelist.sh));
					else
						worker.port.on(NAME_low + '/run', noHostScriptsConfigured(hostname));
					worker.port.on(NAME_low + '/tab/activate', () => worker.tab.activate());
					worker.port.on(NAME_low + '/tab/open', (iurl, ioptions) => {
						tabs.open({ url: iurl, isPrivate: ioptions.isPrivate,
							    inNewWindow: ioptions.inNewWindow,
							    inBackground: ioptions.inBackground,
							    isPinned: ioptions.isPinned });
					});
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
