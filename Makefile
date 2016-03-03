xpi: README.html
	jpm xpi

README.html: README.md
	./prepare-release README

distclean clean:
	rm -f README.html
	rm -f *.xpi

