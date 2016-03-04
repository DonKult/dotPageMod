/* enable the spoiler tags to work without enabling javascript */
if (window.location.pathname.startsWith('/smf/'))
	forEach('.spoilerheader', spoiler => {
		addEventListener(spoiler, 'click', () => {
			toggleStyle(spoiler.parentNode.lastChild, 'display', 'block', 'none');
		});
	});
