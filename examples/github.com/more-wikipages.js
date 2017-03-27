forIt('.js-wiki-more-pages-link', morewiki => {
	addEventListener(morewiki, 'click', e => {
		e.preventDefault();
		e.stopPropagation();
		morewiki.style.display = 'none';
		forEach('.wiki-more-pages', link => link.classList.remove('wiki-more-pages'));
	});
});
forEach('.js-wiki-toggle-collapse', toggle => {
	addEventListener(toggle, 'click', e => {
		e.preventDefault();
		e.stopPropagation();
		toggleStyle(toggle.parentNode.querySelector('.boxed-group-inner'), 'display', 'none', 'block');
	});
});
