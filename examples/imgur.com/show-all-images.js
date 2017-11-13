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
forEach('.post-image > .video-container', c => {
	const url = c.querySelector('meta[itemprop=embedURL]');
	if (url === null)
		return;
	let img = document.createElement('img');
	img.classList.add('dotpagemod-delete');
	img.src = url.getAttribute('content');
	c.appendChild(img);
});
