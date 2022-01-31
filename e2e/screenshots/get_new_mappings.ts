import * as fs from 'fs'

interface MappingRow {
  snapshotPath: string;
  testPath: string;
  testNamePath: string[];
  testName: string;
}

interface FinalMappingRow extends MappingRow {
  newSnapshotPath: string;
  oldSnapshotPath: string;
}

const repoBasePath = '/Users/nicholaspartridge/Documents/repos/elastic-charts/';
const newBasePath = '/Users/nicholaspartridge/Documents/repos/elastic-charts/e2e/screenshots/';

const mappings = JSON.parse(fs.readFileSync('./mappings.json', { encoding: 'utf-8' })) as MappingRow[];

const replacementPaths = {
  "all.test.ts": {
    "Baseline Visual tests for all stories": "Baselines",
    "visually looks correct": '',
  },
}

const getNewPath = (testNamePath: string[], testPath: string) => {
  const baseTestPath = testPath.replace(repoBasePath + 'elastic-charts/integration/tests/', '');
  const updatedPaths = testNamePath
    .map((s) => {
      // @ts-ignore
      return replacementPaths?.[baseTestPath]?.[s] ?? s // skip '' to delete path segment
    })
    .filter((s) => s)
    .map((s) => s.replace(/\//g, '-'));

  return [
    newBasePath.replace(repoBasePath, '').slice(0, -1),
    ...updatedPaths,
  ].join('/') + '-Chrome-linux.png';
}

const newMappings = mappings.map(({ testNamePath, testPath, snapshotPath, testName }) => {
  return {
    testName,
    newSnapshotPath: getNewPath(testNamePath, testPath),
    oldSnapshotPath: snapshotPath.replace(repoBasePath, ''),
    testPath: testPath.replace(repoBasePath, ''),
    testNamePath,
  } as FinalMappingRow
})

fs.writeFileSync('./new_mappings.json', JSON.stringify(newMappings, null, 2));
