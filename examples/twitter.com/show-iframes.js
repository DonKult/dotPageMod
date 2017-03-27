forEach('img[data-src]', img => {
	if (img.getAttribute('src') === null)
		img.src = img.getAttribute('data-src');
});
forEach('div.js-macaw-cards-iframe-container[data-src]', div => {
	const link = document.createElement('a');
	link.href = 'https://twitter.com' + div.getAttribute('data-src');
	link.innerText = '[open iframe URL in new tab]';
	div.appendChild(link);
	div.style['min-height'] = '100%';
});
