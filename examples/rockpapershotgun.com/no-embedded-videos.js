forEach('.embed-wrapper', embed => {
	if (embed.firstChild === null || embed.firstChild.src === undefined)
		return;
	const uri = embed.firstChild.src.split('/');
	if (uri.length < 7)
		return;
	if (uri[6].endsWith('.js'))
		uri[6] = uri[6].substr(0, uri[6].length - '.js'.length);
	let video = '';
	let text = '';
	if (uri[5] == 'y') {
		video = 'https://youtube.com/watch/?v=' + uri[6];
		text = 'Youtube';
	}
	if (video.length === 0)
		return;
	let p = document.createElement('p');
	let a = document.createElement('a');
	a.href = video;
	a.textContent = 'Watch video on ' + text;
	a.setAttribute('referrerpolicy', 'no-referrer');
	p.appendChild(a);
	embed.parentNode.insertBefore(p, embed);
	embed.parentNode.removeChild(embed);
});
