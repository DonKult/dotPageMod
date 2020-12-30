forEach('a-img', t => {
	let i = document.createElement('img');
	[ 'src', 'alt'].forEach(a => i.setAttribute(a, t.getAttribute(a)));
	i.setAttribute('title', t.getAttribute('alt'));
	i.setAttribute('width', '100%');
	i.setAttribute('loading', 'lazy');
	i.setAttribute('importance', 'low');
	t.parentNode.replaceChild(i, t);
});
