# ![Logo of dotPageMod](./icon.png) dotPageMod

Firefox extension for user configuration powered
[PageMods](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/SDK/High-Level_APIs/page-mod)
to load local CSS and JavaScript into webpages.

## Features

* each hostname has its own directory in a [config
  directory](resource://dotpagemod-config/) residing in the firefox profile of
  each user
* the hostname directories itself can be stored in independent packs for easier
  sharing and syncing (e.g. private, public, work, home, …)
* additional resources (images, fonts, …) in this directory are accessible as
  usual from CSS – no need for data: or online sources
* port specific hosts with `hostname_port`
* hostnames like `mozilla.org` match `developer.mozilla.org`
* in fact: `org` matches all hosts in that top-level domain, too
* `ALL` for all hosts (on http/https) or `ALL_scheme` for all hosts on a
  specific scheme
* use `FRAMEWORK` directory to include any/all JavaScript/CSS frameworks (like
  JQuery) you might want to use in your scripts – they are automatically
  included before your scripts are sourced.
* scripts can show desktop notifications without WebAPI (see Cheatsheet)
* your JavaScript/CSS works even if the page has them blocked by a _Content
  Security Policy_ or [uMatrix](https://github.com/gorhill/uMatrix)
* your PageMods apply to the top window (not to frames) and apply to existing
  pages on (re)load
* on deactivation CSS sheets are automatically unapplied, JavaScript modifications
  can be reverted by registering an undo method
* on Linux with inotifywait (packaged in Debian in _inotify-tools_) the addon
  will reload automatically on relevant changes in the config directory
* a badge on the toolbar button indicates how many files modify the current tab.
  A list of these files can be accessed in the panel.

## (Better?) Alternatives

* [Greasemonkey](http://www.greasespot.net/) and various clones for all browsers
* [dotjs](https://github.com/defunkt/dotjs) for Chrome and
  [dotjs](https://github.com/rlr/dotjs-addon) for Firefox
* [Stylish](https://userstyles.org/)
* [uBlock Origin](https://github.com/gorhill/uBlock) with cosmetic filters

## So, why another one?

A long while ago I was using [Greasemonkey](http://www.greasespot.net/), but
just hiding a few elements with it felt very daunting with all this metadata
and editing in a browser window. I _regressed_ to using [Adblock
Plus](https://adblockplus.org/) and later [uBlock
Origin](https://github.com/gorhill/uBlock) for cosmetic filtering and more and
more to block the execution of JavaScript by default. Eventually I introduced
[uMatrix](https://github.com/gorhill/uMatrix) with a rigid block-policy to the
mix which ended up leaving uBlock mostly jobless beside a bunch of cosmetic
filters. Management of these isn't perfect through and sometimes you want more
than just `display: none` – especially now that I had all of JavaScript blocked
by default and some websites downright refuse to be usable without it (e.g.
default collapsed infoboxes). So I moved my filters to `~/.css` and started
fixing up websites in `~/.js` with [dotjs](https://github.com/rlr/dotjs-addon).
Quickly I ended up hitting issue [#27: console.log doesn't work from
dotjs](https://github.com/rlr/dotjs-addon/issues/27) which I researched and
after commenting researched even more. Set out to write a patch to have this
option set automatically I ended up changing other things as well until I
realized that the architecture as-is wasn't to my liking (using a single global
PageMod reading files dynamically and sending the content to be processed by
eval (JS) and by DOM insertion (CSS) – the later failing in the event of a
content policy forbidding inline CSS) – and I always wanted to look into
developing Firefox extensions…

So, with a "how hard can it be?" I moved on to write my own extension to resolve
my real as well as my imaginary problems by introducing new problems – not for
me (hopefully), but potentially for anyone (else) wanting to use it…

## Cheatsheet

### [path-specific CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/@document)

	@-moz-document url-prefix(http://www.w3.org/Style/) { }
	@-moz-document regex("https:.*") { }

### [path-specific JavaScript](https://developer.mozilla.org/en-US/docs/Web/API/Window/location)

	if (window.location.pathname === '/Style/')
	if (window.location.pathname.startsWith('/Style/'))

### [undo JavaScript changes](https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/page-mod#Cleaning_up_on_add-on_removal)

	self.port.on("detach", () => {});

*Note*: The example nano-framework has some wrappers and examples to undo common
changes like event handlers, style toggles and removal of added elements.

### showing desktop notifications

	self.port.emit("dotpagemod/notify", title, body, icon, data);
	self.port.on("dotpagemod/notify-clicked", data => {});

*Note*: A [notification via
WebAPI](https://developer.mozilla.org/en-US/docs/Web/API/notification) requires
the website to have permission for it, but our scripts are written by the user,
so permission is implicitly given – and independent from the permission status
of the website.

### running a hostscript

	self.port.emit("dotpagemod/run", 'script.run@1', [ '-q', window.location ] );
	self.port.on("dotpagemod/run/script.run@1/stdout", data => {});
	self.port.on("dotpagemod/run/script.run@1/stderr", data => {});
	self.port.on("dotpagemod/run/script.run@1/close", (code, signal) => {});
	self.port.on("dotpagemod/run/script.run@1/error", (code) => {});
	self.port.emit("dotpagemod/run/script.run@1/stdin/data", '');
	self.port.emit("dotpagemod/run/script.run@1/stdin/end");

*Note*: A hostscript provides you with enormous power – be very careful!
While spawning multiple instances of the same script is possible, this just
skyrockets the complexity of your content scripts, so at that point in time
you should seriously consider writing a standalone extension… – in fact,
you should consider it before writing the first line using this.

### bring tab to foreground of the window

	self.port.emit('dotpagemod/tab/activate');

### [open a new tab](https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/tabs#open%28options%29)

	window.open(url, '_blank');
	self.port.emit('dotpagemod/tab/open', url, { isPrivate, inNewWindow, inBackground, isPinned });

*Note*: The first option requires the website to have popup permissions, while
the second can have a 'confusing' new-window behavior for private tabs.
Experiment to figure out what works best for you.

## Examples

Websites like [OpenUserJS](https://openuserjs.org/), [Greasy
Fork](https://greasyfork.org/) and [UserStyles](https://userstyles.org/) can be
an inspiration of what you could possibly do with your new JS/CSS powers given
enough dedication. More (humble) examples can be easily found e.g. on github by
searching for `dotjs`.

If you are more interested in seeing an example of how this extension could be
used in practice by a user you can have a look at the [examples
folder](https://github.com/DonKult/dotPageMod/tree/master/examples).

*Note*: The examples are provided as-is, I am neither endorsing nor
recommending using any of the examples or even the websites they might apply to
even if they might have been used by me at some point in the past. No
guarantees are made that they work as intended and/or (not) eat your babies
(instead). *You have been warned*.

Website owners who find examples applying to their sites should remember that
obviously a user has cared deeply enough about the site to modify it to cater
even better to its own needs instead of moving away to a competitor before
starting a "you are experiencing it all wrong – professionals have designed
that for you!" frenzy. You might even recognize the chance to incorporate the
changes into your design for the benefit of all users (if applicable).

If you want to have a look you should start exploring with `FRAMEWORK/david.js`
as this nano framework is heavily used in the example configuration – nothing
prevents you from using heavier guns like JQuery in your own set of course.

Feel free to propose more examples in patches and pull-requests, but note that
I reserve the right to deny any proposal if I deem the example unworthy by my
sole reasoning. This explicitly includes examples whose sole purpose it is to
hide elements on a page as nobody needs to see an example of `display: none`¹
even if that is a valid usecase in practice and my own config contains plenty
of those.

¹ if you really want to see one: `ALL/antisocial.css` was made for you.

## Installation

At the moment you have to build the extension yourself to install it. Given
that I approximate the userbase to be only me, I have no plans to shuffle the
addon into the review queue as it would just waste valuable reviewer time.
That also means you have to run a Developer/Nightly edition of Firefox as it
isn't signed.

If that wasn't discouraging enough you have to install
[jpm](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm) and
[Pandoc](http://pandoc.org/) after which `make` will produce an xpi for you.

## Contributing aka Where are all the testcases?

Looking at the source it doesn't take long to figure out that the addon code
comes with no tests attached. Why is that you might ask – and you are right!
I pondered hard about this myself, but ultimately decided that the way this
addon works is too hard to test for me at this point in time given no previous
experience with addon development as a whole and that nearly all interesting
functions deal heavily with files which isn't exactly a strong suite of the SDK.
Until this will inescapably bite me (and it surely will), I will kid you and me
alike that this addon is sufficiently small to not need automatic tests…

You can treat the examples folder as well as your personal collection as a
testcase – it is what I do. So, if you happen to want to provide a patch, feel
free to implement an example for its use as well and fling it my way.

## Logo

The logo is derived from Technology Class CSS3-Styling Icon which accompanies
the official HTML5 Logo [HTML5 Logo](https://www.w3.org/html/logo/) by
[W3C](https://www.w3.org/) under the
[CC-BY-3](https://creativecommons.org/licenses/by/3.0/).

The original is black – I am coloring the 'J' in this stylised 3 in yellow
and the remaining 2 strokes in blue as JavaScript and CSS tend to be shown with
those shield colors accompanying the HTML5 icon.  They are also the colors of
the [SelfHTML](https://wiki.selfhtml.org) logo which was a happy accident
through.

Not very creative, I know, but it seemed better than using a gear or wrench…

## License

Appart from the logo, which is (also) licensed under the [Creative Commons
Attribution 3.0](https://creativecommons.org/licenses/by/3.0/) as mentioned in
the previous paragraph, the extension is MIT (Expat) licensed.

	Copyright © 2016-2017 David Kalnischkies <david@kalnischkies.de>

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
