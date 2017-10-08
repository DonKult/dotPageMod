/* switch between summary and language statistics */
forIt('.js-toggle-lang-stats', langs => {
	addEventListener(langs, 'click', () => toggleStyle($('.numbers-summary'), 'display', 'table', 'none'));
});
