/* 1 point for picture+source combi, -100 for using a placeholder image as only srcset entry… */
forEach('picture source[data-srcset]', source => {
	source.srcset = source.dataset['srcset'];
});
forEach('picture img.js-image', source => source.classList.remove('js-image'));
