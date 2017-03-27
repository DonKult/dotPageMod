forEach('img[data-src]', img => {
	img.src = img.getAttribute('data-src');
});
forEach('img[data-lazy]', img => {
	img.src = img.getAttribute('data-lazy');
});
