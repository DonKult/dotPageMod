/* remove the external page warning / click tracking
   Likely incomplete/broken but good enough for my minor usecase */
forEach('a.twitter-timeline-link[target="_blank"]', a => {
	a.href = a.getAttribute('data-expanded-url');
});
