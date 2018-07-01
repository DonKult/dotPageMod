forEach('div[data-src]', div => {
	let src = div.getAttribute('data-src');
	div.removeAttribute('data-src');
	div.setAttribute("style", "background-image: url(\"" + src + "\");");
});
