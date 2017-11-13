"use strict";
const getHostDirsFromURI = url => {
	let pros = [];
	const u = url.split('/', 3);
	if (u[0] === 'http:' || u[0] === 'https:' || u[0] === 'ftp:') {
		// this builds an array like [ ALL, com, example.com, foo.example.com ]
		let preset;
		if (u[0] === 'ftp:')
			preset = [ 'ALL_ftp' ];
		else if (u[0] === 'https:')
			preset = [ 'ALL', 'ALL_https' ];
		else
			preset = [ 'ALL', 'ALL_http' ];
		Array.prototype.push.apply(pros, u[2].split('.').reverse().reduce((a,v,i) => {
			if (i === 0)
				a.push(v);
			else
				a.push([v,a[a.length - 1]].join('.'));
			return a;
		}, preset));
	} else if (u[0] === 'file:')
		pros.push('ALL_file');
	return pros;
};
