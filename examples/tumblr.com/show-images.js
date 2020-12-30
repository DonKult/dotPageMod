forIt('#content-image', img => {
	const real = img.getAttribute('data-src');
	if (real === null)
		return;
	img.src = real;
	// could do with CSS instead
	img.style.opacity = 1;
	img.setAttribute('loading', 'lazy');
	img.setAttribute('importance', 'low');
});
