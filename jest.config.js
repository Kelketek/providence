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
  coveragePathIgnorePatterns: [
    '.spec.tsx?',
    '/specs/',
  ]
}