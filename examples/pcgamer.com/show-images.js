forEach('img.lazy-image[data-src]', img => {
	img.src = img.dataset.src
	img.setAttribute('loading', 'lazy');
	img.setAttribute('importance', 'low');
});
