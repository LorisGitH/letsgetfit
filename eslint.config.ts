import js from '@eslint/js';
import type { Linter } from 'eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Layering: `domain` is pure and depends on nothing else in `src`;
 * `storage` and `ui` may depend on `domain` only; `app` is the composition
 * root that wires everything together.
 */
const restrictImports = (
  forbidden: { group: string[]; message: string }[],
): Linter.RulesRecord => ({
  '@typescript-eslint/no-restricted-imports': [
    'error',
    {
      patterns: forbidden.map((pattern) => ({
        ...pattern,
        caseSensitive: true,
      })),
    },
  ],
});

const layer = (name: string) => [`**/${name}`, `**/${name}/**`];

export default defineConfig(
  globalIgnores(['dist', 'coverage']),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/domain/**/*.ts'],
    rules: restrictImports([
      {
        group: [...layer('ui'), ...layer('storage'), ...layer('app')],
        message:
          'Domain code must not depend on the UI, storage or app layers.',
      },
      {
        group: [
          'react',
          'react-*',
          'react/**',
          'i18next',
          'react-i18next',
          'dexie',
        ],
        message: 'Domain code must stay free of UI and storage libraries.',
      },
    ]),
  },
  {
    files: ['src/storage/**/*.ts'],
    rules: restrictImports([
      {
        group: [...layer('ui'), ...layer('app')],
        message: 'Storage code may depend on the domain layer only.',
      },
    ]),
  },
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: restrictImports([
      {
        group: [...layer('storage'), ...layer('app'), 'dexie'],
        message:
          'UI code reaches storage through domain interfaces wired in the app layer.',
      },
    ]),
  },
  prettier,
);
