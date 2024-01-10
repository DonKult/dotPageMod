/* 1 point for picture+source combi, -100 for using a placeholder image as first alternative… */
forEach('picture source[srcset]', source => {
	source.srcset = source.srcset.replace('/resources/images/placeholder.png 8w,','');
});
