/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable jest/no-export */

import { lstatSync, readdirSync } from 'fs';
import path from 'path';

import { getStorybook, configure } from '@storybook/react';

import { Rotation } from '../packages/charts/src';
import { ThemeId } from '../storybook/use_base_theme';
// @ts-ignore - no type declarations
import { isLegacyVRTServer } from './config';

export type StoryInfo = [string, string, number];

export type StoryGroupInfo = [string, string, StoryInfo[]];

function enumerateFiles(basedir: string, dir: string) {
  let result: string[] = [];
  readdirSync(path.join(basedir, dir)).forEach((file) => {
    const relativePath = path.join(dir, file);
    const stats = lstatSync(path.join(basedir, relativePath));
    if (stats.isDirectory()) {
      result = result.concat(enumerateFiles(basedir, relativePath));
    } else if (/\.stories\.tsx$/.test(relativePath)) {
      result.push(relativePath);
    }
  });
  return result;
}

function requireAllStories(basedir: string, directory: string) {
  const absoluteDirectory = path.resolve(basedir, directory);

  const keys = enumerateFiles(absoluteDirectory, '.');
  function requireContext(key: string) {
    if (!keys.includes(key)) {
      throw new Error(`Cannot find module '${key}'`);
    }
    const fullKey = path.resolve(absoluteDirectory, key);
    return require(fullKey);
  }

  requireContext.keys = () => keys;
  return requireContext;
}

function encodeString(string: string) {
  return string
    .replace(/-/g, ' ')
    .replace(/\w-\w/g, ' ')
    .replace(/\//gi, ' ')
    .replace(/-/g, ' ')
    .replace(/[^\d\s/a-z|]+/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Stories to skip in all vrt based on group.
 */
const storiesToSkip: Record<string, Record<string, string[]>> = {
  'Test Cases': {
    storybook: ['No Series'],
    examples: ['noSeries'],
  },
};

/**
 * Delays for stories to skip in all vrt based on group.
 */
const storiesToDelay: Record<string, Record<string, number>> = {
  // GroupName: {
  //   'some story name': 200,
  // },
};

export function getStorybookInfo(): StoryGroupInfo[] {
  if (isLegacyVRTServer) {
    configure(requireAllStories(__dirname, '../stories'), module);

    return getStorybook()
      .filter(({ kind }) => kind)
      .map(({ kind: group, stories: storiesRaw }) => {
        const stories: StoryInfo[] = storiesRaw
          .filter(({ name }) => name && !storiesToSkip[group]?.storybook.includes(name))
          .map(({ name: title }) => {
            // cleans story name to match url params
            const encodedTitle = encodeString(title);
            const delay = (storiesToDelay[group] ?? {})[title];
            return [title, encodedTitle, delay];
          });

        const encodedGroup = encodeString(group);

        return [group, encodedGroup, stories] as StoryGroupInfo;
      })
      .filter(([, , stories]) => stories.length > 0);
  }
  try {
    const examples = require('./tmp/examples.json');
    return examples.map((d: any) => {
      return [
        d.groupTitle,
        d.slugifiedGroupTitle,
        d.exampleFiles
          .filter(({ name }: any) => name && !storiesToSkip[d.groupTitle]?.examples.includes(name))
          .map((example: any) => {
            return [example.name, example.slugifiedName, 0];
          }),
      ];
    });
  } catch {
    throw new Error('A required file is not available, please run yarn test:integration:generate');
  }
}

const rotationCases: [string, Rotation][] = [
  ['0', 0],
  ['90', 90],
  ['180', 180],
  ['negative 90', -90],
];

/**
 * This is a wrapper around it.each for Rotations
 * This is needed as the negative sign (-) will be excluded from the png filename
 */
export const eachRotation = {
  it(fn: (rotation: Rotation) => any, title = 'rotation - %s') {
    // eslint-disable-next-line jest/valid-title
    return it.each<[string, Rotation]>(rotationCases)(title, (_, r) => fn(r));
  },
  describe(fn: (rotation: Rotation) => any, title = 'rotation - %s') {
    return describe.each<[string, Rotation]>(rotationCases)(title, (_, r) => fn(r));
  },
};

const themeIds = Object.values(ThemeId);

/**
 * This is a wrapper around it.each for Themes
 * Returns the requried query params to trigger correct theme
 */
export const eachTheme = {
  it(fn: (theme: ThemeId, urlParam: string) => any, title = 'theme - %s') {
    // eslint-disable-next-line jest/valid-title
    return it.each<ThemeId>(themeIds)(title, (theme) => fn(theme, `globals=theme:${theme}`));
  },
  describe(fn: (theme: ThemeId, urlParam: string) => any, title = 'theme - %s') {
    return describe.each<ThemeId>(themeIds)(title, (theme) => fn(theme, `globals=theme:${theme}`));
  },
};

/* eslint-enable jest/no-export */
