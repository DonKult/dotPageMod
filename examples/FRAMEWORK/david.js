(function(obj) {
	"use strict";
	obj.$ = selector => document.querySelector(selector);
	obj.$$ = selector => document.querySelectorAll(selector);
	obj.forIt = (selector, callback) => {
		const node = typeof selector === 'string' ? document.querySelector(selector) : selector;
		if (node !== null)
			callback(node);
	};
	obj.forEach = (selector, callback) => {
		const array = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
		for (let i = 0; i < array.length; ++i)
			callback(array[i], i, array);
	};
	obj.addDetachListener = handler => {
		browser.runtime.onMessage.addListener(l => {
			if (l.cmd !== 'detach') return;
			handler();
		});
	};
	obj.addEventListener = (element, type, callback) => {
		if (element !== null) {
			obj.addDetachListener(() => element.removeEventListener(type, callback));
			element.addEventListener(type, callback);
		}
	};
	obj.toggleStyle = (node, style, defvalue, flipvalue) => {
		if(node !== null) {
			const attrib = 'data-dotpagemod-togglestyle-' + style;
			if (node.getAttribute(attrib) === null) {
				obj.addDetachListener(() => node.style[style] = node.getAttribute(attrib));
				node.setAttribute(attrib, defvalue);
			}
			node.style[style] = (window.getComputedStyle(node)[style] === defvalue) ? flipvalue : defvalue;
		}
	};
	obj.runOnLoad = func => {
		if (document.readyState === 'complete') {
			func();
		} else
			obj.addEventListener(document, 'readystatechange', e => { if (document.readyState === 'complete') func(e); });
	};
	obj.addDetachListener(() => forEach('.dotpagemod-delete', itm => itm.parentNode.removeChild(itm)));
})(window);
