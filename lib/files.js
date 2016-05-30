"use strict";
const file = require('sdk/io/file');
const profileDir = require('sdk/system').pathFor('ProfD');
const forEach = require('sdk/util/object').each;

const getConfigPath = (...dirs) => dirs.reduce((r, v) => file.join(r, v), profileDir);
exports.getConfigPath = getConfigPath;

const listConfigDir = (...dirs) => {
	try {
		return file.list(getConfigPath(...dirs)).sort();
	} catch(error) {
		console.warn(error);
		return [];
	}
};
/* reduces an array of files into a map with the given extensions
   filled and the rest of the files discarded */
const reduceByExtension = (result, value) => {
	for (let i in result)
		if (result.hasOwnProperty(i) && value.endsWith('.' + i)) {
			result[i].push(value);
			return result;
		}
	return result;
};
const getFilesForHostInConfigSubDir = (configdir, exts) => {
	const resource = configdir.toLowerCase() + '-config';
	return subdir => {
		const extcopy = {};
		exts.forEach(v => extcopy[v] = []);
		const filesByExt = listConfigDir(configdir, subdir).reduce(reduceByExtension, extcopy);
		forEach(filesByExt, (files, i) => {
			filesByExt[i] = files.map(name => {
				return [ resource, subdir, name ].reduce((result, value) => {
					return result + '/' + encodeURIComponent(value);
				}, 'resource:/');
			});
		});
		for (let i in filesByExt)
			if (filesByExt.hasOwnProperty(i) && filesByExt[i].length !== 0)
				return filesByExt;
		return null;
	};
};
/* returns a map of each subdirectory of the given config directory
   where each value is a map of arrays of files in this subdirectory with a
   given extension. Subdirectories which have no matching files will not be
   part of the result map. It is assumed that you have called #registerConfigDir
   with the given configdir before using the filenames */
exports.getFilesForHostInConfigSubDir = getFilesForHostInConfigSubDir;
exports.getFilesPerConfigSubDir = (configdir, exts) => {
	const filesGetter = getFilesForHostInConfigSubDir(configdir, exts);
	const result = {};
	listConfigDir(configdir).forEach(subdir => {
		const files = filesGetter(subdir);
		if (files !== null)
			result[subdir] = files;
	});
	return result;
};
/* the directory in the profile specified with configdir is mounted as
   "resource://configdir-config" which makes the files and directories in it
   accessible as an URI satisfying local URI requirements of e.g. PageMod */
const resourceURI = require('sdk/uri/resource');
const url = require('sdk/url');
const unload = require("sdk/system/unload").when;
const resourceConfig = {};
unload(() => {
	for (let i in resourceConfig)
		if (resourceConfig[i] !== null)
			resourceURI.unmount(resourceConfig[i]);
});
exports.registerConfigDir = (configdir) => {
	const resource = configdir.toLowerCase() + '-config';
	// we already mounted the directory, no need for remounts
	if (resourceConfig[configdir] !== undefined)
		return;
	resourceURI.mount(resource, url.fromFilename(getConfigPath(configdir)));
	resourceConfig[configdir] = resource;
};
/* Note: on addon unload it will automatically be unmount by this module */
exports.unregisterConfigDir = (configdir) => {
	if (resourceConfig[configdir] === undefined)
		return;
	resourceURI.unmount(resourceConfig[configdir]);
	resourceConfig[configdir] = undefined;
};
/* factory for a function which runs a given script from within a limited set.
   This is used to allow content scripts to run a command without giving it
   the right to just call any command – it can only call commands shipped
   alongside the rest of the configuration. stdout, stderr as well as the exit
   are passed through the worker back to the content script as events in case
   it wants to process the data. */
const child_process = require("sdk/system/child_process");
const emit = require('sdk/event/core').emit;
const environment = require('sdk/system/environment').env;
exports.runHostScript = (worker, configdir, hostname, scripts) => {
	const absolutePath = getConfigPath(configdir, hostname);
	return (script, params) => {
		console.log('hostscript', hostname, script, params);
		if (script.match(/^([a-zA-Z0-9-]*\.sh)(@[0-9]+)$/)) {
			const port = configdir.toLowerCase() + '/run/' + script;
			const absoluteFile = file.join(absolutePath, script.substr(0, script.indexOf('@')));
			if (scripts.some(run => url.toFilename(run) === absoluteFile)) {
				try {
					const childenv = { };
					[ 'HOME', 'USER', 'PATH', 'DISPLAY', 'SHELL',
					  'BROWSER', 'EDITOR', 'VISUAL', 'XAUTHORITY',
					  'LANG', 'LC_ALL', 'XDG_RUNTIME_DIR', 'TERM',
					  'DBUS_SESSION_BUS_ADDRESS', 'SSH_AUTH_SOCK' ].forEach(env => {
						if (env in environment)
							childenv[env] = environment[env];
					});
					let child = child_process.spawn(absoluteFile, params, {
						cwd: absolutePath,
						env: childenv
					});
					child.stdout.on('data', data => worker.port.emit(port + '/stdout', data));
					child.stderr.on('data', data => worker.port.emit(port + '/stderr', data));
					child.on('exit', (code, signal) => { child = null; worker.port.emit(port + '/exit', code, signal); });
					worker.port.on(port + '/stdin/data', data => emit(child.stdin, 'data', data));
					worker.port.on(port + '/stdin/end', () => emit(child.stdin, 'end'));
					worker.port.on(port + '/kill', () => { if (child !== null) { child.kill(); child = null; } });
				} catch (e) {
					console.warn('Executing script', script, 'failed with an exception: ' + e);
					worker.port.emit(port + '/error', -255);
				}
			} else {
				console.warn('Ignored request to execute script', script, 'as it does not exist');
				worker.port.emit(port + '/error', -1);
			}
		} else {
			console.warn('Ignored request to execute script with illegal filename:', script);
		}
	};
};
