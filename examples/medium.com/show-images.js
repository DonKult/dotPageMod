// preferred image width
// without JS they are very thumbnaily, but orig size can be way too big for my taste, too
const MAXSIZE = 640;
forEach('img.progressiveMedia-thumbnail', img => {
	const id = img.parentNode.getAttribute('data-image-id');
	if (typeof id !== "string")
		return
	img.src = 'https://cdn-images-1.medium.com/freeze/max/' + MAXSIZE + '/' + id;
});
