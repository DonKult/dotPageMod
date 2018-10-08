forIt('#strip', img => {
	if (img.hasAttribute('alt')) {
		let alt = document.createElement('div');
		alt.classList.add('dotpagemod-delete', 'clear');
		alt.textContent = 'Alt: ' + img.getAttribute('alt');
		img.parentNode.parentNode.appendChild(alt);
	}
	if (img.hasAttribute('title')) {
		let title = document.createElement('div');
		title.classList.add('dotpagemod-delete', 'clear');
		title.textContent = 'Title: ' + img.getAttribute('title');
		img.parentNode.parentNode.appendChild(title);
	}
});
