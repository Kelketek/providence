export SHELL := /usr/bin/env bash
export PROVIDENCE_PACKAGES := providence providence-redux

default: install_prereqs includes build

upgrade:
	pip-compile requirements.in

install_prereqs:
	pip install --upgrade pip pip-tools
	pip install -r requirements.txt

includes:
	@set -e
	# Clear out old compiled docs first.
	rm -rf docs/reference
	# Recreate the directory with its .gitkeep
	git checkout docs/reference
	for package in $${PROVIDENCE_PACKAGES[@]} ; do \
	  cd ../$$package && \
	  make generate_docs && \
	  mv docs/typedoc ../docs/docs/reference/$$package && \
	  cd ../docs && \
	  rm docs/reference/$$package/README.md && \
	  rm docs/reference/$$package/modules.md ; \
	done
	python update_mkdocs_yml.py

run: includes
	mkdocs serve

build: includes
	mkdocs build
