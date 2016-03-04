forIt('.js-wiki-more-pages-link', morewiki => {
	addEventListener(morewiki, 'click', e => {
		e.preventDefault();
		e.stopPropagation();
		morewiki.style.display = 'none';
		forEach('.wiki-more-pages', link => link.classList.remove('wiki-more-pages'));
	});
});
