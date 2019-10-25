/* You have to accept Cookies first & it needs JS … */
forEach('script.cc-onconsent-social', script => {
	const uri = script.textContent.split('\"')[1];
	let link = document.createElement('a');
	link.classList.add('dotpagemod-delete');
	link.href = uri;
	link.textContent = 'Video: ' + link.href;
	script.parentNode.insertBefore(link, script);
});
