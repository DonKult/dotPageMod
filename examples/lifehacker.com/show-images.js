forEach('picture source[media="--small"]', source => source.parentNode.querySelector('img').src = source.getAttribute('data-srcset').split(', ')[0]);
