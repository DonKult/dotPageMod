forEach('picture img.lazyload[data-src]', img => img.src = img.getAttribute('data-src'));
forEach('picture source[data-srcset]', img => img.srcset = img.getAttribute('data-srcset'));
