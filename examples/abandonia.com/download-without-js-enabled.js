/* extract the download URI from the text of an embedded script tag to avoid enabling them all */
forEach('script', s => {
	const arr = s.textContent.match(/window\.open\("(http:\/\/files\.abandonia\.com\/download\.php\?game=.*)"\);/);
	if (arr === null)
		return;
	window.location = arr[1];
});
