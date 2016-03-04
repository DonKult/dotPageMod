/* I have uMatrix disable JavaScript, but that leads to an unusable startpage
 * as you can't page through results. They have noscript alternatives, but its
 * not used, so with this little hack we make it run. Not pretty, but it works… */
forEach('noscript', noscript => {
	let container = document.createElement("div");
	container.innerHTML = noscript.textContent;
	container.style.display = 'inline';
	const p = noscript.parentNode;
	p.insertBefore(container, noscript);
	p.removeChild(noscript);
});
