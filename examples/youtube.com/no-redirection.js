forEach('a[data-target-new-window]', link => {
	if (link.href.startsWith("https://www.youtube.com/redirect?") === false)
		return;
	const start_newurl = link.href.indexOf('q=http');
	if (start_newurl === -1) {
		console.warn('Outgoing tracking link ', link.href, ', but can not find target URI in it');
		return;
	}
	link.href = decodeURIComponent(link.href.substr(start_newurl + 2));
});
