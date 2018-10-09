forIt('#comic > img', img => {
	if (img.hasAttribute('title')) {
		let title = document.createElement('div');
		title.classList.add('dotpagemod-delete');
		title.textContent = 'Title: ' + img.getAttribute('title');
		img.parentNode.appendChild(title);
	}
});
