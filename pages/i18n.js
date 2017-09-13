(function(){
const trigger = '__MSG_';
document.querySelectorAll('.i18n').forEach(tip => {
	const id = tip.textContent;
	if (id.startsWith(trigger) === false)
		return;
	tip.textContent = browser.i18n.getMessage(id.substr(trigger.length, id.length - 2 - trigger.length));
});
document.querySelectorAll('.i18n_html').forEach(tip => {
	const id = tip.textContent;
	if (id.startsWith(trigger) === false)
		return;
	tip.innerHTML = browser.i18n.getMessage(id.substr(trigger.length, id.length - 2 - trigger.length));
});
})();
