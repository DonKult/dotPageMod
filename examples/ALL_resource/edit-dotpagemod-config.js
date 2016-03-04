if (window.location.hostname === 'dotpagemod-config') {
	let runner = 0;
	const editLink = link => e => {
		e.preventDefault();
		e.stopPropagation();
		const i = ++runner;
		self.port.emit('dotpagemod/run', 'edit-dotpagemod-config.sh@' + i, [ 'edit', decodeURI(link.href) ]);
	};
	const deleteLink = link => e => {
		e.preventDefault();
		e.stopPropagation();
		const uri = decodeURI(link.href);
		if (confirm('Are you sure about deleting ' + uri + ' ?')) {
			const i = ++runner;
			self.port.on('dotpagemod/run/edit-dotpagemod-config.sh@' + i + '/exit', () => window.location = window.location);
			self.port.emit('dotpagemod/run', 'edit-dotpagemod-config.sh@' + i, [ 'rm', uri ]);
			$('body').style.display = 'none';
		}
	};
	forEach('a.file[href$=".css"], a.file[href$=".js"], a.file[href$=".sh"]', link => {
		link.classList.add('edit');
		addEventListener(link, 'click', editLink(link));
		const p = link.parentNode;
		if (p.querySelector('.delete, .create') === null) {
			const del = document.createElement('span');
			del.textContent = '🚮';
			del.classList.add('delete');
			addEventListener(del, 'click', deleteLink(link));
			p.appendChild(del);
		}
	});
	const deleteDirectoryLink = link => e => {
		e.preventDefault();
		e.stopPropagation();
		const uri = decodeURI(link.href);
		if (confirm('Are you sure about deleting ' + uri + ' ?')) {
			const i = ++runner;
			self.port.on('dotpagemod/run/edit-dotpagemod-config.sh@' + i + '/exit', () => window.location = window.location);
			self.port.emit('dotpagemod/run', 'edit-dotpagemod-config.sh@' + i, [ 'rmdir', uri ]);
			$('body').style.display = 'none';
		}
	};
	forEach('a.dir', link => {
		const p = link.parentNode;
		if (p.querySelector('.delete, .create') === null) {
			const del = document.createElement('span');
			del.textContent = '🚮';
			del.classList.add('delete');
			addEventListener(del, 'click', deleteDirectoryLink(link));
			p.appendChild(del);
		}
	});
	const createA = (text, classes) => {
		const a = document.createElement('a');
		a.textContent = text;
		a.classList.add(...classes);
		a.href = '#';
		return a;
	};
	const newFileLink = e => {
		e.preventDefault();
		e.stopPropagation();
		const newfile = prompt('Create the file:');
		if (newfile !== null) {
			const i = ++runner;
			const uri = window.location.toString() + newfile;
			self.port.on('dotpagemod/run/edit-dotpagemod-config.sh@' + i + '/exit', () => window.location = window.location);
			self.port.emit('dotpagemod/run', 'edit-dotpagemod-config.sh@' + i, [ 'edit', decodeURI(uri) ]);
		}
	};
	const newDirectoryLink = e => {
		e.preventDefault();
		e.stopPropagation();
		const newdir = prompt('Create the directory:');
		if (newdir !== null) {
			const i = ++runner;
			const uri = window.location.toString() + newdir;
			self.port.on('dotpagemod/run/edit-dotpagemod-config.sh@' + i + '/exit', () => window.location = window.location);
			self.port.emit('dotpagemod/run', 'edit-dotpagemod-config.sh@' + i, [ 'mkdir', decodeURI(uri) ]);
		}
	};
	forIt("#UI_goUp > .up", up => {
		const a = [ createA('Create new directory', [ 'create', 'dir' ]),
			    createA('Create new file', [ 'create', 'file' ]) ];
		const li = [ document.createElement('li'), document.createElement('li'), document.createElement('li') ];
		li[1].appendChild(a[0]);
		li[2].appendChild(a[1]);
		const ul = document.createElement('ul');
		li.forEach(l => ul.appendChild(l));
		const p = up.parentNode;
		p.appendChild(ul);
		li[0].appendChild(up);
	});
	if (window.location.pathname === '/') {
		forIt('.create.dir', a => { a.parentNode.style.display = 'block'; addEventListener(a, 'click', newDirectoryLink); });
		forIt('.create.file', a => a.parentNode.style.display = 'none');
	} else {
		forIt('.create.file', a => { a.parentNode.style.display = 'block'; addEventListener(a, 'click', newFileLink); });
		forIt('.create.dir', a => a.parentNode.style.display = 'none');
	}
}
