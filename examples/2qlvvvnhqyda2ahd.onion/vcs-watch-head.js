forEach('div#action-needed-list a', a => {
	// projects without releases can use git HEAD as release,
	// but the links produced for that are invalid
	if (a.href.endsWith('%20HEAD'))
		a.href = a.href.substr(0, a.href.length - 7);
});
