"use strict";
const buttonClickHandler = e => {
	const action = e.target.getAttribute('data-emit-action');
	if (action === null)
		return;
	const param = e.target.getAttribute('data-emit-param');
	if (param === null)
		addon.port.emit('dotpagemod/config/' + action);
	else
		addon.port.emit('dotpagemod/config/' + action, param);
};
const buttons = document.querySelectorAll('button');
for (let i = 0; i < buttons.length; ++i) {
	buttons[i].addEventListener('click', buttonClickHandler);
	buttons[i].disabled = false;
}

addon.port.on('dotpagemod/filelist', (baseuri, filelist) => {
	const filelisting = document.querySelector('#filelisting');
	while (filelisting.hasChildNodes())
		filelisting.removeChild(filelisting.firstChild);
	if (filelist === null)
		return;
	document.querySelector('#browse-config').setAttribute('data-emit-param', baseuri);
	let filetree = {};
	filelist.forEach(file => {
		const path = file.substr(baseuri.length);
		const part = path.split('/');
		if (filetree.hasOwnProperty(part[0]) === false)
			filetree[part[0]] = {};
		if (filetree[part[0]].hasOwnProperty(part[1]) === false)
			filetree[part[0]][part[1]] = {};
		filetree[part[0]][part[1]][part[2]] = file;
	});
	const clickHandler = e => { addon.port.emit('dotpagemod/config/openurl', e.target.href); e.preventDefault(); };
	for (let pack in filetree) {
		if (filetree.hasOwnProperty(pack)) {
			const packli = document.createElement('li');
			const packlink = document.createElement('a');
			packlink.setAttribute('href', baseuri + pack + '/');
			packlink.addEventListener('click', clickHandler);
			const packtext = document.createTextNode(pack);
			packlink.appendChild(packtext);
			packli.appendChild(packlink);
			const packul = document.createElement('ul');
			for (let host in filetree[pack]) {
				if (filetree[pack].hasOwnProperty(host)) {
					const hostli = document.createElement('li');
					const hostlink = document.createElement('a');
					hostlink.setAttribute('href', baseuri + pack + '/' + host + '/');
					hostlink.addEventListener('click', clickHandler);
					const hosttext = document.createTextNode(host);
					hostlink.appendChild(hosttext);
					hostli.appendChild(hostlink);
					const hostul = document.createElement('ul');
					for (let file in filetree[pack][host]) {
						if (filetree[pack][host].hasOwnProperty(file)) {
							const li = document.createElement('li');
							const link = document.createElement('a');
							link.setAttribute('href', filetree[pack][host][file]);
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
});
