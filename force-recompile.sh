#!/bin/bash

# This bash script allows you to use providence-demo to debug real-world use cases with Providence.
# This is necessary because React hooks freak out if you use a local copy of a library that uses them
# instead of a prepacked version. So, we build the NPM package version, then install right from the
# generated tarball.
#
# This script could stand to be cleaned up more (or, hopefully, we can find a better way to do this)
# but it's already taken a good chunk of time to get it here, and it's good enough for now.
#
# To use this script, build the initial tarball and install the demo prereqs:
#	    make demo_prereqs
# Then, to monitor for changes while running the demo code and installing updates:
#     make demo_loop
# If you end up interrupting the loop before a new tarball is built, you can force the rebuilding of
# the tarball with:
#     make tarball
set -e
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
DEMO_DIR="$SCRIPT_DIR/providence-demo/"
OS="$(uname -s)"
HASH=''
source ~/.nvm/nvm.sh
if (which gtimeout); then
  alias timeout=gtimeout
fi

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

function watch_changes() {
  if [[ "$OS" == "Linux" ]]; then
    inotifywait -rqm -e modify -e create -e close_write "$SCRIPT_DIR/src"
  fi
  if [[ "$OS" == "Darwin" ]]; then
    fswatch "$SCRIPT_DIR/src"
  fi
}

PACKAGE_PATH="$(package_path)"

if [[ -f "$PACKAGE_PATH" ]]; then
  HASH=$(md5sum "$PACKAGE_PATH")
fi


cd "$DEMO_DIR"
npm install "$PACKAGE_PATH"
npm run start &
watch_changes | \
while read file
do
  # Eat away several changes done in one go.
  echo "Skipping $(timeout 1 cat | wc -l) further changes"
  cd "$SCRIPT_DIR"
  make tarball
  PACKAGE_PATH="$(package_path)"
  NEW_HASH=$(md5sum "$PACKAGE_PATH")
  if [[ ! ("$NEW_HASH" == "$HASH") ]]; then
    cd "$DEMO_DIR"
    # NOTE: This will change package.json in the demo project. Don't commit this change!
    npm install --no-save "$PACKAGE_PATH"
    rm -rvf node_modules/.cache
    # This will, unfortunately, launch a tab window each time.
    kill_script
    npm run start &
    HASH="$NEW_HASH"
  fi
done
