forEach('link[type="application/rss+xml"]', rss => {
	let a = document.createElement('a');
	a.classList.add('dotpagemod-delete');
	a.href = rss.getAttribute('href');
	a.textContent = 'RSS Feed';
	// find a place to insert the feed link
	let ul = $('#footer-links ul');
	if (ul !== null) {
		let li = document.createElement('li');
		li.appendChild(a);
		ul.appendChild(li);
	} else {
		let footer = $('footer');
		if (footer === null)
			footer = $('#footer');
		if (footer === null)
			footer = $('body');
		footer.appendChild(a);
	}
});
