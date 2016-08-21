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

// install listener for changes in the config files
const testInterestingNotify = line => {
	if (line[1].includes('ISDIR'))
		return line[1].includes('CREATE') === false;
	return dotPageMod.interestExtension.some(ext => line[2].endsWith('.' + ext));
};
const { DirectoryWatch } = require('./lib/inotify');
const watch = DirectoryWatch(files.getConfigPath(NAME), testInterestingNotify);
watch.on('directory/changed', dotPageMod.load);

// add a button displaying a count of how many files apply to this tab
// with an attached panel showing options and list of applying files
const PanelButton = require('./lib/panelbutton.js');
const pb = PanelButton.create(NAME_low, NAME, './../icon.png');
dotPageMod.onPage(PanelButton.pageObserver);
pb.panel.port.on(NAME_low + '/config/reload', () => { pb.panel.hide(); dotPageMod.load([]); });
pb.panel.port.on(NAME_low + '/config/watcher', () => { pb.panel.hide(); watch.restart(); });
watch.on('directory/changed', PanelButton.directoryObserver);

// do the initial complete load
dotPageMod.load([]);
