/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License. */

import { join, resolve } from 'path';
import { lstatSync, readdirSync } from 'fs';
import { getStorybook, configure } from '@storybook/react';

export type StoryInfo = [string, string];

export type StoryGroupInfo = [string, string, StoryInfo[]];

function requireAllStories(basedir: string, directory: string) {
  function enumerateFiles(basedir: string, dir: string) {
    let result: string[] = [];
    readdirSync(join(basedir, dir)).forEach(function(file) {
      const relativePath = join(dir, file);
      const stats = lstatSync(join(basedir, relativePath));
      if (stats.isDirectory()) {
        result = result.concat(enumerateFiles(basedir, relativePath));
      } else if (/\.stories\.tsx$/.test(relativePath)) {
        result.push(relativePath);
      }
    });
    return result;
  }
  const absoluteDirectory = resolve(basedir, directory);

  const keys = enumerateFiles(absoluteDirectory, '.');
  function requireContext(key: string) {
    if (!keys.includes(key)) {
      throw new Error(`Cannot find module '${key}'`);
    }
    const fullKey = require('path').resolve(absoluteDirectory, key);
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
    .replace(/[^a-z|A-Z|0-9|\s|\/]+/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}

export function getStorybookInfo(filters?: string[]): StoryGroupInfo[] {
  configure(requireAllStories(__dirname, '../stories'), module);
  const regexFilters =
    filters !== undefined
      ? filters.map((filter) => {
          return new RegExp(filter, 'i');
        })
      : undefined;

  const storybooks = getStorybook();

  const filteredStories: StoryGroupInfo[] = storybooks
    .filter(({ kind }) => {
      return kind && (regexFilters !== undefined ? regexFilters.findIndex((filter) => kind.match(filter)) > -1 : true);
    })
    .map(({ kind: group, stories: storiesRaw }) => {
      const stories: StoryInfo[] = storiesRaw
        .filter(({ name }) => name)
        .map(({ name: title }) => {
          // cleans story name to match url params
          const encodedTitle = encodeString(title);
          return [title, encodedTitle];
        });

      const encodedGroup = encodeString(group);

      return [group, encodedGroup, stories];
    });

  if (filteredStories.length === 0) {
    const storyGroupsNames = storybooks.map(({ kind }) => kind).join('\n');
    throw new Error(
      `Can't find any story with the provided filter: ${filters}\n
      please use one or more from the following list: \n${storyGroupsNames}`,
    );
  }

  return filteredStories;
}
