/* sometimes a comic needs a little further explaination – Black Hat: "It's 'cause you're dumb." */
forEach('ul.comicNav', ul => {
	const parts = window.location.toString().split('/');
	if (parts.length !== 5 || parseInt(parts[3]) === 0)
		return;
	let li = document.createElement('li');
	let a = document.createElement('a');
	a.href = "https://www.explainxkcd.com/wiki/index.php/" + parts[3];
	a.textContent = 'Explain';
	li.classList.add('dotpagemod-delete');
	li.appendChild(a);
	ul.appendChild(li);
});
