'use strict';

var os = require('os');

var path = require('path');

var cache = require('@actions/cache');

var core = require('@actions/core');

var hasha = require('hasha');

var cwd = process.cwd();
var yarnFilename = path.join(cwd, 'yarn.lock');
var lockHash = hasha.fromFileSync(yarnFilename);

if (!lockHash) {
  throw new Error('could not compute hash from file "'.concat(yarnFilename, '"'));
}

core.debug('lock filename '.concat(yarnFilename));
core.debug('file hash '.concat(lockHash));
var homeDirectory = os.homedir();
var platformAndArch = ''.concat(process.platform, '-').concat(process.arch);
core.debug('platform and arch '.concat(platformAndArch));
var primaryKeySegments = [platformAndArch];
var inputPaths = [path.join(homeDirectory, '.cache', 'yarn')];
primaryKeySegments.unshift('yarn');
var now = new Date();
primaryKeySegments.push(String(now.getFullYear()), String(now.getMonth()), lockHash);
var restoreKeys = [primaryKeySegments.join('-'), primaryKeySegments.slice(0, -1).join('-')];
var primaryKey = primaryKeySegments.join('-');
cache
  .restoreCache(inputPaths, primaryKey, restoreKeys)
  .then(function (npmCacheHit) {
    console.log('npm cache hit', npmCacheHit);
    core.setOutput('cacheHit', true);
  })
  .catch(function () {
    core.setOutput('cacheHit', false);
  });
