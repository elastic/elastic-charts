/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import * as fs from 'fs';

import * as glob from 'glob';

/*
 * This script is used to balance out all of the e2e tests across ci workers
 * given an apporoximate limit (i.e. snapshots per machine). This will also
 * shard larger files to attempt to maintain the set limit. This is driven by
 * the test suites in `e2e/tests` and the respective screenshots in `e2e/screenshots`
 * to approximate the number of screenshots per test file.
 */

const limit = 50;

interface Deploy {
  enabled: boolean;
  count: number;
  groupCount: number;
  groups: {
    id: number;
    enabled: boolean;
    tests: {
      test: string;
      count: number;
    }[];
    testString: string;
    count: number;
    shard?: {
      current: number;
      total: number;
    };
    args: string;
  }[];
}

const testPath = `${process.cwd()}/tests/**/*.test.ts`;
const tests = glob.sync(testPath);

let totalCount = 0;
const testCounts = tests.map((test) => {
  const testFileName = test.replace(`${process.cwd()}/tests/`, '');
  // test groups are independent of platforms (i.e. chrome)
  const path = `${process.cwd()}/screenshots/${testFileName}-snapshots/**/*-chrome-linux.png`;
  const files = glob.sync(path);
  totalCount += files.length;

  return {
    test: testFileName,
    count: files.length,
  };
});

const groups: Deploy['groups'] = [];
const limitRatio = 1.5;

// group tests by limit
testCounts.forEach(({ test, count }) => {
  const smGroup = groups.find(({ count: gc }) => gc + count < limit || (gc + count < limit * limitRatio && count < 10));

  if (!smGroup) {
    groups.push({
      id: 0,
      enabled: false,
      tests: [{ test, count }],
      testString: test,
      count,
      args: '',
    });
  } else {
    smGroup.count += count;
    smGroup.testString += ` ${test}`;
    smGroup.tests.push({ test, count });
  }
});

// shard large tests into multiple groups
const finalGroups = groups.reduce<Deploy['groups']>((acc, group) => {
  if (group.count > limit * limitRatio) {
    const total = Math.round(group.count / limit);
    const count = Math.round(group.count / total);

    for (let current = 1; current <= total; current++) {
      acc.push({
        ...group,
        shard: {
          current,
          total,
        },
        id: acc.length + 1,
        count,
      });
    }
  } else {
    acc.push({
      ...group,
      id: acc.length + 1,
    });
  }

  return acc;
}, []);

// Set args string
finalGroups.forEach((g) => {
  const shardStr = !g.shard ? '' : `--shard=${g.shard.current}/${g.shard.total}`;
  g.args = `${shardStr} ${g.testString}`;
});

const deploy: Deploy = {
  enabled: false,
  count: totalCount,
  groupCount: finalGroups.length,
  groups: finalGroups,
};

fs.writeFileSync('groups.json', JSON.stringify(deploy, null, 2));
