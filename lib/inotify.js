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
const { emit } = require('sdk/event/core');

const testNonEmptyLine = line => line.length !== 0;
const reduceWithSpace = (r, a) => r += ' ' + a;
const formatNotifyWaitLine = line => {
	// try to deal with spaces in paths to profiles.
	// FIXME: all hope is lost if your css/js files include spaces…
	const info = line.split(' ');
	info[0] = info.splice(1, info.length - 3).reduce(reduceWithSpace, info[0]).split('/').filter(d => d.length !== 0);
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
		this._startChild();
	},
	restart() {
		if (this.child !== undefined)
			this.child.kill();
		this.child = undefined;
		this._startChild();
	},
	_buffer: '',
	_changes: [],
	_stablizeTimer: null,
	_startChild() {
		const notifytool = findBinaryInPath('inotifywait');
		console.log("Watching", this.topdir, 'with', notifytool);
		if (notifytool.length === 0) {
			console.error("Couldn't find inotifywait in PATH!");
		} else {
			this.child = child_process.spawn(notifytool,
					[ '-qrme', 'create,move,modify,delete',
					'--exclude', '^.*(\.sw[opx]|~|[0-9]+)$', // ignore vim swap files, backups and inodes
					this.topdir ], { cwd: this.topdir });

			this.child.stdout.on('data', data => this._processNotifies(data));
			this.child.stderr.on('data', data => console.error('stderr of watcher:', data));
			this.child.on('exit', (code, signal) => {
				console.error('child process exited with code ' + code + ' and signal ' + signal);
				this.child = undefined;
			});
			unload(() => { if (this.child !== undefined) this.child.kill(); });
		}
	},
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
		Array.prototype.push.apply(this._changes, newchanges);
		if (this._buffer.length === 0 && this._changes.length !== 0)
			this._stablizeTimer = timers.setTimeout(() => this._notifiesStabilized(),
					newchanges.some(testIsAMoveFromChange) ? 500 : 100);
	},
	_notifiesStabilized() {
		this._stablizeTimer = null;
		emit(this, 'stablized', this._changes);

		// FIXME: support multiple independent changes
		let dirs = [];
		// was a single file modified or deleted?
		if (this._changes.length === 1 && (this._changes[0][1].includes('MODIFY') ||
					(this._changes[0][1].includes('DELETE') && this._changes[0][1].includes('ISDIR') === false))) {
			dirs = this._changes[0][0];
		// was a single file modified (vim edition) ?
		} else if (this._changes.length === 3 && this._changes[0][2] === this._changes[1][2] &&
				this._changes[1][2] === this._changes[2][2] && this._changes[0][1].includes('MOVED_FROM') &&
				this._changes[1][1].includes('CREATE') && this._changes[2][1].includes('MODIFY')) {
			dirs = this._changes[2][0];
		// a new file was created
		} else if (this._changes.length === 2 && this._changes[0][2] === this._changes[1][2] &&
				this._changes[0][1].includes('CREATE') && this._changes[1][1].includes('MODIFY')) {
			dirs = this._changes[1][0];
		}
		emit(this, 'directory/changed', dirs);
		this._changes = [];
	}
});
