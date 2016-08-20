"use strict";
const NAME = require("./package.json").title;
const NAME_low = NAME.toLowerCase();
const files = require('./lib/files');

/* enable all logging to console for this extension to allow
   easy debugging of the loaded selfmade js files */
require('./lib/loglevel').setExtension('all');

// start up the main functionality
files.registerConfigDir(NAME);
const dotPageMod = require('./lib/dotpagemod.js');
dotPageMod.setName(NAME);

// add a button displaying a count of how many files apply to this tab
const { ToggleButton } = require("sdk/ui/button/toggle");
const button = ToggleButton({
	id: NAME_low,
	label: NAME,
	icon: './../icon.png',
	badge: '',
	badgeColor: 'black',
});
let tabFiles = {};
dotPageMod.onPage((action, tab, files) => {
	if (typeof tab !== 'object')
		return;
	if (tabFiles.hasOwnProperty(tab.id) === false) {
		tabFiles[tab.id] = [];
		tab.on('close', () => { delete tabFiles[tab.id]; });
	}
	if (action === 'show')
		Array.prototype.push.apply(tabFiles[tab.id], files);
	else if (action === 'hide')
		tabFiles[tab.id]  = tabFiles[tab.id].filter(v => { return files.some(f => f === v) === false; } );
	if (tabFiles[tab.id].length === 0)
		button.state(tab, { badge: '' });
	else
		button.state(tab, { badge: tabFiles[tab.id].length });
});

// install listener for changes in the config files
const testInterestingNotify = line => {
	if (line[1].includes('ISDIR'))
		return line[1].includes('CREATE') === false;
	return dotPageMod.interestExtension.some(ext => line[2].endsWith('.' + ext));
};
const { DirectoryWatch } = require('./lib/inotify');
const watch = DirectoryWatch(files.getConfigPath(NAME), testInterestingNotify);
watch.on('stablized', dotPageMod.load);

// do the initial complete load
dotPageMod.load([]);

// extend our button with a panel to trigger some common actions
const panels = require("sdk/panel");
const panel = panels.Panel({
	contentURL: "./panel.html",
});
const tabs = require("sdk/tabs");
const handleChange = state => {
	if (state.checked) {
		panel.port.emit(NAME_low + '/filelist', tabFiles[tabs.activeTab.id]);
		panel.show({
			position: button
		});
	}
};
button.on('change', handleChange);
const handleHide = () => {
	button.state('window', {checked: false});
};
panel.on('hide', handleHide);
panel.port.on(NAME_low + '/config/reload', () => { panel.hide(); dotPageMod.load([]); });
panel.port.on(NAME_low + '/config/watcher', () => { panel.hide(); watch.restart(); });
panel.port.on(NAME_low + '/config/openurl', (file) => { panel.hide(); tabs.open({ url: file, inNewWindow: false }); });
