/* as javascript is disabled via uMatrix, noscript isn't working, so force it */
forEach('.post-content noscript', noscript => {
	let container = document.createElement('div');
	container.innerHTML = noscript.textContent;
	const p = noscript.parentNode;
	p.insertBefore(container, noscript);
	p.removeChild(noscript);
});
// oh my…
forEach('.loading', e => e.classList.remove('loading'));
forIt('a.home-link', a => a.textContent = '⌂');
forIt('a.blog-pager-older-link', a => a.textContent = '⏴');
forIt('a.blog-pager-newer-link', a => a.textContent = '⏵');
