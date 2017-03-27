const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);
const forIt = (selector, callback) => {
	const node = document.querySelector(selector);
	if (node !== null)
		callback(node);
};
const forEach = (selector, callback) => {
	const array = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
	for (let i = 0; i < array.length; ++i)
		callback(array[i], i, array);
};
const addDetachListener = handler => {
	browser.runtime.onMessage.addListener(l => {
		if (l.cmd !== 'detach') return;
		handler();
	});
};
const addEventListener = (element, type, callback) => {
	if (element !== null) {
		addDetachListener(() => element.removeEventListener(type, callback));
		element.addEventListener(type, callback);
	}
};
const toggleStyle = (node, style, defvalue, flipvalue) => {
	if(node !== null) {
		const attrib = 'data-dotpagemod-togglestyle-' + style;
		if (node.getAttribute(attrib) === null) {
			addDetachListener(() => node.style[style] = node.getAttribute(attrib));
			node.setAttribute(attrib, defvalue);
		}
		node.style[style] = (window.getComputedStyle(node)[style] === defvalue) ? flipvalue : defvalue;
	}
};
const runOnLoad = func => {
	if (document.readyState === 'complete') {
		func();
	} else
		addEventListener(document, 'readystatechange', e => { if (document.readyState === 'complete') func(e); });
};
addDetachListener(() => forEach('.dotpagemod-delete', itm => itm.parentNode.removeChild(itm)));
