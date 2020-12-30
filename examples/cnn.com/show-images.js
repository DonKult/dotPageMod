forEach('img.media__image--responsive', img => {
	img.src = img.dataset.srcMedium;
	img.setAttribute('loading', 'lazy');
	img.setAttribute('importance', 'low');
});
