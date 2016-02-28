"use strict";
const pref = require("sdk/preferences/service");
const unload = require("sdk/system/unload").when;

exports.setGlobal = (level) => {
	const confName = 'extensions.sdk.console.logLevel';
	const oldValue = pref.get(confName);
	pref.set(confName, level);
	unload(() => pref.set(confName, oldValue));
};

exports.setExtension = (level, force) => {
	const id = require('sdk/self').id;
	const name = 'extensions.' + id + '.sdk.console.logLevel';
	if (pref.isSet(name) === false || force === true)
		pref.set(name, level);
};
