forEach('picture img.lazyload[data-src]', img => {
	img.src = img.getAttribute('data-src');
	i.setAttribute('loading', 'lazy');
	i.setAttribute('importance', 'low');
});
forEach('picture source[data-srcset]', img => img.srcset = img.getAttribute('data-srcset'));
