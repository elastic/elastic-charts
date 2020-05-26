const tasks = (arr) => arr.join(' && ');

module.exports = {
  hooks: {
    'pre-commit': tasks([
      'pretty-quick',
      'yarn run lint',
    ]),
    'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS',
  },
};
