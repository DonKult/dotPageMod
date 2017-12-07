ADDON_PATH = $(shell readlink -f .)

all xpi: manifest.json README.html app/dotpagemod_app.json
	zip -X --latest-time --must-match -r dotpagemod.xpi \
		_locales background pages \
		background.js config.js icon.png manifest.json README.html LICENSE

README.html: README.md
	./prepare-release README
	touch -d '$(shell stat --format "%y" "$<")' $@

manifest.json: manifest.json.in .git
	sed -e 's#@@VERSION@@#$(shell git describe | cut -c 2-)#' < $< > $@
	touch -d '$(shell stat --format "%y" "$<")' $@

app/dotpagemod_app.json: app/dotpagemod_app.json.in
	./prepare-release app.json
	touch -d '$(shell stat --format "%y" "$<")' $@

distclean clean:
	rm -f README.html app/dotpagemod_app.json dotpagemod.xpi

install: app/dotpagemod_app.json
	mkdir -p ~/.mozilla/native-messaging-hosts
	ln -sf "$(ADDON_PATH)/app/dotpagemod_app.json" ~/.mozilla/native-messaging-hosts
