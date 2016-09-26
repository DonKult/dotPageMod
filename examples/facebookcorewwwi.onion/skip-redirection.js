/* remove the external page warning / click tracking
   Likely incomplete/broken but good enough for my minor usecase */
forEach('a[target="_blank"]', a => {
	if (a.hostname === 'www.facebook.com' || a.hostname === 'www.facebookcorewwwi.onion')
		a.href = decodeURIComponent(a.search.substr(1).split('&')[0].substr(2));
});
