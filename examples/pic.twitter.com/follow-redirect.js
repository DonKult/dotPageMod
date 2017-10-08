forIt('title', t => {
	if (t.textContent.startsWith('http') === false)
		return;
	window.location = t.textContent;
});
