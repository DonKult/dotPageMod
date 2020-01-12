// pick the medium image for display
forEach('.progressiveLoading__image[data-interchange]', i => i.src = i.dataset.interchange.split('], ').map(a => a.split(', '))[1][0].substr(1));
forEach('.progressiveLoading__image[data-src]', i => i.src = i.dataset.src);
