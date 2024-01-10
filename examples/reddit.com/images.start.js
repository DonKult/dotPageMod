// try tagging the gallery images for lazy loading
function mutationMatch(node, selector, mutate) {
	if (node.matches(selector)) {
		mutate(node);
		return true;
	}
	if (node.firstElementChild) {
		let modified = false;
		for (const el of node.querySelectorAll(selector)) {
			modified = true;
			mutate(el);
		}
		return modified;
	}
	return false;
}
function mutateLowerPrio(node) {
	node.setAttribute('loading', 'lazy');
	node.setAttribute('importance', 'low');
}
function onMutation(mutations) {
	for (const {addedNodes} of mutations) {
		for (const n of addedNodes) {
			if (n.tagName) {
				mutationMatch(n, 'img.preview', mutateLowerPrio);
			}
		}
	}
}

const mo = new MutationObserver(onMutation);
mo.observe(document, {
	subtree: true,
	childList: true,
});
onMutation([{addedNodes: [document.documentElement]}]);
