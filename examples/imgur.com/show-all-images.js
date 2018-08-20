forEach('.post-image-container > .post-image', c => {
	if (c.children.length !== 0)
		return;
	const id = c.parentNode.id;
	let a = document.createElement('a');
	a.classList.add('zoom', 'dotpagemod-delete');
	a.href = '//i.imgur.com/' + id + '.jpg';
	let img = document.createElement('img');
	img.setAttribute('itemprop', 'contentURL');
	img.src = a.href;
	a.appendChild(img);
	c.appendChild(a);
});
forEach('.post-image-container > .post-image > meta[itemprop="contentURL"]', c => {
	let a = document.createElement('a');
	a.classList.add('zoom', 'dotpagemod-delete');
	a.href = c.getAttribute('content');
	let img = document.createElement('img');
	img.setAttribute('itemprop', 'contentURL');
	img.src = a.href;
	a.appendChild(img);
	c.parentNode.appendChild(a);
});
forEach('.post-image > .video-container', c => {
	const url = c.querySelector('meta[itemprop=embedURL]');
	if (url === null)
		return;
	let img = document.createElement('img');
	img.classList.add('dotpagemod-delete');
	img.src = url.getAttribute('content');
	if (img.src.endsWith('.gifv'))
		img.src = img.src.substr(0, img.src.length - 1);
	c.appendChild(img);
	forIt(c.querySelector('video'), v => v.style.display = 'none');
});
