Development Guide
-----------------

Want to contribute a change to providence? You'll want to get set up for different workflows.

Getting Started
===============

To set up your environment, clone providence from the `repository`_. We highly recommend installing `NVM`_ to manage independent versions of NPM/node. If you have NVM, you can use the following commands in the repository root to get set up with the right versions:

.. code-block:: console

    nvm install
    nvm use

Providence's development tooling assumes you are running in a POSIX environment. It may work in Windows Subsystem for Linux but this has not been attempted. It has been verified to work on Mac OS X Monterey and Linux.

To install the required prerequisites, run:

.. code-block:: console

    make install_prereqs

This will install all of the basic development prerequisites for you. With these, you can develop new features for providence. Read on to learn about the different workflows you can use.

Basic Development Workflow
==========================

For most small fixes, you will want to use the basic development workflow. This allows you to develop on Providence directly, but may not give you a good view of how it behaves in a real application. For that, see :ref:`Demo Development <Development:Basic Development Workflow>`.

Once you have your prerequesites set up, you can develop freely on Providence. However, there are a handful of handy commands to know. For instance, you can use:

.. code-block:: console

    make quality

...to run a linter on the code, and:

.. code-block:: console

    make build

...to build the library. You can run:

.. code-block:: console

    make test

...to run tests. If you will be running tests over and over while debugging them, try:

.. code-block:: console

    npm run test:watch

.. note::

    The test runner that allows you to watch tests does not appear to count coverage correctly. It is not clear why. If you are working to increase coverage, use:

    .. code-block:: console

        make test

    instead and check the coverage output.

You can have the linter provide fixes for you automatically for common issues. To have the linter autocorrect your code, run:

.. code-block:: console

    npm run lint:fix

.. note::

    It is always advised to make a commit, then run the lint fixer and finally to amend the commit. If there is a bug in the fixing code, this will avoid data loss.

Demo Development
================

If you're developing a new feature on the `demo`_, or if you want to test your changes in a more realistic environment, you will want to use the demo development workflow. To install the requirements for the demo workflow run:

.. code-block:: console

    make demo_prereqs

This will pull the demo code and install its requirements. It will also warn you about commonly missing packages for your platform, so that you can install any that are missing using your favorite package manager.

Due to a limitation within NPM, and a bug in React, the only way to use a custom hook in a package is if the package has been built into a distribution tarball and installed byt NPM. To automate the process of detecting changes, building a tarball, and launching a demo development server. To start this loop, run:

.. code-block:: console

    make demo_loop

When you make a change to Providence's code, Providence will be rebuilt and installed into the demo's packages, and the demo server will be restarted. If you make a change to the demo code, the changes will hot-reload (usually) right in the browser tab!

Documentation
=============

Providence's documentation is built on `Sphinx`_, using `ReStructuredText`_. Using `sphinx-js`_ with `TypeDoc`_, we're able to catalog the interfaces of Providence while also writing guides like this one.

You'll need to install one NPM prerequisite in the global space. If you're using `NVM`_, you can avoid installing this package at the system level. Run:

.. code-block:: console

    npm install -g typedoc

If you have trouble, check the typedoc version mentioned in `package.json` and see what version is listed, and install that specific version instead. Once installed, you will need to install the documentation requirements.

.. code-block:: console

    cd docs
    make install_prereqs

Once the prerequisites are installed, you can begin a build loop with:

.. code-block:: console

    make run

This will build the documentation, monitoring for changes. It will serve the documentation locally so that you can verify your markup is working correctly.

.. note::

    Due to limitations in TypeDoc and sphinx-js, you will need to clear the `providence-demo` and `dist` directories before you will get a clean build from sphinx. Be sure these directories are empty before running the documentation server.


Testing
=======

Providence is intended to be consumed by client plugin libraries. As such, we write tests within these client libraries and test that way. In the future, we intend to write a 'dummy' backend that can validate the functionality independently of any particular plugin, and then scope the tests that way.

However, as the Redux plugin is the only one that currently exists, you will need to write tests in that repository.


.. _Sphinx: https://www.sphinx-doc.org/en/master/
.. _ReStructuredText: https://sphinx-tutorial.readthedocs.io/step-1/
.. _TypeDoc: https://typedoc.org/
.. _sphinx-js: https://pypi.org/project/sphinx-js/
.. _repository: https://gitlab.com/opencraft/dev/providence/
.. _NVM: https://github.com/nvm-sh/nvm
.. _demo: https://gitlab.com/opencraft/dev/providence-demo/
