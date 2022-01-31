/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import * as fs from 'fs';

interface MappingRow {
  testName: string;
  newSnapshotPath: string;
  oldSnapshotPath: string;
  testPath: string;
  testNamePath: string[];
}

const repoBasePath = '/Users/nicholaspartridge/Documents/repos/elastic-charts/';
const mappings = JSON.parse(fs.readFileSync('./new_mappings.json', { encoding: 'utf-8' })) as MappingRow[];
const missingFiles = mappings
  .map(({ oldSnapshotPath, newSnapshotPath }) => {
    const fullOldPath = repoBasePath + oldSnapshotPath;
    if (!fs.existsSync(fullOldPath)) return oldSnapshotPath;

    const fullNewPath = repoBasePath + newSnapshotPath;
    const newDirectory = fullNewPath.split('/').slice(0, -1).join('/');

    // console.log(newDirectory);

    fs.mkdirSync(newDirectory, { recursive: true });

    fs.copyFileSync(fullOldPath, fullNewPath, fs.constants.COPYFILE_EXCL);

    return null;
  })
  .filter(Boolean);

fs.writeFileSync('./missing.json', JSON.stringify(missingFiles, null, 2));
