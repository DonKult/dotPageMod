# dotPageMod

Firefox extension for user configuration powered
[PageMods](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/SDK/High-Level_APIs/page-mod)
to load local CSS and JavaScript into any webpages.

## Features

* each hostname has its own directory in a config directory residing in the
  firefox profile of each user
* additional resources (images, fonts, …) in this directory are accessible as
  usual from CSS – no need for data: or online sources
* port specific hosts with hostname_port
* hostnames like `mozilla.org` match `developer.mozilla.org`
* in fact: `org` matches all hosts in that top-level domain, too
* `ALL` for all hosts (on http/https) or `ALL_scheme` for all hosts on a
  specific scheme
* your JavaScript/CSS works even if the page has them blocked by a _Content
  Security Policy_ or [uMatrix](https://github.com/gorhill/uMatrix)
* your PageMods apply to the top window (not to frames) and apply to exisiting
  pages on (re)load
* on deactivation CSS sheets are automatically unapplied, JavaScript modifications
  can be reverted by registering an undo method with `self.port.on("detach", revert);`
* on Linux with inotifywait (packaged in Debian in _inotify-tools_) the addon
  will reload automatically on relevant changes in the config directory

## (Better?) Alternatives

* [Greasemonkey](http://www.greasespot.net/) and various clones for all browsers
* [dotjs](https://github.com/defunkt/dotjs) for Chrome and
  [dotjs](https://github.com/rlr/dotjs-addon) for Firefox
* [uBlock Origin](https://github.com/gorhill/uBlock) with cosmetic filters

## So, why another one?

A long while ago I was using Greasemonkey, but just hiding a few elements with
it felt very daunting with all this metadata and editing in a browser window. I
_regressed_ to using [Adblock Plus](https://adblockplus.org/) and later [uBlock
Origin](https://github.com/gorhill/uBlock) for cosmetic filtering and more and
more to block the execution of JavaScript by default. Eventually I introduced
[uMatrix](https://github.com/gorhill/uMatrix) with a rigit block-policy to the
mix which ended up leaving uBlock mostly jobless beside a bunch of cosmetic
filters. Management of these isn't perfect through and sometimes you want more
than just `display: none` – especially now that I had all of JavaScript blocked
by default and some websites downright refuse to be usable without it (e.g.
default collapsed infoboxes). So I moved my filters to ~/.css and started
fixing up websites in ~/.js with [dotjs](https://github.com/rlr/dotjs-addon).
Quickly I ended up hitting issue [#27: console.log doesn't work from
dotjs](https://github.com/rlr/dotjs-addon/issues/27) which I researched and
after commenting researched even more. Set out to write a patch to have this
option set automatically I ended up changing other things as well until I
realized that the architecture as-is wasn't to my liking (using a single global
PageMod reading files dynamically and sending the content to be processed by
eval (JS) and by DOM insertion (CSS) – the later failing in the event of a
content policy forbidding inline CSS) and I always wanted to look into
developing Firefox extensions…

So, with a "how hard can it be?" I moved on to write my own extension to resolve
my real as well as my imaginary problems by introducing new problems – not for
me (hopefully), but potentially for anyone (else) wanting to use it…

## Cheatsheet

### [path-specific CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/@document)

`@-moz-document url-prefix(http://www.w3.org/Style/) { }`
`@-moz-document regex("https:.*") { }`

### [path-specific JavaScript](https://developer.mozilla.org/en-US/docs/Web/API/Window/location)

`if (window.location.pathname === '/Style/')`
`if (window.location.pathname.startsWith('/Style/'))`

### [revert JavaScript changes](https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/page-mod#Cleaning_up_on_add-on_removal)

`self.port.on("detach", () => {});`

## Logo

The logo is derived from Technology Class CSS3-Styling Icon which accompanies
the official HTML5 Logo [HTML5 Logo](https://www.w3.org/html/logo/) by
[W3C](https://www.w3.org/) under the
[CC-BY-3](https://creativecommons.org/licenses/by/3.0/).

The original is black – I am coloring the 'J' in this stylished 3 in yellow
and the remaining 2 strokes in blue as JavaScript and CSS tend to be shown with
those shield colors accompaning the HTML5 icon.  They are also the colors of
the [SelfHTML](http://wiki.selfhtml.org) logo which was a happy accident
through.

Not very creative, I know, but it seemed better than using a gear or wrench…

## License

Appart from the logo, which is (also) licensed under the [Creative Commons
Attribution 3.0](https://creativecommons.org/licenses/by/3.0/) as mentioned in
the previous paragraph, the extension is MIT (Expat) licensed.

	Copyright © 2016 David Kalnischkies <david@kalnischkies.de>

	Permission is hereby granted, free of charge, to any person obtaining a copy of
	this software and associated documentation files (the "Software"), to deal in
	the Software without restriction, including without limitation the rights to
	use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
	of the Software, and to permit persons to whom the Software is furnished to do
	so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
