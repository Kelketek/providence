#!/usr/bin/env node
/*
Due to limitations in the TypeScript/Jest transpilation toolchain, we can cannot run tests using Providence as
an import while using it locally. To work around this, we copy all relevant files for testing into a staging directory
and run the tests there.

For that to work we have to do a find and replace on each relevant file, changing the import path so it no longer
imports from the package @opencraft/providence, but from a subdirectory within the staging directory. Here are a list
of (some) of the things we tried before resorting to this:

1. The paths option within tsconfig (this works for TypeScript compilation but doesn't affect Jest)
2. Using the moduleNameMapper setting within the Jest config (Even with ts-jest's helper, this fails. Not clear why--
   probably either because we're overriding an installed package by doing this, or because we're leaving the root
   directory to do our includes)
3. Symlinking the subdirectory (has all sorts of weird side effects that break things even after configuring jest to
   allow this)
4. Using a custom transformer with Jest (the TS imports run before Jest runs the transformer)
5. Using custom TypeScript AST transformers in ts-jest (the imports STILL run first!)

May God have mercy on our souls.
*/

const path = require('path')
const fs = require('fs')

const relativePathFor = (currentPath, targetPath) => {
    /* Given two directory path arrays, such as:
    // currentPath: ["","home","fox","projects","providence","providence-redux","src","specs"]
    // targetPath: ["","home","fox","projects","providence","providence-redux","src","core"]
    // ...figure out the relative path from currentPath to targetPath. Output does not contain
    // a trailing slash.
     */
    let i
    for (i = 0; i < currentPath.length; i++) {
        if (currentPath[i] !== targetPath[i]) {
            // We've hit the end of commonality between the paths.
            const backSegments = currentPath.length - i
            let backTracks = []
            for (let trackCount = 0; trackCount < backSegments; trackCount++) {
                backTracks.push('..')
            }
            const segments = targetPath.slice(i)
            return [...backTracks, ...segments].join(path.sep)
        }
    }
    // We must actually be in the parent directory already! This shouldn't happen in our case, but adding it
    // for completeness.
    return ['.', ...targetPath.slice(i)].join(path.sep)
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const modifyModulePath = (itemPath, {moduleName, targetPath}) => {
    // Finds all module imports
    fs.readFile(itemPath, {encoding: 'utf-8'}, function (err, data) {
        if (err) {
            console.log(err)
        }
        const itemPathList = itemPath.split(path.sep)
        itemPathList.pop()  // Remove filename.
        const revisedPath = relativePathFor(itemPathList, targetPath)
        const moduleSubstring = escapeRegExp(moduleName)
        data = data.replaceAll(
            RegExp(`(from)( +)(['"])(${moduleSubstring})([^'"]*)(['"])`, 'g'),
            `$1$2$3${revisedPath}$5$6`,
        )
        fs.writeFile(itemPath, data, (err) => err && console.log(err))
    })
}


// a simple walk method, based on https://dustinpfister.github.io/2018/07/20/nodejs-ways-to-walk-a-file-system/
const walk = function (dir, match, task, context) {
    // get the contents of dir
    fs.readdir(dir, (e, items) => {
        // for each item in the contents
        items.forEach((item) => {
            // get the item path
            let itemPath = path.join(dir, item);
            // get the stats of the item
            fs.stat(itemPath, (e, stats) => {
                // Use stats to find out
                // if the current item is a dir
                if (stats.isDirectory()) {
                    // if so walk that too, by calling this
                    // method recursively
                    walk(itemPath, match, task, context);
                } else {
                    if (match.test(item)) {
                        task(itemPath, context)
                    }
                }
            });
        });
    });
};

const main = () => {
    const args = process.argv.slice(2)

    const moduleName = args[0]
    const targetPathString = args[1]
    const directoryToChange = args[2]

    if (!moduleName || !targetPathString || !directoryToChange) {
        console.log(`
    Test path munger. Forcibly finds and replaces all references to a module in a set of ts(x) files
    and replaces them with references to a relative directory.
    
    usage:
        test_munger module_name new/path/to/module path/to/code/to/edit
    
    example:
        test_munger @opencraft/providence providence-redux/src/core providence-redux/src
        
    If you had a file, providence-redux/src/specs/SingleController.spec.tsx with a line like:
    
    import {FormState} from '@opencraft/providence/forms/types/FormState'
    
    ...It would change the line to:
    
    import {FormState} from '../core/forms/types/FormState'
`)
        process.exit(1)
    }

    const targetPath = path.resolve(targetPathString).split(path.sep)

    walk(path.resolve(directoryToChange), /^.+[.]tsx?$/, modifyModulePath, {moduleName, targetPath})
}

main()
