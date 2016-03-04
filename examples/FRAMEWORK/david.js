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
const addEventListener = (element, type, callback) => {
	if (element !== null) {
		self.port.on("detach", () => element.removeEventListener(type, callback));
		element.addEventListener(type, callback);
	}
};
const toggleStyle = (node, style, defvalue, flipvalue) => {
	if(node !== null) {
		self.port.on("detach", () => node.style[style] = defvalue);
		node.style[style] = (window.getComputedStyle(node)[style] === defvalue) ? flipvalue : defvalue;
	}
};
