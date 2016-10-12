const toggleFeature = e => {
	const more = e.target.parentNode.querySelector('.more');
	toggleStyle(more, 'display', 'none', 'block');
	toggleStyle(more, 'opacity', '0', '1');
};
forEach('section.features.list > article > header', feature => addEventListener(feature, 'click', toggleFeature));
