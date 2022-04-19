module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'airbnb/hooks',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:promise/recommended',
    'plugin:unicorn/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
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
    'prettier',
    'elastic-charts',
  ],
  rules: {
    /*
     * deprecated to be deleted
     */
    '@typescript-eslint/camelcase': 0, // https://github.com/typescript-eslint/typescript-eslint/issues/2077

    /*
     *****************************************
     * Rules with high processing demand
     *****************************************
     */
    'import/namespace': process.env.NODE_ENV === 'production' ? 2 : 0,

    /**
     **************************************************************
     * Rules that ensure sufficient freedom of expressing intent
     **************************************************************
     */
    'no-else-return': 'off',
    'no-param-reassign': [1, { props: false }],
    '@typescript-eslint/comma-spacing': 0,
    'unicorn/no-nested-ternary': 0,
    '@typescript-eslint/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'no-extra-parens': 'off', // it was already off by default; this line addition is just for documentation purposes
    '@typescript-eslint/restrict-template-expressions': 0, // it's OK to use numbers etc. in string templates
    'unicorn/prefer-string-slice': 'off', // substr is just as fine as it's string specific and well named

    /**
     *****************************************
     * Rules to consider adding/fixing later
     *****************************************
     */
    '@typescript-eslint/no-unsafe-assignment': 0,
    '@typescript-eslint/no-unsafe-member-access': 0,
    '@typescript-eslint/no-unsafe-return': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/restrict-plus-operands': 0, // rule is broken
    '@typescript-eslint/no-unsafe-call': 0, // seems to have issues with default import types
    '@typescript-eslint/unbound-method': 1,
    '@typescript-eslint/no-redeclare': 'off', // we use to declare enum type and object with the same name
    '@typescript-eslint/no-shadow': 'off', // we use shadow mostly within the canvas renderer function when we need a new context
    'unicorn/consistent-function-scoping': 1,
    'unicorn/explicit-length-check': 1,
    'import/no-cycle': [0, { maxDepth: 3, ignoreExternal: true }], // TODO: should error when this is fixed https://github.com/benmosher/eslint-plugin-import/issues/1453
    'no-use-before-define': 0,
    'no-restricted-properties': 0, // need to find and filter desired options
    'class-methods-use-this': 0,
    'unicorn/prefer-number-properties': 0,
    'unicorn/number-literal-case': 0, // use prettier lower case preference
    'global-require': 1,
    'import/no-dynamic-require': 1,
    'no-shadow': 1,
    'react/no-array-index-key': 1,
    'react/prefer-stateless-function': 1,
    'react/require-default-props': 'off',
    'react/display-name': 'off',
    'jsx-a11y/no-static-element-interactions': 1,
    'jsx-a11y/mouse-events-have-key-events': 1,
    'jsx-a11y/click-events-have-key-events': 1,
    '@typescript-eslint/member-ordering': 0,
    eqeqeq: 2,

    /*
     * Standard rules
     */
    '@typescript-eslint/object-curly-spacing': 0,
    'no-restricted-syntax': 0, // this is a good rule, for-of is good
    'no-console': process.env.NODE_ENV === 'production' ? 2 : 1,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 1,
    'prefer-template': 'error',
    'comma-dangle': 0,
    'consistent-return': 0,
    'no-plusplus': 0,
    'no-bitwise': 0,
    'no-void': [2, { allowAsStatement: true }],
    yoda: 0,
    'no-restricted-globals': 0,
    'no-case-declarations': 0,
    'no-return-await': 0,
    'max-classes-per-file': 0,
    'no-continue': 0,
    'no-lonely-if': 0,
    'no-return-assign': 0,
    'no-underscore-dangle': 0,
    'no-confusing-arrow': 0,
    'prefer-destructuring': 0,
    'function-paren-newline': 0,
    'implicit-arrow-linebreak': 0,
    'function-call-argument-newline': ['error', 'consistent'],
    'array-bracket-newline': ['error', 'consistent'],
    'array-element-newline': 0,
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: { multiline: true, minProperties: 10, consistent: true },
        ObjectPattern: { multiline: true, minProperties: 10, consistent: true },
        ImportDeclaration: { consistent: true },
        ExportDeclaration: { consistent: true },
      },
    ],
    semi: ['error', 'always'],
    // https://github.com/typescript-eslint/typescript-eslint/issues/1824
    // TODO: Add back once indent ts rule is fixed
    // indent: [
    //   'error',
    //   2,
    //   {
    //     SwitchCase: 1,
    //     MemberExpression: 1,
    //     offsetTernaryExpressions: true,
    //   },
    // ],
    'max-len': [
      'warn',
      {
        code: 120,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreComments: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'no-unused-vars': 0,
    'sort-keys': 0,
    'no-irregular-whitespace': 'warn',
    'no-unused-expressions': 'error',
    // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
    'no-prototype-builtins': 0,

    /*
     * @typescript-eslint plugin
     */
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/ban-types': process.env.NODE_ENV === 'production' ? 2 : 1,
    '@typescript-eslint/return-await': ['error', 'always'], // https://v8.dev/blog/fast-async
    '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/no-inferrable-types': 0,
    '@typescript-eslint/ban-ts-comment': [
      2,
      {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': 'allow-with-description',
        'ts-check': 'allow-with-description',
        minimumDescriptionLength: 3,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-use-before-define': [
      'warn',
      {
        functions: false,
        classes: true,
        variables: true,
        typedefs: false,
      },
    ],

    /*
     * import plugin
     */
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: ['builtin', 'external', 'unknown', ['parent', 'sibling', 'index', 'internal']],

        // seperates internal published packages from external packages
        pathGroups: [
          {
            pattern: '@elastic/charts',
            group: 'unknown',
          },
          {
            pattern: '@elastic/charts/**',
            group: 'unknown',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        alphabetize: { order: 'asc', caseInsensitive: true }, // todo replace with directory gradient ordering
      },
    ],
    'import/no-unresolved': ['error', { ignore: ['theme_dark.scss', 'theme_light.scss'] }],
    // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
    'import/prefer-default-export': 0,
    // Limit usage in development directories
    'import/no-extraneous-dependencies': 0,

    /*
     * react plugin
     */
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    'react/prop-types': 0,
    'react/sort-comp': 0,
    'react/jsx-one-expression-per-line': 0,
    'react/jsx-curly-newline': 0,
    'react/jsx-indent-props': 0,
    'react/jsx-max-props-per-line': 0,
    'react/jsx-first-prop-new-line': 0,
    'react/jsx-indent': 0,
    // Too restrictive: https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/destructuring-assignment.md
    'react/destructuring-assignment': 0,
    // No jsx extension: https://github.com/facebook/create-react-app/issues/87#issuecomment-234627904
    'react/jsx-filename-extension': 0,
    'react/jsx-props-no-spreading': 0,
    'react/static-property-placement': 0,
    'react/state-in-constructor': 0,
    'react/jsx-wrap-multilines': 0,

    /*
     * unicorn plugin
     */
    'unicorn/prevent-abbreviations': 0, // Common abbreviations are known and readable
    'unicorn/no-null': 0,
    'unicorn/no-fn-reference-in-iterator': 0,
    'unicorn/prefer-query-selector': 0,
    'unicorn/prefer-array-find': 0,
    'unicorn/no-for-loop': 0,
    'unicorn/no-reduce': 0,
    'unicorn/no-useless-undefined': 0,
    'unicorn/prefer-spread': 0,
    'unicorn/prefer-node-append': 0,
    'unicorn/no-zero-fractions': 0,
    'unicorn/prefer-node-remove': 0, // not IE11 compatible
    'unicorn/no-unreadable-array-destructuring': 0,
    'unicorn/filename-case': [
      'error',
      {
        case: 'snakeCase',
      },
    ],
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/prefer-dom-node-append': 'off',
    'unicorn/prefer-dom-node-remove': 'off',

    /*
     * file-header plugin
     */
    'header/header': [
      'error',
      'block',
      [
        '',
        ' * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one',
        ' * or more contributor license agreements. Licensed under the Elastic License',
        ' * 2.0 and the Server Side Public License, v 1; you may not use this file except',
        ' * in compliance with, at your election, the Elastic License 2.0 or the Server',
        ' * Side Public License, v 1.',
        ' ',
      ],
      2,
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
        moduleDirectory: ['node_modules', 'packages/charts/src/'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['packages/charts/src/**/*.{ts?(x),js}'],
      rules: {
        /*
         * Custom elastic-charts rules
         */
        'elastic-charts/no-different-release-tag': 2,
        'elastic-charts/require-release-tag': 2,
        'elastic-charts/require-tsdocs': 2,
        'elastic-charts/require-documentation': 1,

        /*
         *****************************************
         * Rules with high processing demand
         *****************************************
         */
        'import/no-restricted-paths':
          process.env.NODE_ENV === 'production'
            ? [
                'error',
                {
                  zones: [
                    {
                      target: './packages/charts/src',
                      from: './packages/charts/src/index.ts',
                    },
                    {
                      target: './packages/charts/src',
                      from: './',
                      except: ['./packages/charts/src', './node_modules', './packages/charts/node_modules'],
                    },
                  ],
                },
              ]
            : 0,

        'no-restricted-imports': [
          'error',
          {
            name: 're-reselect',
            importNames: ['default'],
            message: 'Please use `createCustomCachedSelector` instead.',
          },
        ],
        'no-underscore-dangle': 2,
        'import/no-unresolved': 'error',
        'import/no-extraneous-dependencies': 2,
        'prefer-destructuring': [
          'warn',
          {
            array: false,
            object: true,
          },
          {
            enforceForRenamedProperties: false,
          },
        ],
      },
    },
    {
      files: ['*.js', 'integration/**/*.ts?(x)'],
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
      files: ['stories/**/*.ts?(x)', 'docs/**/*.ts?(x)'],
      rules: {
        '@typescript-eslint/no-unsafe-call': 0,
        '@typescript-eslint/no-unnecessary-type-assertion': 0,
      },
    },
    {
      files: ['playground/**/*.ts?(x)'],
      rules: {
        'react/prefer-stateless-function': 0,
      },
    },
    {
      files: ['.buildkite/**/*'],
      rules: {
        'no-console': 0,
        'unicorn/no-process-exit': 0,
        'unicorn/prefer-ternary': 0,
        '@typescript-eslint/naming-convention': 0,
      },
    },
    {
      files: ['./**/@types/*.d.ts'],
      rules: {
        'unicorn/filename-case': 0,
      },
    },
    {
      files: ['*.test.ts?(x)', '**/__mocks__/**/*.ts?(x)', 'packages/charts/src/mocks/**'],
      excludedFiles: ['./e2e/**/*.test.ts'],
      extends: ['plugin:jest/recommended'],
      rules: {
        'jest/no-standalone-expect': 0, // using custom expect functions
        'jest/no-disabled-tests': 0,
        'jest/no-identical-title': 0, // does not account for <describe|it>.each
        'elastic-charts/require-release-tag': 0,
        'elastic-charts/require-tsdocs': 0,
        'elastic-charts/require-documentation': 0,
        'unicorn/error-message': 0,
        // Cannot check extraneous deps in test files with this mono setup
        // see https://github.com/benmosher/eslint-plugin-import/issues/1174
        'import/no-extraneous-dependencies': 0,
      },
    },
    {
      files: ['stories/**/*.ts?(x)', '*.test.ts?(x)'],
      rules: {
        'jsx-a11y/no-static-element-interactions': 0,
        'jsx-a11y/click-events-have-key-events': 0,
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
    {
      files: ['packages/link_kibana/**/*.js'],
      rules: {
        'no-console': 0,
        'promise/no-promise-in-callback': 0,
      },
    },
    {
      files: ['./integration/**/*.test.ts?(x)'],
      rules: {
        'jest/expect-expect': 0,
      },
    },
  ],
};
