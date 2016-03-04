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
dotPageMod.load([]);

// install listener for changes in the config files
const testInterestingNotify = line => {
	if (line[1].includes('ISDIR'))
		return line[1].includes('CREATE') === false;
	return dotPageMod.interestExtension.some(ext => line[2].endsWith('.' + ext));
};
const { DirectoryWatch } = require('./lib/inotify');
const watch = DirectoryWatch(files.getConfigPath(NAME), testInterestingNotify);
watch.on('stablized', dotPageMod.load);

// add a panel button to trigger some common actions
const { ToggleButton } = require("sdk/ui/button/toggle");
const button = ToggleButton({
	id: NAME_low,
	label: NAME,
	icon: './../icon.png'
});
const panels = require("sdk/panel");
const panel = panels.Panel({
	contentURL: "./panel.html",
	contentScriptFile: "./panel.js"
});
const handleChange = state => {
	if (state.checked) {
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
const tabs = require("sdk/tabs");
panel.port.on(NAME_low + '/config/browse', () => { panel.hide(); tabs.open({ url: 'resource://' + NAME_low + '-config/', inNewWindow: false }); });
panel.port.on(NAME_low + '/config/readme', () => { panel.hide(); tabs.open({ url: './../README.html', inNewWindow: false }); });
panel.port.on(NAME_low + '/config/examples', () => { panel.hide(); tabs.open({ url: 'https://github.com/DonKult/dotPageMod/tree/master/examples', inNewWindow: false }); });
