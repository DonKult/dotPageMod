forEach('figure', fig => {
	if (fig.classList.contains('nextread-advertisement__media'))
		return;
	const url = fig.querySelector('meta[itemprop="url"]');
	if (url === null)
		return;
	let img = document.createElement('img');
	img.src = url.content;
	img.setAttribute('loading', 'lazy');
	img.setAttribute('importance', 'low');
	img.classList.add('dotpagemod-delete');
	fig.insertBefore(img, fig.firstChild);
});
