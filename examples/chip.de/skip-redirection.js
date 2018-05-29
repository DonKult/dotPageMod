/* remove the external page warning / click tracking
   Likely incomplete/broken but good enough for my minor usecase */
forEach('a[href^="http://x.chip.de/external/link"', a => {
	const first = decodeURIComponent(a.search.substr(1).split('&')[0].substr(4));
	a.href = decodeURIComponent(first.split('&')[2].substr(4));
});
