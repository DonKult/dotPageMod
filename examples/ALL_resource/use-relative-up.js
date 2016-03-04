// The "Up to higher level directory" link is an absolute file:// URI
// (as is the title "Index of file://…") which results in a security error as
// you can't access file:// from a resource:// URI. Rewriting to a relative
// link solves this cleanly and easily.
// FIXME: This should be reported & resolved upstream
forIt('#UI_goUp .up', up => {
	up.setAttribute('href', '..');
	forIt('body > h1', index => index.textContent = 'Index of ' + decodeURI(window.location));
	forIt('head > title', title => title.textContent = 'Index of ' + decodeURI(window.location));
});
