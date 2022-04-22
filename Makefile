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
	cp package.json README.md LICENSE dist/

oneshot: install_prereqs build

quality:
	npm run lint

test:
	npm run test

publish: install_prereqs build qa
	cd dist && npm publish --access public

qa: quality test
