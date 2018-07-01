forIt('#projectname', doxygen => {
	let project = doxygen.textContent.toLowerCase().trim().split(' ')[0].trim();
	if (project === 'entt') {
		for (let h of [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ]) {
			forEach(h, header => {
				header.id = header.textContent.trim().toLowerCase().replace(/ /g, '-').replace(/[^a-z-]/g, '');
			});
		}
	}
});
