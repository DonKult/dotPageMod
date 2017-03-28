"use strict";

const buttonClickHandler = e => {
	const action = e.target.getAttribute('data-emit-action');
	if (action === null)
		return;
	const param = e.target.getAttribute('data-emit-param');
	if (action === 'openurl')
		browser.tabs.create({url: param});
	else
		browser.runtime.sendMessage({cmd: action}).then(() => window.close());
};
const buttons = document.querySelectorAll('button');
for (let i = 0; i < buttons.length; ++i) {
	buttons[i].addEventListener('click', buttonClickHandler);
	buttons[i].disabled = false;
}

const updateFileListing = m => {
	const filelisting = document.querySelector('#filelisting');
	while (filelisting.hasChildNodes())
		filelisting.removeChild(filelisting.firstChild);
	document.querySelector('#browse-config').setAttribute('data-emit-param', m.baseuri);
	if (m.files === undefined)
		return;
	let filetree = {};
	for (let file in m.files) {
		if (m.files.hasOwnProperty(file)) {
			const part = file.split('/');
			if (filetree.hasOwnProperty(part[0]) === false)
				filetree[part[0]] = {};
			if (filetree[part[0]].hasOwnProperty(part[1]) === false)
				filetree[part[0]][part[1]] = {};
			filetree[part[0]][part[1]][part[2]] = file;
		}
	}
	const clickHandler = e => { browser.tabs.create({url: e.target.href}); e.preventDefault(); };
	for (let pack in filetree) {
		if (filetree.hasOwnProperty(pack)) {
			const packli = document.createElement('li');
			const packlink = document.createElement('a');
			packlink.setAttribute('href', m.baseuri + pack + '/');
			packlink.addEventListener('click', clickHandler);
			const packtext = document.createTextNode(pack);
			packlink.appendChild(packtext);
			packli.appendChild(packlink);
			const packul = document.createElement('ul');
			for (let host in filetree[pack]) {
				if (filetree[pack].hasOwnProperty(host)) {
					const hostli = document.createElement('li');
					const hostlink = document.createElement('a');
					hostlink.setAttribute('href', [m.baseuri,pack,host].join('/'));
					hostlink.addEventListener('click', clickHandler);
					const hosttext = document.createTextNode(host);
					hostlink.appendChild(hosttext);
					hostli.appendChild(hostlink);
					const hostul = document.createElement('ul');
					for (let file in filetree[pack][host]) {
						if (filetree[pack][host].hasOwnProperty(file)) {
							const li = document.createElement('li');
							const link = document.createElement('a');
							link.setAttribute('href', [m.baseuri,pack,host,file].join('/'));
							if (m.files[[pack,host,file].join('/')] === false)
								link.classList.add('failed');
							link.addEventListener('click', clickHandler);
							const text = document.createTextNode(file);
							link.appendChild(text);
							li.appendChild(link);
							hostul.appendChild(li);
						}
					}
					hostli.appendChild(hostul);
					packul.appendChild(hostli);
				}
			}
			packli.appendChild(packul);
			filelisting.appendChild(packli);
		}
	}
};

browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
	browser.runtime.sendMessage({cmd: 'getfilelist', tabId: tabs[0].id}).then(updateFileListing);
});

browser.runtime.onMessage.addListener(msg => {
	if (msg.cmd === 'closepanel')
		window.close();
});
