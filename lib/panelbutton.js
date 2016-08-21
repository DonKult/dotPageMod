"use strict";

let button;
let tabFiles = {};

exports.create = (id, label, icon) => {
	const { ToggleButton } = require("sdk/ui/button/toggle");
	button = ToggleButton({
		'id': id,
		'label': label,
		'icon': icon,
		'badge': '',
		'badgeColor': 'black',
	});

	// extend our button with a panel to trigger some common actions
	const panels = require("sdk/panel");
	const panel = panels.Panel({
		contentURL: "./panel.html",
	});
	const tabs = require("sdk/tabs");
	const handleChange = state => {
		if (state.checked) {
			panel.port.emit(id + '/filelist', tabFiles[tabs.activeTab.id]);
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
	panel.port.on(id + '/config/openurl', (file) => { panel.hide(); tabs.open({ url: file, inNewWindow: false }); });
	return { 'button': button, 'panel': panel };
};

exports.pageObserver = (action, tab, files) => {
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
};

const filterDir = dir => path => {
	const p = path.split('/');
	return p[p.length - 2] !== dir;
};

exports.directoryObserver = dir => {
	if (dir.length === 0) {
		tabFiles = {};
		return;
	}
	for (let tabid in tabFiles) {
		if (tabFiles.hasOwnProperty(tabid)) {
			const filteredFiles = tabFiles[tabid].filter(filterDir(dir[dir.length - 1]));
			// if a file matched, nuke the FRAMEWORK files, too
			if (tabFiles[tabid].length !== filteredFiles.length)
				tabFiles[tabid] = filteredFiles.filter(filterDir('FRAMEWORK'));
		}
	}
};
