/* github READMEs can use anchors for navigation, but sadly github prefixes the
 ids with "user-content-" to make them safe for them which prevents the navigation
 without javascript. We can do "better" */
forEach('.anchor', a => {
	if (a.id.startsWith('user-content-'))
		a.id = a.id.substr('user-content-'.length);
});
