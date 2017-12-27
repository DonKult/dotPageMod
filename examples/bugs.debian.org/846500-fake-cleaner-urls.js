// Source: https://chris-lamb.co.uk/posts/faking-cleaner-urls-in-the-debian-bts

var m = window.location.href
  .match(/https:\/\/bugs.debian.org\/cgi-bin\/bugreport.cgi\?bug=(\d+)(#.*)?$/);
if (!m) return;

for (var x of document.getElementsByTagName("a")) {
  var href = x.getAttribute("href");
  if (href && href.match(/^[^:]+\.cgi/)) {
      // Mangle relative URIs; <base> tag does not DTRT
      x.setAttribute('href', "/cgi-bin/" + href);
  }
}

history.replaceState({}, "", "/" + m[1] + window.location.hash);
