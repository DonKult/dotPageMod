forEach('img[data-src]', img => {
	img.src = img.getAttribute('data-src');
});
