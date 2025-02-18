import js from '@eslint/js';
import * as parser from "@typescript-eslint/parser";
import typescript from '@typescript-eslint/eslint-plugin';

export default [
    {
        ignores: [
            '.cache/**',
            '.git/**',
            'node_modules/**',
            'public/**',
            'build/**'
        ]
    },
    {
        files: ['*.ts', '*.tsx'],
        languageOptions: {
            parser: parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: './tsconfig.json'
            }
        },
        plugins: {
            '@typescript-eslint': typescript
        },
        rules: {
            ...js.configs.recommended.rules,
            ...typescript.configs.recommended.rules,
            'no-console': 'error',
        }
    }
];
