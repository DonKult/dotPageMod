forEach('picture source[media="--small"]', source => {
	const img = source.parentNode.querySelector('img');
	img.src = source.getAttribute('data-srcset').split(', ')[0];
	img.setAttribute('loading', 'lazy');
	img.setAttribute('importance', 'low');
});
