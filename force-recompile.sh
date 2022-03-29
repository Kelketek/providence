#!/bin/bash

# This bash script allows you to use providence-demo to debug real-world use cases with Providence.
# This is necessary because React hooks freak out if you use a local copy of a library that uses them
# instead of a prepacked version. So, we build the NPM package version, then install right from the
# generated tarball.
#
# This script could stand to be cleaned up more (or, hopefully, we can find a better way to do this)
# but it's already taken a good chunk of time to get it here, and it's good enough for now.
#
# To use this script:
#     sudo apt install inotify-tools
# Then clone the demo repo into the parent directory of the current repo:
#     cd .. && git clone https://gitlab.com/opencraft/dev/providence-demo
# Follow the directions within that repo to set it up. Then, run this script.
set -e
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
DEMO_DIR="$SCRIPT_DIR/../providence-demo/"
HASH=''

trap ctrl_c INT

function ctrl_c() {
    echo "** Cleaning up..."
    kill_script
    exit 0
}

function package_path() {
  PACKAGE_PATH=("$SCRIPT_DIR"/dist/opencraft-providence-*.tgz)
  echo "${PACKAGE_PATH[0]}"
}

function kill_script() {
  kill -9 $(pgrep -f 'react-scripts')
  sleep 1
}

PACKAGE_PATH="$(package_path)"

if [[ -f "$PACKAGE_PATH" ]]; then
  HASH=$(md5sum "$PACKAGE_PATH")
fi


cd "$DEMO_DIR"
npm run start &
inotifywait -mrq -e modify "$SCRIPT_DIR/src" | \
while read file
do
  # This will run once for every file modified. The script could probably be made more efficient,
  # but usually you're only editing one file at a time anyway.
	cd "$SCRIPT_DIR"
	make build
	cd dist
	npm pack
	PACKAGE_PATH="$(package_path)"
	NEW_HASH=$(md5sum "$PACKAGE_PATH")
	if [[ ! ("$NEW_HASH" == "$HASH") ]]; then
    cd "$DEMO_DIR"
    # NOTE: This will change package.json in the demo project. Don't commit this change!
    npm install "$PACKAGE_PATH"
    rm -rvf node_modules/.cache
    # This will, unfortunately, launch a tab window each time.
    kill_script
    npm run start &
    HASH="$NEW_HASH"
  fi
done
