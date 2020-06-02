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
 * under the License.
 */

import { getStorybookInfo } from '../helpers';
import { common } from '../page_objects';

// mock required for importing trick, otherwise .scss files will throw an error
jest.mock('../../.storybook/theme_service.ts', () => ({
  switchTheme: () => undefined,
}));

const storyGroups = getStorybookInfo();

describe('Baseline Visual tests for all stories', () => {
  describe.each(storyGroups)('%s', (_group, encodedGroup, stories) => {
    describe.each(stories)('%s', (_title, encodedTitle) => {
      it('visually looks correct', async() => {
        const url = `http://localhost:9001?id=${encodedGroup}--${encodedTitle}`;
        await common.expectChartAtUrlToMatchScreenshot(url);
      });
    });
  });
});
