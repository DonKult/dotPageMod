forEach('img[data-url]', i => {
	i.src = i.getAttribute('data-url');
	i.setAttribute('loading', 'lazy');
	i.setAttribute('importance', 'low');
});
