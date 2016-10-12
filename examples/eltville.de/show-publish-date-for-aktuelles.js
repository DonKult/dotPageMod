forEach('div.inhalt > div.block > p.navigation', nav => {
	if (nav.childNodes[1].nodeType === Node.COMMENT_NODE) {
		const dt = document.createElement('time');
		dt.innerText = nav.childNodes[1].textContent;
		dt.classList.add('dotpagemod-delete');
		nav.appendChild(dt);
	}
});
