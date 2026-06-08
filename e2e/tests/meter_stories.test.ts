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

async function expectMeterStoryToMatchScreenshot(page: Page, url: string, snapshotPath: string[]) {
  if (!environmentUrl) {
    throw new Error('ENV_URL must be provided');
  }

  await page.goto(url);

  const topLevelStory = page.locator(storySelector).first();
  const previewFrame = page.locator(previewFrameSelector).first();

  // Meter stories render directly on the e2e page, but some Storybook surfaces
  // still render inside the preview iframe. Wait for either host to mount before
  // deciding which screenshot path to use.
  await page.waitForSelector(`${storySelector}, ${previewFrameSelector}`, { state: 'attached' });

  if (await topLevelStory.count()) {
    await topLevelStory.waitFor({ state: 'visible' });
    expect(await topLevelStory.screenshot()).toMatchSnapshot(snapshotPath);
    return;
  }

  await previewFrame.waitFor({ state: 'attached' });

  const frameLocator = page.frameLocator(previewFrameSelector);
  await frameLocator.locator(storySelector).waitFor({ state: 'visible' });

  expect(await previewFrame.screenshot()).toMatchSnapshot(snapshotPath);
}

function getStoryUrl(storyPath: string, urlParam: string, extraParams: Record<string, string> = {}) {
  const url = new URL(environmentUrl!);
  url.searchParams.set('path', storyPath);
  url.searchParams.set('knob-debug', 'false');

  const [key = '', value = ''] = urlParam.split('=');
  url.searchParams.set(key, value);
  Object.entries(extraParams).forEach(([param, paramValue]) => {
    url.searchParams.set(param, paramValue);
  });

  return url.toString();
}

function getSnapshotPath(theme: string, name: string) {
  return ['meter', `${theme}-theme`, `${name}.png`];
}

test.describe('Meter', () => {
  eachTheme.describe(
    ({ urlParam, theme }) => {
      test('should render positive modes', async ({ page }) => {
        await expectMeterStoryToMatchScreenshot(
          page,
          getStoryUrl('/story/components-meter--positive-modes', urlParam),
          getSnapshotPath(theme, 'should-render-positive-modes'),
        );
      });

      test('should render signed domains', async ({ page }) => {
        await expectMeterStoryToMatchScreenshot(
          page,
          getStoryUrl('/story/components-meter--signed-domains', urlParam),
          getSnapshotPath(theme, 'should-render-signed-domains'),
        );
      });

      test('should render markers and vertical layouts', async ({ page }) => {
        await expectMeterStoryToMatchScreenshot(
          page,
          getStoryUrl('/story/components-meter--markers-and-vertical', urlParam),
          getSnapshotPath(theme, 'should-render-markers-and-vertical-layouts'),
        );
      });

      test('should render grouped signed ranges', async ({ page }) => {
        await expectMeterStoryToMatchScreenshot(
          page,
          getStoryUrl('/story/components-meter--grouped-signed-ranges', urlParam),
          getSnapshotPath(theme, 'should-render-grouped-signed-ranges'),
        );
      });

      test('should render grouped signed ranges with gradient fill', async ({ page }) => {
        await expectMeterStoryToMatchScreenshot(
          page,
          getStoryUrl('/story/components-meter--grouped-signed-ranges', urlParam, {
            fillStyle: 'gradient',
          }),
          getSnapshotPath(theme, 'should-render-grouped-signed-ranges-with-gradient-fill'),
        );
      });
    },
    (theme) => `${theme} theme`,
  );
});
