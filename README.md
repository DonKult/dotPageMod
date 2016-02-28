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
