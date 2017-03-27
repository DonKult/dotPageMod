// a blank page – seriously? If at least the noscript tag wouldn't be empty…
forIt('meta[property="og:image"]', image => {
	forIt('meta[property="og:title"]', title => {
		forIt('title', t => t.textContent = title.content);
		const t = document.createElement('h1');
		t.textContent = title.content;
		document.body.appendChild(t);
	});
	const i = document.createElement('img');
	i.src = image.content;
	document.body.appendChild(i);
});
