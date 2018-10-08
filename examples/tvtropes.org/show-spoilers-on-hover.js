/* Spoiler alone can be shown by CSS, but the links included… too much !important */
forEach('span.spoiler', s => s.removeAttribute('title'));
forEach('span.spoiler > a', a => a.setAttribute('style', 'color:#006BB1 !important'));
