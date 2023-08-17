export PATH := node_modules/.bin:$(PATH)
export SHELL := /usr/bin/env bash
export OS := $(shell uname -s)

.DEFAULT_GOAL := oneshot

install_prereqs:
	npm install -D

build:  # Build the NPM package.
	rm -rvf dist
	cp -a src dist
	cp tsconfig.json dist/
	sed -i -e '/"rootDir"/d' dist/tsconfig.json
	cd dist && npx tsc && cd ..
	rm -rvf dist/__mocks__
	find dist -depth -regex '.*/specs[/]?.*' -delete
	cp package.json ../README.md ../LICENSE dist/

tarball: build
	cd dist && npm pack

demo_prereqs: tarball
ifeq ($(OS),Linux)
	which inotifywait || (echo "Please install inotify-tools/inotifywait using whichever means your OS requires." && exit 1)
	which md5sum || (echo "Please install md5sum using whichever means your OS requires." && exit 1)
endif
ifeq ($(OS),Darwin)
	which fswatch || (echo "Please install fswatch. We'd suggest doing so using homebrew with: brew install fswatch" && exit 1)
	# Yes, coreutils provides both of these in the brew repository.
	which md5sum || (echo "Please install md5sum. We'd suggest doing so using homebrew with: brew install coreutils" && exit 1)
	(which timeout || which gtimeout) || (echo "Please install timeout. We'd suggest doing so using homebrew with: brew install coreutils" && exit 1)
endif
	git submodule init
	git submodule update
	cd providence-demo && npm install


demo_loop:
	bash -l ./force-recompile.sh

oneshot: install_prereqs build

quality:
	npm run lint

test:
	npm run test

publish: install_prereqs build qa
	cd dist && npm publish --access public

qa: quality test
