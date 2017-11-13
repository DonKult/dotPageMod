/* remove the external page warning / click tracking
   Likely incomplete/broken but good enough for my minor usecase */
forEach('a[target]', a => {
	if (a.href.indexOf('/linkfilter/') !== -1)
		a.href = decodeURIComponent(a.search.substr(5));
});
