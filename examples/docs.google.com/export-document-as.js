const trigger = '/document/d/';
if (window.location.pathname.startsWith(trigger)) {
	const id = window.location.pathname.substr(trigger.length).split('/')[0];

	let p = document.createElement('p');
	p.textContent = 'Export the document as';
	p.classList.add('dotpagemod-delete');
	[ 'pdf', 'odt', 'txt', 'png' ].forEach(format => {
		let a = document.createElement('a');
		a.href = 'https://docs.google.com/document/export?id=' + id + '&format=' + format;
		a.textContent = format;
		a.style['margin-left'] = '1em';
		p.appendChild(a);
	});
	let body = $('body');
	body.insertBefore(p, body.firstChild);
}

/* The exports are fashioned as downloads with the usual save dialog by firefox,
   but with the following code in a background script (*not* in a content script
   like this one) of an extension you can cause the default handler to step in.
   In the case of PDF you will e.g. browse the file in PDF.js instead of saving it

function dispositionInlineForGoogleDocuments(e) {
	e.responseHeaders.forEach(o => {
		if (o.name.toLowerCase() !== 'Content-Disposition'.toLowerCase())
			return;
		const trigger = 'attachment;';
		if (o.value.startsWith(trigger))
			o.value = 'inline;' + o.value.substr(trigger.length);
	});
	return {responseHeaders: e.responseHeaders};
}
browser.webRequest.onHeadersReceived.addListener(
	dispositionInlineForGoogleDocuments,
	{urls: ['https://docs.google.com/document/export?id=*'] },
	["blocking", "responseHeaders"]
);
*/
