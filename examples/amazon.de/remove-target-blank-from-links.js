// if I want pages to open in a new tab, I will open them in a new tab, thanks
forEach('a[target="_blank"]', a => a.removeAttribute('target'));
forEach('a[target="AmazonHelp"]', a => a.removeAttribute('target'));
