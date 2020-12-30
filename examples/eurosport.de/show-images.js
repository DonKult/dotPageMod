forEach('.lazyload-ok[data-img-interchange]', div => {
	const data = JSON.parse(div.getAttribute('data-img-interchange'));
	const img = div.querySelector('img');
	img.src = data['f']['85'].src;
	img.setAttribute('loading', 'lazy');
	img.setAttribute('importance', 'low');
});
forEach('.lazyload[data-lazy-type="img"]', div => {
	const img = div.querySelector('img');
	img.src = div.getAttribute('data-lazy');
	img.setAttribute('loading', 'lazy');
	img.setAttribute('importance', 'low');
});
