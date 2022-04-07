export PATH := node_modules/.bin:$(PATH)
export SHELL := /usr/bin/env bash

.DEFAULT_GOAL := oneshot

install_prereqs:
	which inotifywait || (echo "Please install inotify-tools/inotifywait using whichever means your OS requires." && exit 1)
	npm install -D
	git submodule init
	cd providence-demo && npm install

build:  # Build the NPM package.
	rm -rvf dist
	cp -a src dist
	cp tsconfig.json dist/
	sed -i -e '/"rootDir"/d' dist/tsconfig.json
	cd dist && npx tsc && cd ..
	rm -rvf dist/__mocks__
	find dist -depth -regex '.*/specs[/]?.*' -delete
	cp package.json README.md LICENSE dist/

tarball: build
	cd dist && npm pack

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
