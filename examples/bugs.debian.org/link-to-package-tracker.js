forIt('div.pkginfo a', pkginfo => {
	const pkgname = new URL(pkginfo.href).searchParams.get('src');
	const pts = document.createElement('a');
	pts.href = 'https://tracker.debian.org/pkg/' + pkgname;
	pts.classList.add('dotpagemod-delete');
	pts.textContent = ' [PTS]';
	pkginfo.parentNode.insertBefore(pts, pkginfo.nextSibling);
});
