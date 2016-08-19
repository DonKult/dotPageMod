#!/bin/sh
if [ -z "$2" ]; then
	exit 1
fi
FILE="$(echo "$2" | cut -d'/' -f 4- )"

case "$1" in
edit)
	exec x-terminal-emulator -e sensible-editor "$FILE";;
rm)
	if test -e "$FILE"; then
		exec rm "$FILE"
	else
		exit 1
	fi
	;;
rmdir)
	if test -d "$FILE"; then
		exec rm -r "$FILE"
	else
		exit 1
	fi
	;;
mkdir)
	if test -d "$FILE"; then
		exit 1
	else
		exec mkdir "$FILE"
	fi
	;;
*)
	exit 2
esac
