import { Linter } from 'eslint';

const config = /** @type {Linter.Config} */ ({
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: '.',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: [
        'node_modules/',
        'dist/',
        'coverage/',
        'logs/',
        'prod/',
        '.husky/',
        '.github/',
    ],
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'prettier/prettier': 'error',
    },
});

export default config;
