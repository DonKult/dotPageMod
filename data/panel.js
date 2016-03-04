"use strict";
const setupButton = (id, emit) => {
	const button = document.querySelector(id);
	if (button === null)
		return;
	button.disabled = false;
	button.addEventListener('click', () => self.port.emit(emit));
};
setupButton('#browse-config', 'dotpagemod/config/browse');
setupButton('#reload-config', 'dotpagemod/config/reload');
setupButton('#restart-watcher', 'dotpagemod/config/watcher');
setupButton('#call-helpline', 'dotpagemod/config/readme');
setupButton('#show-examples', 'dotpagemod/config/examples');
