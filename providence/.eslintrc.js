module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  overrides: [
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
    }
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
  ignorePatterns: ['src/**/*.js'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
};
