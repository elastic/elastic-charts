/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, Page } from '@playwright/test';

import { Rotation } from './constants';

interface FileExample {
  slugifiedName: string;
  name: string;
  filename: string;
  url: string;
  filePath: string;
}

type TestExamples = {
  groupFile: string;
  slugifiedGroupTitle: string;
  groupTitle: string;
  exampleFiles: FileExample[];
}[];

export interface StoryGroupInfo {
  group: string;
  encodedGroup: string;
  stories: {
    name: string;
    slugifiedName: string;
  }[];
}

/**
 * Groups to skip in all vrt.
 */
const groupsToSkip: Set<string> = new Set(['Components/Tooltip']);

/**
 * Stories to skip in all vrt based by group.
 */
const storiesToSkip: Map<string, string[]> = new Map(
  Object.entries({
    'Test Cases': ['noSeries'],
    Interactions: ['multiChartCursorSync'],
  }),
);

export function getStorybookInfo(): StoryGroupInfo[] {
  try {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const examples = require('../e2e_server/tmp/examples.json') as TestExamples;
    return examples
      .filter(
        ({ groupTitle, slugifiedGroupTitle }) =>
          !groupsToSkip.has(groupTitle) && !groupsToSkip.has(slugifiedGroupTitle),
      )
      .map<StoryGroupInfo>(({ groupTitle: group, slugifiedGroupTitle, exampleFiles }) => {
        return {
          group,
          encodedGroup: slugifiedGroupTitle,
          stories: exampleFiles
            .filter(({ name, slugifiedName }: any) => {
              const skipStoryName = name ? storiesToSkip.get(group)?.includes(name) : false;
              const skipStorySlug = slugifiedName ? storiesToSkip.get(group)?.includes(slugifiedName) : false;
              return !skipStoryName && !skipStorySlug;
            })
            .map(({ name, slugifiedName }) => ({
              name,
              slugifiedName,
            })),
        };
      });
  } catch {
    throw new Error('A required file is not available, please run yarn test:e2e:generate');
  }
}

const rotationCases: [string, Rotation][] = [
  ['0', 0],
  ['90', 90],
  ['180', 180],
  ['negative 90', -90],
];

interface EachRotationCbParams {
  page: Page;
  rotation: Rotation;
  label: string;
}

/**
 * This is a wrapper around it.each for Rotations
 * This is needed as the negative sign (-) will be excluded from the png filename
 */
export const eachRotation = {
  test(
    fn: (params: EachRotationCbParams) => any,
    titleFn: (rotationLabel: string) => string = (r) => `rotation - ${r}`,
  ) {
    // return it.each<[string, Rotation]>(rotationCases)(title, (_, r) => fn(r));
    rotationCases.forEach(([label, rotation]) => {
      test(titleFn(label), ({ page }) => fn({ page, rotation, label }));
    });
  },
  describe(
    fn: (params: Omit<EachRotationCbParams, 'page'>) => any,
    titleFn: (rotationLabel: string) => string = (r) => `rotation - ${r}`,
  ) {
    rotationCases.forEach(([label, rotation]) => {
      test.describe(titleFn(label), () => fn({ rotation, label }));
    });
  },
};

interface EachThemeCbParams {
  page: Page;
  theme: string;
  urlParam: string;
}

export const themeIds = ['light', 'dark', 'eui-light', 'eui-dark'];

/**
 * This is a wrapper around it.each for Themes
 * Returns the requried query params to trigger correct theme
 */
export const eachTheme = {
  test(fn: (params: EachThemeCbParams) => any, titleFn: (theme: string) => string = (t) => `theme - ${t}`) {
    themeIds.forEach((theme) => {
      test(titleFn(theme), ({ page }) => fn({ page, theme, urlParam: `globals=theme:${theme}` }));
    });
  },
  describe(
    fn: (params: Omit<EachThemeCbParams, 'page'>) => any,
    titleFn: (theme: string) => string = (t) => `theme - ${t}`,
  ) {
    themeIds.forEach((theme) => {
      test.describe(titleFn(theme), () => fn({ theme, urlParam: `globals=theme:${theme}` }));
    });
  },
};

/**
 * A helper class to replace `describe.each` and `it.each` from jest in playwright
 */
export const pwEach = {
  /**
   * Similar to jest's `it.each` for playwright
   */
  test<T>(values: T[]) {
    const titles = new Set();
    return (titleFn: (value: T) => string, fn: (page: Page, value: T) => Promise<any> | any) => {
      values.forEach((value) => {
        const title = titleFn(value);
        if (titles.has(title)) throw new Error('Each test within `each.test` block must have a unique title.');
        titles.add(title);
        // eslint-disable-next-line @typescript-eslint/return-await
        test(title, async ({ page }) => await fn(page, value));
      });
    };
  },
  /**
   * Similar to jest's `describe.each` for playwright
   */
  describe<T>(values: T[]) {
    const titles = new Set();
    return (titleFn: (value: T) => string, fn: (value: T) => any) => {
      values.forEach((value) => {
        const title = titleFn(value);
        if (titles.has(title)) throw new Error('Each describe within `each.describe` block must have a unique title.');
        titles.add(title);
        test.describe(title, () => fn(value));
      });
    };
  },
};
