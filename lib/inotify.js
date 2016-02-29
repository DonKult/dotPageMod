"use strict";
/* The SDK hasn't implemented io/fs.watch* yet and reason is probably that the
   toolkit itself has currently no real (non-interval) watch implementation:
   https://bugzilla.mozilla.org/show_bug.cgi?id=958280

   So, given that there is no generic implementation for this available for now
   I opted here for a very simple linux-specific implementation spawning a
   inotifywait child (available in Debian in the inotify-tools package). */
const { Class } = require('sdk/core/heritage');
const { EventTarget } = require("sdk/event/target");
const child_process = require("sdk/system/child_process");
const file = require("sdk/io/file");
const timers = require("sdk/timers");
const unload = require("sdk/system/unload").when;
const emit = require('sdk/event/core').emit;

const testNonEmptyLine = line => line.length !== 0;
const reduceWithSpace = (r, a) => r += ' ' + a;
const formatNotifyWaitLine = line => {
	// try to deal with spaces in paths to profiles.
	// FIXME: all hope is lost if your css/js files include spaces…
	const info = line.split(' ');
	info[0] = file.basename(info.splice(1, info.length - 3).reduce(reduceWithSpace, info[0]));
	info[1] = info[1].split(',');
	return info;
};
const testIsAMoveFromChange = line => line[1].includes('MOVED_FROM');
const findBinaryInPath = (name) => {
	try {
		const isin = require('sdk/system/environment').env.PATH.split(':').filter(path => file.exists(file.join(path, name)));
		if (isin.length !== 0)
			return file.join(isin[0], name);
	} catch(e) {
		console.warn('' + e);
	}
	return '';
};
exports.DirectoryWatch = Class({
	extends: EventTarget,
	initialize(topdir, filtertest) {
		this.topdir = topdir;
		this.testInterestingNotify = filtertest;
		const notifytool = findBinaryInPath('inotifywait');
		console.log("Watching", topdir, 'with', notifytool);
		if (notifytool.length === 0) {
			console.error("Couldn't find inotifywait in PATH!");
		} else {
			this.child = child_process.spawn(notifytool,
					[ '-qrme', 'create,move,modify,delete',
					'--exclude', '^.*(\.sw[opx]|~|[0-9]+)$', // ignore vim swap files, backups and inodes
					topdir ]);

			this.child.stdout.on('data', data => this._processNotifies(data));
			this.child.stderr.on('data', data => console.error('stderr of watcher:', data));
			this.child.on('close', (code, signal) => {
				console.error('child process exited with code ' + code + ' and signal ' + signal);
				this.child = undefined;
			});
			unload(() => { if (this.child !== undefined) this.child.kill(); });
		}
	},
	_buffer: '',
	_changes: [],
	_stablizeTimer: null,
	_splitIntoLines(data) {
		// only deal with complete lines in this run,
		// buffer incompletes which are at the end and prefix the next run with it
		if (this._buffer.length !== 0)
			data = this._buffer + data;
		const lines = data.split('\n');
		const lastlineidx = lines.length - 1;
		if (lines[lastlineidx].length !== 0) {
			this._buffer = lines[lastlineidx];
			lines[lastlineidx] = '';
		}
		return lines;
	},
	_processNotifies(data) {
		if (this._stablizeTimer !== null) {
			timers.clearTimeout(this._stablizeTimer);
			this._stablizeTimer = null;
		}
		const newchanges = this._splitIntoLines(data)
			.filter(testNonEmptyLine)
			.map(formatNotifyWaitLine)
			.filter(this.testInterestingNotify);
		this._changes = this._changes.concat(newchanges);
		if (this._buffer.length === 0 && this._changes.length !== 0)
			this._stablizeTimer = timers.setTimeout(() => this._notifiesStabilized(),
					newchanges.some(testIsAMoveFromChange) ? 500 : 100);
	},
	_notifiesStabilized() {
		this._stablizeTimer = null;
		emit(this, 'stablized', this._changes);
		this._changes = [];
	}
});
