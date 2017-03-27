/* enabling JS just so I can see a posting? I don't think so… */
forEach('.hidden_elem > code', code => {
	// the content is hidden in a comment
	if (code.firstChild.nodeType === Node.COMMENT_NODE) {
		code.parentNode.classList.remove('hidden_elem');
		code.parentNode.innerHTML = code.firstChild.textContent;
		// the content comes below all the fine HTML markup…
		// just hide it instead of trying to place it inside correctly
		$('._li').style.display = 'none';
	}
});
