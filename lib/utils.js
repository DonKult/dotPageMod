"use strict";
/* converts a hostname (= directory) to an include-pattern for pageMod:
   - ALL matches all hostnames on http and https
   - ALL_scheme matches all 'hostnames' on the given scheme (like ftp)
   - hostname_80 matches hostnames on http and https over port 80
   - hostname matches hostnames on http and https over all ports

   A hostname doesn't need to be complete: Omitting subdomains causes the
   pageMod to be attached to the hostname itself as well as all subdomains on
   this host. 'mozilla.org' matches therefore also 'developer.mozilla.org' and
   'org' subsumes all domains with in org-toplevel under it. */
exports.hostname2include = (hostname) => {
	if (hostname === 'ALL')
		return new RegExp('^https?:.*$');
	else if (hostname.startsWith('ALL_') === true)
		return hostname.substr(4) + '://*';

	const hostname_escaped = hostname.replace(/_/g, ':').replace(/\./g, '\\.');
	return new RegExp('^https?:\/\/(.*\.)?' + hostname_escaped + '(:[0-9]+)?\/.*$');
};
