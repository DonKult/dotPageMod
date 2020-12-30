forEach('.imgur-embed-pub[data-id]', e => {
	let i = document.createElement('img');
	i.src = 'https://i.imgur.com/' + e.dataset.id + '.jpg';
	i.setAttribute('loading', 'lazy');
	i.setAttribute('importance', 'low');
	i.classList.add('dotpagemod-delete');
	e.firstChild.appendChild(i);
});
