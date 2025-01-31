#! /usr/bin/env python
# Run as part of the documentation building process, after the makefile has run
# generate_docs on each of the packages. Must set the PROVIDENCE_PACKAGES environment
# variable, and run from within the docs directory root.
from collections import defaultdict
from os import environ, walk
from pathlib import Path
from typing import List, Dict

import yaml

PACKAGES = environ['PROVIDENCE_PACKAGES'].split()

sections = {package: defaultdict(list) for package in PACKAGES}

with open('mkdocs_base.yml', 'r') as config_file:
    current_yaml = yaml.load(config_file, yaml.Loader)

nav = current_yaml['nav']

# The nav is a list of entries, so they can be ordered. The entries can be a string
# which points to a particular file (for indexes), or they can be dictionaries
# (for other entries, which may be named entries or directories).
# To build this list effectively, we'll build a parallel nav structure using directories
# as keys and the values as the dicts that will hold their contents.


reference_nav = {}
# Find the Full Reference nav entry and clear it before beginning.
full_reference_listing = list(filter(lambda x: 'Full Reference' in x, nav))[0]['Full Reference']
full_reference_listing.clear()


def traverse(d: Dict, path: List[str]):
    current = d
    for segment in path:
        current = current[segment]
    return current


for package in PACKAGES:
    docs_root = Path('.') / 'docs'
    target = docs_root / 'reference' / package
    current_package_structure = []
    full_reference_listing.append({package: current_package_structure})
    for root, dirs, files in walk(target, onerror=print):
        # Currently, typedoc's Markdown plugin only has directories one level deep,
        # so this will only end up running once per package.
        for directory in dirs:
            stem = Path(directory).stem
            listing = []
            current_package_structure.append({stem.title(): listing})
            reference_nav[(package, stem)] = listing
        if root == str(target):
            entry_list = current_package_structure
        else:
            dir_stem = Path(root).stem
            entry_list = reference_nav[(package, dir_stem)]
        for file in files:
            if not file.endswith('.md'):
                continue
            offset_path = str(Path(root) / file).replace(str(docs_root), '')[1:]
            entry_list.append({Path(file).stem.replace('_', '/'): offset_path})


for value in reference_nav.values():
    value.sort(key=lambda x: list(x.keys())[0])

with open('mkdocs.yml', 'w') as target_file:
    target_file.writelines([
        '---\n',
        '# This file is automatically generated based on mkdocs_base.yml.\n'
        '# Edit that instead.\n'
    ])
    yaml.safe_dump(current_yaml, target_file)
