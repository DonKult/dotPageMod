forEach('img.lazyload[data-srcset]', img => {
	img.src = img.getAttribute('data-srcset').split(' ')[0];
	img.setAttribute('loading', 'lazy');
	img.setAttribute('importance', 'low');
});
