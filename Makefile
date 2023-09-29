export PATH := node_modules/.bin:$(PATH)
export SHELL := /usr/bin/env bash
export OS := $(shell uname -s)
export PROVIDENCE_PACKAGES := providence providence-redux

.DEFAULT_GOAL := oneshot

install_prereqs:
	@set -e
	for package in $${PROVIDENCE_PACKAGES[@]} ; do \
	  cd $$package && make install_prereqs && cd .. ; \
	done

build:  # Build all of the NPM packages
	@set -e
	for package in $${PROVIDENCE_PACKAGES[@]} ; do \
	  cd $$package && make build && cd .. ; \
	done

tarball: build
	@set -e
	for package in $${PROVIDENCE_PACKAGES[@]} ; do \
	  cd "$$package"/dist && make tarball && cd ../../ ; \
	done

oneshot: install_prereqs build

quality:
	@set -e
	for package in $${PROVIDENCE_PACKAGES[@]} ; do \
	  cd $$package && make quality && cd .. ; \
	done

test:
	@set -e
	for package in $${PROVIDENCE_PACKAGES[@]} ; do \
	  cd $$package && make test && cd .. ; \
	done

publish: install_prereqs build qa
	@set -e
	for package in $${PROVIDENCE_PACKAGES[@]} ; do \
	  cd $$package && make publish && cd .. ; \
	done

qa: quality test
