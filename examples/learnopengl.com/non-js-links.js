forEach('a[target="_blank"][href^="https://learnopengl.com/"]', a => {
	a.href = '/' + a.href.split('!')[1];
	a.removeAttribute('target');
});
