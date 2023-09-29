/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: './staging',
    // Disabled for now, as ts-config's transpilation handling for coverage is broken
    // for our use case, and provides no info on what's wrong :(
    // https://github.com/kulshekhar/ts-jest/issues/4193
    // https://github.com/kulshekhar/ts-jest/issues/3952
    // collectCoverageFrom: ['<rootDir>/**/*.tsx', '<rootDir>/**/*.ts'],
    // collectCoverage: true,
    // coverageThreshold: {
    //     global: {
    //         lines: 95,
    //     }
    // },
    roots: ['<rootDir>'],
    testMatch: [
        '**/**/*.spec.ts',
        '**/**/*.spec.tsx',
    ],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: './test-tsconfig.json',
            },
        ]
    },
    testPathIgnorePatterns: [
     './dist/.*',
     './src/.*',
    ],
    coveragePathIgnorePatterns: [
      '.*[.]spec[.]tsx',
      '.*[.]spec[.]ts',
      '.*[.]d[.]ts',
      '/specs/',
      '.*[.]js',
      '.*/dist/.*',
    ]
}
