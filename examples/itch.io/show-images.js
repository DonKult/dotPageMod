forEach('[data-background_image]', img => {
	img.style["background-image"] = 'url(' + img.getAttribute('data-background_image') + ')';
	img.setAttribute('loading', 'lazy');
	img.setAttribute('importance', 'low');
});
