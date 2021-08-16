/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const fs = require('fs');

console.log('Copying text files to package destination folder...');

fs.copyFileSync('README.md', './packages/charts/README.md');
fs.copyFileSync('LICENSE.txt', './packages/charts/LICENSE.txt');
fs.copyFileSync('NOTICE.txt', './packages/charts/NOTICE.txt');
fs.copyFileSync('CHANGELOG.md', './packages/charts/CHANGELOG.md');

console.log('Done!');
