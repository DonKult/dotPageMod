forEach('.select-menu', menu => {
	const button = menu.querySelector('.select-menu-button');
	const content = menu.querySelector('.select-menu-modal-holder');
	if (button !== null && content !== null)
		addEventListener(button, 'click', e => toggleStyle(content, 'display', 'none', 'block'));
});
