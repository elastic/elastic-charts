const os = require('os');
const path = require('path');

const cache = require('@actions/cache');
const core = require('@actions/core');
const hasha = require('hasha');

const cwd = process.cwd();
const yarnFilename = path.join(cwd, 'yarn.lock');
const lockHash = hasha.fromFileSync(yarnFilename);

if (!lockHash) {
  throw new Error('could not compute hash from file "'.concat(yarnFilename, '"'));
}

core.debug('lock filename '.concat(yarnFilename));
core.debug('file hash '.concat(lockHash));

const homeDirectory = os.homedir();
const platformAndArch = ''.concat(process.platform, '-').concat(process.arch);

core.debug('platform and arch '.concat(platformAndArch));

const primaryKeySegments = [platformAndArch];
const inputPaths = [path.join(homeDirectory, '.cache', 'yarn')];

primaryKeySegments.unshift('yarn');

const now = new Date();

primaryKeySegments.push(String(now.getFullYear()), String(now.getMonth()), lockHash);

const restoreKeys = [primaryKeySegments.join('-'), primaryKeySegments.slice(0, -1).join('-')];
const primaryKey = primaryKeySegments.join('-');

cache
  .restoreCache(inputPaths, primaryKey, restoreKeys)
  .then(function (npmCacheHit) {
    console.log('npm cache hit', npmCacheHit);
    core.setOutput('cacheHit', true);
  })
  .catch(function () {
    core.setOutput('cacheHit', false);
  });
