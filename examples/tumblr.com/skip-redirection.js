/* remove the external page warning / click tracking
   Likely incomplete/broken but good enough for my minor usecase */
forEach('a[href^="http://t.umblr.com/redirect"', a => {
	a.href = decodeURIComponent(a.search.substr(1).split('&')[0].substr(2));
});
