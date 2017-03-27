/* remove the external page warning / click tracking
   Likely incomplete/broken but good enough for my minor usecase */
forEach('a.twitter-timeline-link[target="_blank"]', a => {
	a.href = a.getAttribute('data-expanded-url');
});
forEach('a[rel~="me"]', a => {
	if (a.title.startsWith('http')) {
		a.href = a.title;
		delete a.title;
	}
});
