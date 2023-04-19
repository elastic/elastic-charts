const isDryRun = process.argv.includes('--dry-run');

/**
 * Semantic release is currently a 1:1 relationship between repo and package.
 * This is fine for our use case as we currently only publish a single package.
 * In the future if/when we publish more than one package we would need to switch
 * to another similar release framework.
 *
 * see https://github.com/semantic-release/semantic-release/issues/193
 */

module.exports = {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    'next',
    'next-major',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          { breaking: true, release: 'major' },
          { type: 'perf', release: 'patch' },
          { type: 'refactor', release: 'patch' },
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
        },
      },
    ],
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'node ./packages/charts/scripts/move_txt_files.js',
        execCwd: '.',
      },
    ],
    [
      '@semantic-release/github',
      {
        successComment: false,
        failComment: false,
      },
    ],
    [
      '@semantic-release/npm',
      {
        // must point to the child package
        pkgRoot: './packages/charts',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['./packages/charts/package.json', 'CHANGELOG.md'],
      },
    ],
    ...(isDryRun
      ? []
      : [
          [
            'semantic-release-slack-bot',
            {
              packageName: '@elastic/charts',
              notifyOnSuccess: true,
              notifyOnFail: true,
              markdownReleaseNotes: true,
            },
          ],
        ]),
  ],
};
