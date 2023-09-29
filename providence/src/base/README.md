Due to limitations which prevent jest and TypeScript from playing along sanely for our use case,
this directory is to be copied to the other plugin source directories and included as part of their source.

Symlinks are insufficient-- they won't allow tests to verify full coverage. Many configurations have been tried-- but this works. Therefore, do not edit the files in this directory unless they are under the directory 'providence' in the root of the repository. They will be overwritten upon test runs and builds.
