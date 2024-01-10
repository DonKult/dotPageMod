/* Some websites seem to prefer to load images lazily via JS for "reasons"
   I am not quite able to follow. Especially if they need giant JS libraries for it…
   Anyhow, running them on ALL is a bit overkill, so lets just share the
   code in a common file for now */
const lazyloadingSrc = datafield => i => {
	i.src = i.getAttribute(datafield);
	i.setAttribute('loading', 'lazy');
	i.setAttribute('importance', 'low');
};
const lazyloadingSrcSet = datafield => i => {
	i.setAttribute('srcset', i.getAttribute(datafield));
	i.setAttribute('loading', 'lazy');
	i.setAttribute('importance', 'low');
};
forEach('img[data-src]', lazyloadingSrc('data-src'));
forEach('img[data-srcset]', lazyloadingSrcSet('data-srcset'));
forEach('img[data-lazy]', lazyloadingSrc('data-lazy'));
forEach('img[data-lazy-src]', lazyloadingSrc('data-lazy-src'));
forEach('img[data-original]', lazyloadingSrc('data-original'));
forEach('img[data-pin-media]', lazyloadingSrc('data-pin-media'));
