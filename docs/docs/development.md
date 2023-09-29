Want to contribute a change to providence? You'll want to get set up for different workflows.

## Getting Started

To set up your environment, clone providence from the [repository]. We highly recommend installing [NVM] to manage independent versions of NPM/node. If you have NVM, you can use the following commands in the repository root to get set up with the right versions:

```console
nvm install
nvm use
```

If you do not have NVM, and are unwilling to install it, make sure you're running the latest LTS versions of node and NPM.

Providence's development tooling assumes you are running in a POSIX environment. It may work in Windows Subsystem for Linux but this has not been attempted. It has been verified to work on Mac OS X Monterey and Linux.

To install the required prerequisites, run:

```console
make install_prereqs
```

This will install all the basic development prerequisites for you. With these, you can develop new features for providence. Read on to learn about the different workflows you can use.

## Basic Development Workflow

For most small fixes, you will want to use the basic development workflow. This allows you to develop on Providence directly, but may not give you a good view of how it behaves in a real application. For that, see [Demo Development](#demo-development).

Once you have your prerequisites set up, you can develop freely on Providence. However, there are a handful of handy commands to know. For instance, you can use:

```console
make quality
```

...to run a linter on the code, and:

```console
make build
```

...to build the library. You can run:

```
make test
```

...to run the tests. Each plugin has its own testing suite, and some code within the core is only sanely testable by the plugins. You can run the tests from the perspective of a particular plugin (such as `providence-redux`) by entering its directory and running:

```
make test
```

...just like for the root of the repository.

!!! note

    The test runner that allows you to watch tests does not appear to count coverage correctly. This appears to be a known issue that is yet to be resolved upstream.

You can have the linter provide fixes for you automatically for common issues. To have the linter autocorrect your code, run:

```console
npm run lint:fix
```

!!! note

    It is always advised to make a commit, then run the lint fixer and finally to amend the commit. If there is a bug in the fixing code, this will avoid data loss.

## Demo Development

!!! note

    The demo is currently awaiting update after a large refactor of Providence's internals and these instructions are
    pending update. They will not work right now.

If you're developing a new feature on the [demo][demo], or if you want to test your changes in a more realistic environment, you will want to use the demo development workflow. To install the requirements for the demo workflow run:

```console
make demo_prereqs
```

This will pull the demo code and install its requirements. It will also warn you about commonly missing packages for your platform, so that you can install any that are missing using your favorite package manager.

Due to a limitation within NPM, and a bug in React, the only way to use a custom hook in a package is if the package has been built into a distribution tarball and installed by NPM. To automate the process of detecting changes, building a tarball, and launching a demo development server. To start this loop, run:

```console
make demo_loop
```

When you make a change to Providence's code, Providence will be rebuilt and installed into the demo's packages, and the demo server will be restarted. If you make a change to the demo code, the changes will hot-reload (usually) right in the browser tab!

## Documentation

Providence's documentation is built on [Mkdocs-Material][Mkdocs-Material]. Using [TypeDoc][TypeDoc], we're able to catalog the interfaces of Providence while also writing guides like this one.

To build the documentation, enter the docs directory, and run:

```
make install_prereqs
make build
```

This will generate automatic documentation from the library, update the configuration for mkdocs, and then build the manual. You can also run a build loop with:

```console
make run
```

This will build the documentation, monitoring for changes. It will serve the documentation locally so that you can verify your markup is working correctly. Note that it will not automatically detect changes in the code or code comments. You'll need to restart manually in that case.


Testing
=======

Providence is intended to be consumed by client plugin libraries. As such, we write tests within these client libraries and test that way. In the future, we intend to write a 'dummy' backend that can validate the functionality independently of any particular plugin, and then scope the tests that way.

However, as the Redux plugin is the only one that currently exists, you will need to write tests in that directory.


[Mkdocs-Material]: https://squidfunk.github.io/mkdocs-material/
[TypeDoc]: https://typedoc.org/
[repository]: https://gitlab.com/opencraft/dev/providence/
[NVM]: https://github.com/nvm-sh/nvm
[demo]: https://gitlab.com/opencraft/dev/providence-demo/
