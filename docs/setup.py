# Dummy setup.py so we can invoke npm install on readthedocs.
import os

from setuptools import setup
from pathlib import Path

current = Path(__file__).parent
root = current / '..'
os.chdir(root)
os.system('npm install')
# This will need to be updated when typedoc is updated.
os.system('npm install -g typedoc@0.22.11')
os.chdir(current)

setup(
    name='providence-docs',
    version='0.0.1',
    packages=['dummy'],
    install_requires=[],
)
