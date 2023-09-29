/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // Disabled for now, as ts-config's transpilation handling for coverage is broken
  // for our use case, and provides no info on what's wrong :(
  // https://github.com/kulshekhar/ts-jest/issues/4193
  // https://github.com/kulshekhar/ts-jest/issues/3952
  //
  // coverageThreshold: {
  //     global: {
  //         lines: 95,
  //     }
  // },
  // collectCoverageFrom: ['./src/**'],
  // collectCoverage: true,
  // coverageThreshold: {
  //   global: {
  //     lines: 95,
  //   }
  // },
  testMatch: [
    '**/**/*.spec.ts',
    '**/**/*.spec.tsx',
  ],
  testPathIgnorePatterns: [
      "./dist/.*",
  ],
  coveragePathIgnorePatterns: [
    '.*[.]spec[.]tsx',
    '.*[.]spec[.]ts',
    '.*[.]d[.]ts',
    '/specs/',
    '.*[.]js',
  ]
}
