"use strict";
const NAME = require("./package.json").title;
const NAME_low = NAME.toLowerCase();

const PageMod = require('sdk/page-mod').PageMod;
const forEach = require('sdk/util/object').each;
const tabs = require("sdk/tabs");

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
const makePageMod = (framework, filelist, hostname) => {
	if (hostname === 'FRAMEWORK')
		return null;
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
	return PageMod({
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
	});
};

files.registerConfigDir(NAME);

const interestExtension = ['js', 'css', 'sh'];
let curPageMods = { };
let framework;
const loadPageMods = changes => {
	try {
		let hostdir = '';
		// was a single file modified or deleted?
		if (changes.length === 1 && (changes[0][1].includes('MODIFY') ||
					(changes[0][1].includes('DELETE') && changes[0][1].includes('ISDIR') === false))) {
			hostdir = changes[0][0];
		// was a single file modified (vim edition) ?
		} else if (changes.length === 3 && changes[0][2] === changes[1][2] &&
				changes[1][2] === changes[2][2] && changes[0][1].includes('MOVED_FROM') &&
				changes[1][1].includes('CREATE') && changes[2][1].includes('MODIFY')) {
			hostdir = changes[2][0];
		// a new file was created
		} else if (changes.length === 2 && changes[0][2] === changes[1][2] &&
				changes[0][1].includes('CREATE') && changes[1][1].includes('MODIFY')) {
			hostdir = changes[1][0];
		}
		console.info('loadPageMods triggered by', changes, hostdir);
		if (hostdir.length !== 0 && hostdir !== 'FRAMEWORK') {
			if (curPageMods.hasOwnProperty(hostdir)) {
				curPageMods[hostdir].destroy();
				delete curPageMods[hostdir];
			}
			const filelist = files.getFilesForHostInConfigSubDir(NAME, interestExtension)(hostdir);
			if (filelist !== null)
				curPageMods[hostdir] = makePageMod(framework, filelist, hostdir);
		} else {
			forEach(curPageMods, mod => mod.destroy());
			curPageMods = { };
			const filesByDir = files.getFilesPerConfigSubDir(NAME, interestExtension);
			framework = filesByDir.hasOwnProperty('FRAMEWORK') ? filesByDir.FRAMEWORK : {js: [], css: [] };
			for (let dir in filesByDir)
				if (filesByDir.hasOwnProperty(dir)) {
					const pagemod = makePageMod(framework, filesByDir[dir], dir);
					if (pagemod !== null)
						curPageMods[dir] = pagemod;
				}
		}
	} catch (error) {
		console.error('' + error);
	}
};
loadPageMods([]);

const testInterestingNotify = line => {
	if (line[1].includes('ISDIR'))
		return line[1].includes('CREATE') === false;
	return interestExtension.some(ext => line[2].endsWith('.' + ext));
};
const { DirectoryWatch } = require('./lib/inotify');
const watch = DirectoryWatch(files.getConfigPath(NAME), testInterestingNotify);
watch.on('stablized', loadPageMods);
