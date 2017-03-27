/* enable the spoiler tags to work without enabling javascript */
forEach('.spoilerheader', spoiler => {
	addEventListener(spoiler, 'click', () => {
		toggleStyle(spoiler.parentNode.lastChild, 'display', 'block', 'none');
	});
});
