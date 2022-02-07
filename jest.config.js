/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['./src/**'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      lines: 95,
    }
  },
  testMatch: [
    '**/**/*.spec.ts',
    '**/**/*.spec.tsx',
  ],
  coveragePathIgnorePatterns: [
    '.*[.]spec[.]tsx',
    '.*[.]spec[.]ts',
    '.*[.]d[.]ts',
    '/specs/',
    '.*[.]js',
  ]
}