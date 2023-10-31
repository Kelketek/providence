export PATH := node_modules/.bin:$(PATH)
export SHELL := /usr/bin/env bash
export OS := $(shell uname -s)
export PROVIDENCE_VERSION := $(shell sed -nr 's/.*["]version["][ ]*:[ ]*["](.*)["].*/\1/p' ../providence/package.json)

.DEFAULT_GOAL := oneshot

install_prereqs:
	npm install -D

# Build the NPM package.
build:
	rm -rvf dist
	cp -a src dist
	cp tsconfig.json dist/
	sed -i -e '/"rootDir"/d' dist/tsconfig.json
	cd dist && npx tsc && cd ..
	rm -rvf dist/__mocks__
	find dist -depth -regex '.*/specs[/]?.*' -delete
	cp package.json ../README.md ../LICENSE dist/
	sed -i 's#file[:][.][.]/providence#'"$(PROVIDENCE_VERSION)#" dist/package.json

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

quality:
	npm run lint

demo_loop:
	bash -l ./force-recompile.sh

stage:
	rm -rf staging
	cp -a src staging
	node ../providence/test_munger.js '@opencraft/providence/base' staging/core staging
	cp -a ../providence/src/base staging/core
	# Clear any precompiled files. Compiler might skip them because of modification time.
	find staging/core -name '*.js' -delete

generate_docs: install_prereqs stage
	npx typedoc --tsconfig test-tsconfig.json

oneshot: install_prereqs build

test: stage
	npm run test

publish: install_prereqs build qa
	cd dist && npm publish --access public

qa: quality test
