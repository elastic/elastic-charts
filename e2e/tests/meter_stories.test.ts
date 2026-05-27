/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { environmentUrl } from '../e2e_config';
import { eachTheme } from '../helpers';

const storySelector = '[data-test-subj="echMeterStory"]';
const previewFrameSelector = 'iframe[title="storybook-preview-iframe"]';

async function expectMeterStoryToMatchScreenshot(page: Page, url: string) {
  if (!environmentUrl) {
    throw new Error('ENV_URL must be provided');
  }

  await page.goto(url);

  const topLevelStory = page.locator(storySelector);
  if (await topLevelStory.count()) {
    await topLevelStory.first().waitFor({ state: 'visible' });
    expect(await topLevelStory.first().screenshot()).toMatchSnapshot();
    return;
  }

  const previewFrame = page.locator(previewFrameSelector);
  await previewFrame.waitFor({ state: 'attached' });

  const frameLocator = page.frameLocator(previewFrameSelector);
  await frameLocator.locator(storySelector).waitFor({ state: 'visible' });

  expect(await previewFrame.screenshot()).toMatchSnapshot();
}

function getStoryUrl(storyPath: string, urlParam: string) {
  const url = new URL(environmentUrl!);
  url.searchParams.set('path', storyPath);
  url.searchParams.set('knob-debug', 'false');

  const [key = '', value = ''] = urlParam.split('=');
  url.searchParams.set(key, value);

  return url.toString();
}

test.describe('Meter stories', () => {
  eachTheme.describe(({ urlParam }) => {
    test('should render positive modes', async ({ page }) => {
      await expectMeterStoryToMatchScreenshot(page, getStoryUrl('/story/components-meter--positive-modes', urlParam));
    });

    test('should render signed domains', async ({ page }) => {
      await expectMeterStoryToMatchScreenshot(page, getStoryUrl('/story/components-meter--signed-domains', urlParam));
    });

    test('should render markers and vertical layouts', async ({ page }) => {
      await expectMeterStoryToMatchScreenshot(
        page,
        getStoryUrl('/story/components-meter--markers-and-vertical', urlParam),
      );
    });

    test('should render grouped signed ranges', async ({ page }) => {
      await expectMeterStoryToMatchScreenshot(
        page,
        getStoryUrl('/story/components-meter--grouped-signed-ranges', urlParam),
      );
    });
  });
});
