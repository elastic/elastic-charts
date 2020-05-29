module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier/@typescript-eslint',
    'airbnb/hooks',
    'plugin:eslint-comments/recommended',
    'plugin:jest/recommended',
    'plugin:promise/recommended',
    'plugin:unicorn/recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier',
    'prettier/react',
  ],
  plugins: [
    '@typescript-eslint',
    'eslint-comments',
    'jest',
    'import',
    'promise',
    'unicorn',
    'header',
    'react-hooks',
    'jsx-a11y',
  ],
  rules: {
    /**
     * depricated to be deleted
     */
    // https://github.com/typescript-eslint/typescript-eslint/issues/2077
    '@typescript-eslint/camelcase': 0,

    /**
     * Rules to consider adding/fixing later
     */
    'import/no-cycle': 0,
    '@typescript-eslint/no-unsafe-assignment': 0,
    '@typescript-eslint/no-unsafe-member-access': 0,
    '@typescript-eslint/no-unsafe-return': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    'unicorn/prefer-number-properties': 0,

    /**
     * Standard rules
     */
    'no-console': process.env.NODE_ENV === 'production' ? 2 : 1,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 1,
    'prefer-template': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'consistent-return': 0,
    'no-plusplus': 0,
    'no-return-await': 0,
    'no-underscore-dangle': 0,
    'multiline-comment-style': ['error', 'starred-block'],
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
      },
    ],
    'unicorn/filename-case': [
      'error',
      {
        case: 'snakeCase',
      },
    ],
    'sort-keys': 0,
    'no-irregular-whitespace': 'error',
    'no-unused-expressions': 'error',
    // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
    'no-prototype-builtins': 0,

    /*
     * @typescript-eslint plugin
     */
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/return-await': ['error', 'always'], // https://v8.dev/blog/fast-async
    '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/no-inferrable-types': 0,
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-use-before-define': [
      'error',
      { functions: false, classes: true, variables: true, typedefs: true },
    ],

    /*
     * import plugin
     */
    'import/order': ['error', { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } }],
    'import/no-unresolved': 'error',
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          { target: './src', from: './src/index.ts' },
          { target: './src', from: './', except: ['./src', './node_modules/'] },
        ],
      },
    ],
    // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
    'import/prefer-default-export': 0,
    'import/no-default-export': 'error',
    // Limit usage in development directories
    'import/no-extraneous-dependencies': 0,

    /*
     * react plugin
     */
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    'react/prop-types': 0,
    // Too restrictive: https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/destructuring-assignment.md
    'react/destructuring-assignment': 0,
    // No jsx extension: https://github.com/facebook/create-react-app/issues/87#issuecomment-234627904
    'react/jsx-filename-extension': 0,

    /*
     * react-hooks plugin
     */
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    /*
     * unicorn plugin
     */
    'unicorn/prevent-abbreviations': 0, // Common abbreviations are known and readable
    'unicorn/no-null': 0,
    'unicorn/no-fn-reference-in-iterator': 0,

    /*
     * file-header plugin
     */
    'header/header': [
      'error',
      'block',
      [
        '',
        ' * Licensed to Elasticsearch B.V. under one or more contributor',
        ' * license agreements. See the NOTICE file distributed with',
        ' * this work for additional information regarding copyright',
        ' * ownership. Elasticsearch B.V. licenses this file to you under',
        ' * the Apache License, Version 2.0 (the "License"); you may',
        ' * not use this file except in compliance with the License.',
        ' * You may obtain a copy of the License at',
        ' *',
        ' * http://www.apache.org/licenses/LICENSE-2.0',
        ' *',
        ' * Unless required by applicable law or agreed to in writing,',
        ' * software distributed under the License is distributed on an',
        ' * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY',
        ' * KIND, either express or implied.  See the License for the',
        ' * specific language governing permissions and limitations',
        ' * under the License.',
        ' ',
      ],
    ],
  },
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 6,
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true,
    },
    project: './tsconfig.lint.json',
    tsconfigRootDir: __dirname,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.mjs', '.js', '.json', '.ts', '.d.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['src/**/*.{ts?(x),js}'],
      rules: {
        'prefer-destructuring': ['error', { object: true, array: false }],
        'no-underscore-dangle': 2,
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: ['**/*.test.ts'],
          },
        ],
      },
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/no-unsafe-call': 0,
        'import/no-dynamic-require': 0,
        'global-require': 0,
        'no-param-reassign': 0,
      },
    },
    {
      files: ['.*.js', './*.config.js'], // dot(.) and root config files
      rules: {
        'header/header': 0,
        'unicorn/filename-case': 0,
      },
    },
    {
      files: ['stories/**/*.ts?(x)'],
      rules: {
        'import/no-default-export': 0,
        '@typescript-eslint/no-unsafe-call': 0,
      },
    },
    {
      files: ['stories/**/*.ts?(x)', '*.test.ts?(x)'],
      rules: {
        'no-restricted-properties': [
          process.env.NODE_ENV === 'production' ? 2 : 1,
          {
            object: 'Math',
            property: 'random',
            message: 'Please use the `getRandomNumber` to create seeded random function in `stories/` and `tests/`.',
          },
          {
            object: 'describe',
            property: 'only',
            message: 'Please remove before committing changes.',
          },
          {
            object: 'it',
            property: 'only',
            message: 'Please remove before committing changes.',
          },
          {
            object: 'test',
            property: 'only',
            message: 'Please remove before committing changes.',
          },
        ],
      },
    },
  ],
};
