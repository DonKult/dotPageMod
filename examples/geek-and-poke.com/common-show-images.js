/* Some websites seem to prefer to load images lazily via JS for "reasons"
   I am not quite able to follow. Especially if they need giant JS libraries for it…
   Anyhow, running them on ALL is a bit overkill, so lets just share the
   code in a common file for now */
forEach('img[data-src]', i => i.src = i.getAttribute('data-src'));
forEach('img[data-lazy]', i => i.src = i.getAttribute('data-lazy'));
forEach('img[data-lazy-src]', i => i.src = i.getAttribute('data-lazy-src'));
forEach('img[data-original]', i => i.src = i.getAttribute('data-original'));
