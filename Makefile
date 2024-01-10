ADDON_PATH = $(shell readlink -f .)

all xpi: manifest.json README.html app/dotpagemod_app.json
	zip -X --latest-time --must-match -r dotpagemod.xpi \
		_locales background pages \
		background.js config.js icon.png manifest.json README.html LICENSE

README.html: README.md
	./prepare-release README
	touch -d '$(shell stat --format "%y" "$<")' $@

.gitdescribe: .git
	git describe | cut -d'-' -f 1-2 | tr '-' '.' > $@

manifest.json: manifest.json.in .gitdescribe
	sed -e 's#@@VERSION@@#$(shell cut -c 2- ".gitdescribe")#' < $< > $@
	touch -d '$(shell stat --format "%y" "$<")' $@

app/dotpagemod_app.json: app/dotpagemod_app.json.in
	./prepare-release app.json
	touch -d '$(shell stat --format "%y" "$<")' $@

distclean clean:
	rm -f README.html app/dotpagemod_app.json dotpagemod.xpi .gitdescribe

install: app/dotpagemod_app.json
	mkdir -p ~/.mozilla/native-messaging-hosts
	ln -sf "$(ADDON_PATH)/app/dotpagemod_app.json" ~/.mozilla/native-messaging-hosts

.PHONY: all xpi
