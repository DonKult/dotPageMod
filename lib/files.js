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
/* returns a map of each subdirectory of the given config directory
   where each value is a map of arrays of files in this subdirectory with a
   given extension. Subdirectories which have no matching files will not be
   part of the result map. It is assumed that you have called #registerConfigDir
   with the given configdir before using the filenames */
exports.getFilesPerConfigSubDir = (configdir, exts) => {
	const resource = configdir.toLowerCase() + '-config';
	const result = {};
	listConfigDir(configdir).forEach(subdir => {
		const extcopy = {};
		exts.forEach(v => extcopy[v] = []);
		const filesByExt = listConfigDir(configdir, subdir).reduce(reduceByExtension, extcopy);
		forEach(filesByExt, (files, i) => {
			filesByExt[i] = files.map((name) => {
				return [ resource, subdir, name ].reduce((result, value) => {
					return result + '/' + encodeURIComponent(value);
				}, 'resource:/');
			});
		});
		for (let i in filesByExt) {
			if (filesByExt.hasOwnProperty(i) && filesByExt[i].length !== 0) {
				result[subdir] = filesByExt;
				break;
			}
		}
	});
	return result;
};
/* the directory in the profile specified with configdir is mounted as
   "resource://configdir-config" which makes the files and directories in it
   accessible as an URI satisfying local URI requirements of e.g. PageMod */
const resourceURI = require('sdk/uri/resource');
const url = require('sdk/url');
const resourceConfig = {};
require("sdk/system/unload").when(() => {
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
