// preferred image width
// without JS they are very thumbnaily, but orig size can be way too big for my taste, too
const MAXSIZE = 640;
forEach('img.progressiveMedia-thumbnail', img => {
	const id = img.parentNode.getAttribute('data-image-id');
	if (typeof id === "string")
		img.src = 'https://cdn-images-1.medium.com/freeze/max/' + MAXSIZE + '/' + id;
	else if (img.src.startsWith('https://i.embed.ly/')) {
		let start = img.src.indexOf('url=');
		if (start === -1)
			return;
		start += 4;
		let end = img.src.indexOf('&', start);
		if (end === -1)
			return;
		img.src = decodeURIComponent(img.src.substr(start, end - start));
	}
	img.setAttribute('loading', 'lazy');
	img.setAttribute('importance', 'low');
});
