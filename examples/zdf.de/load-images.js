forEach('div[data-module="zdfplayer"]', player => {
	if (player.children.length !== 0)
		return;
	const jsonimages = player.getAttribute('data-zdfplayer-teaser-image');
	if (jsonimages === null || jsonimages.length === 0)
		return;
	const images = JSON.parse(jsonimages);
	const picture = document.createElement('picture');
	for (let key of Object.keys(images)) {
		let source = document.createElement('source');
		source.setAttribute('srcset', images[key]);
		source.setAttribute('media', '(min-width:' + key.split('x')[0] + 'px)');
		picture.appendChild(source);
	}
	const img = document.createElement('img');
	img.src = 'about:blank';
	img.classList.add('zdfplayer-poster');
	picture.appendChild(img);

	player.appendChild(picture);
});
