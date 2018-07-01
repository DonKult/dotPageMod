"use strict";
const getHostDirsFromURI = url => {
	let pros = [];
	const u = url.split('/', 3);
	if (u[0] === 'http:' || u[0] === 'https:' || u[0] === 'ftp:') {
		// this builds an array like [ ALL, com, example.com, foo.example.com ]
		let preset;
		let preset_port;
		if (u[0] === 'ftp:') {
			preset = [ 'ALL_ftp' ];
			preset_port = 21;
		} else if (u[0] === 'https:') {
			preset = [ 'ALL', 'ALL_https' ];
			preset_port = 443;
		} else {
			preset = [ 'ALL', 'ALL_http' ];
			preset_port = 80;
		}
		let hostname_port = u[2].split(':');
		let hostname = hostname_port[0];
		let port;
		if (hostname_port.length === 1)
			port = preset_port;
		else
			port = hostname_port[1];
		Array.prototype.push.apply(pros, hostname.split('.').reverse().reduce((a,v,i) => {
			if (i === 0)
				a.push(v, [v, port].join(':'));
			else {
				let toplevelhost = [v,a[a.length - 2]].join('.');
				a.push(toplevelhost, [toplevelhost, port].join(':'));
			}
			return a;
		}, preset));
	} else if (u[0] === 'file:')
		pros.push('ALL_file');
	return pros;
};
