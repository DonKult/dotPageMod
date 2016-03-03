"use strict";
const NAME = require("./package.json").title;
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
