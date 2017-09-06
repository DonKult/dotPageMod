/* enabling JS enables a bunch of ad crap like redirections after the click and stuff… */
forIt('#preparing_download', button => {
	const link = button.parentNode.querySelector('script').textContent.match(/.*kNO = "(.*)"/)[1];
	const a = button.querySelector('a');
	a.textContent = 'Start Download';
	a.href = link;
});

