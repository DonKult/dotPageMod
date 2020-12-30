forEach('div.post-image-container > div.post-image', div => {
	if (div.children.length !== 0)
		return;
	const img = document.createElement('img');
	img.src = 'https://i.imgur.com/' + div.parentNode.id + '.png';
	img.setAttribute('loading', 'lazy');
	img.setAttribute('importance', 'low');
	img.classList.add('dotpagemod-delete');
	div.appendChild(img);
});
