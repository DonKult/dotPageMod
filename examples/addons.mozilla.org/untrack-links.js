forEach('a', link => {
	if (link.href.startsWith("https://outgoing.") === false)
		return;
	const start_newurl = link.href.indexOf('/http');
	if (start_newurl === -1) {
		console.warn('Outgoing tracking link ', link.href, ', but can not find target URI in it');
		return;
	}
	link.href = decodeURIComponent(link.href.substr(start_newurl + 1));
});
