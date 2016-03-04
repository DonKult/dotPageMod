/* switch between summary and language statistics */
forIt('.js-toggle-lang-stats', langs => {
	forIt('.numbers-summary', numbers => {
		addEventListener(langs, 'click', () => toggleStyle(numbers, 'display', 'table', 'none'));
	});
	forIt('.repository-lang-stats', stats => {
		addEventListener(stats, 'click', () => numbers.style.display = 'table');
	});
});
