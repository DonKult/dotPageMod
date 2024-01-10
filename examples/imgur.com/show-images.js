forEach('div.post-image-container > div.post-image', div => {
	if (div.querySelector('img') !== null)
		return;
	const img = document.createElement('img');
	let metaurl = div.querySelector('meta[itemprop="contentUrl"]');
	if (metaurl === null)
		metaurl = div.querySelector('meta[itemprop="thumbnailUrl"]');
	if (metaurl === null)
		img.src = 'https://i.imgur.com/' + div.parentNode.id + '.png';
	else
		img.src = metaurl.getAttribute('content');
	img.setAttribute('loading', 'lazy');
	img.setAttribute('importance', 'low');
	img.classList.add('dotpagemod-delete');
	div.appendChild(img);
});
