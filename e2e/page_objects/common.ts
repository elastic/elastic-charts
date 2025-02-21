/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable no-console */

import { URL } from 'url';

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { paramCase } from 'change-case';

import { environmentUrl } from '../e2e_config';

// TODO determine if this is still necessary
const DRAG_DETECTION_TIMEOUT = 100; // the minimum amount of time to consider for for dragging purposes

interface MousePosition {
  /**
   * position from top of reference element, trumps bottom
   */
  top?: number;
  /**
   * position from right of reference element
   */
  right?: number;
  /**
   * position from bottom of reference element
   */
  bottom?: number;
  /**
   * position from left of reference element, trump right
   */
  left?: number;
}

interface ElementBBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

type KeyboardKey = {
  key: string;
  count: number;
};

interface ClickOptions {
  /**
   * Defaults to `left`.
   */
  button?: 'left' | 'right' | 'middle';

  /**
   * defaults to 1. See [UIEvent.detail].
   */
  clickCount?: number;

  /**
   * Time to wait between `mousedown` and `mouseup` in milliseconds. Defaults to 0.
   */
  delay?: number;

  /**
   * Whether to skip or wait for click delay. Skipping allows capturing of long press actions.
   *
   * Defaults to false
   */
  waitForDelay?: boolean;
}

type KeyboardKeys = Array<KeyboardKey>;

/**
 * Used to get position from any value of cursor position
 *
 * @param mousePosition
 * @param element
 */
function getCursorPosition(
  { top, right, bottom, left }: MousePosition,
  element: ElementBBox,
): { x: number; y: number } {
  let x = element.left;
  let y = element.top;

  if (top !== undefined || bottom !== undefined) {
    y = top !== undefined ? element.top + top : element.top + element.height - bottom!;
  }

  if (left !== undefined || right !== undefined) {
    x = left !== undefined ? element.left + left : element.left + element.width - right!;
  }

  return { x, y };
}

interface ScreenshotDOMElementOptions {
  padding?: number;
  /**
   * Screenshot selector override. Used to select beyond set element.
   */
  hiddenSelectors?: string[];
  /**
   * An acceptable ratio of pixels that are different to the total amount of pixels, between `0` and `1`. Default is
   * configurable with `TestConfig.expect`. Unset by default.
   */
  maxDiffPixelRatio?: number;

  /**
   * An acceptable amount of pixels that could be different. Default is configurable with `TestConfig.expect`. Unset by
   * default.
   */
  maxDiffPixels?: number;

  /**
   * An acceptable perceived color difference in the [YIQ color space](https://en.wikipedia.org/wiki/YIQ) between the same
   * pixel in compared images, between zero (strict) and one (lax), default is configurable with `TestConfig.expect`.
   * Defaults to `0.2`.
   */
  threshold?: number;
}

type ScreenshotElementAtUrlOptions = ScreenshotDOMElementOptions & {
  /**
   * timeout for waiting on element to appear in DOM
   *
   * @defaultValue 10000
   */
  timeout?: number;
  /**
   * any desired action to be performed after loading url, prior to screenshot
   */
  action?: () => void | Promise<void>;
  /**
   * Selector used to wait on DOM element
   */
  waitSelector?: string;
  /**
   * Delay to take screenshot after element is visible
   */
  delay?: number;
  /**
   * Screenshot selector override. Used to select beyond set element.
   */
  screenshotSelector?: string;
  /**
   * Path to save screenshot comparisons when calling `toMatchSnapshot`.
   * Defaults to auto-generated path using test info.
   */
  screenshotPath?: string | string[];
};

export class CommonPage {
  readonly chartWaitSelector = '.echChartStatus[data-ech-render-complete=true]';

  readonly chartSelector = '.echChart';

  /**
   * Parse storybook url to e2e storybook url given config parameters
   * @param url
   */
  static parseUrl(url: string): string {
    if (!environmentUrl) throw new Error(`ENV_URL must be provideded`);

    const { searchParams: testParams } = new URL(url);
    const id = testParams.get('id');
    const path = testParams.get('path');

    if (!id && !path) throw new Error('No chart path or id was provided in url');

    const envUrl = new URL(environmentUrl);
    testParams.forEach((v, k) => envUrl.searchParams.append(k, v));
    envUrl.searchParams.delete('id');
    envUrl.searchParams.set('path', path ?? `/story/${id}`);
    envUrl.searchParams.append('knob-debug', 'false');

    return envUrl.toString();
  }

  static validatePath(path: string | string[]): string | string[] {
    const fileName = Array.isArray(path) ? path.at(-1) : path;
    if (fileName && /\.png$/.test(fileName)) return path;
    throw new Error(`Screenshot path or last path segment must contain the .png file extension.`);
  }

  /**
   * Get url path from test info
   *
   * Applies the following mutations to test path segments in order:
   *  - Changes case to dash-case
   *  - Replaces `/` with a dash
   *  - Replaces spaces with a dash
   *  - Replaces more than one dash with single dash
   *  - Lowercase all remaining uppercase characters
   *
   * @param url
   */
  static getPathFromTestInfo(path?: string | string[]): string | string[] {
    if (path) return CommonPage.validatePath(path);
    const info = test.info();
    const options = { splitRegexp: /([a-z])([\dA-Z])/g };
    const formattedSegments = info.titlePath
      .slice(1)
      .map((s) =>
        paramCase(s, options).replaceAll('/', '-').replaceAll(/\s/g, '-').replaceAll(/-+/g, '-').toLowerCase(),
      );

    return [
      // New directory for each test.describe block
      ...formattedSegments.slice(0, -1),
      `${formattedSegments.at(-1)}.png`,
    ];
  }

  getModifierKey = (page: Page) => async () => {
    const isMac = await page.evaluate(() => {
      return navigator.userAgent.includes('Mac');
    });
    return isMac ? 'Meta' : 'Control';
  };

  /**
   * Toggle element visibility
   * @param selector
   */
  toggleElementVisibility = (page: Page) => async (selector: string) => {
    await page.$$eval(selector, (elements) => {
      elements.forEach((element) => {
        element.classList.toggle('echInvisible');
      });
    });
  };

  /**
   * Get getBoundingClientRect of selected element
   *
   * @param selector
   */
  getBoundingClientRect = (page: Page) => async (selector: string) => {
    return await page.$eval(selector, (element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { left: x, top: y, width, height, id: element.id };
    });
  };

  /**
   * Capture screenshot Buffer of selected element only
   *
   * @param selector
   * @param options
   */
  screenshotDOMElement =
    (page: Page) =>
    async (selector: string, options?: ScreenshotDOMElementOptions): Promise<Buffer> => {
      const padding = options?.padding ? options.padding : 0;
      const rect = await this.getBoundingClientRect(page)(selector);

      if (options?.hiddenSelectors) {
        await Promise.all(options.hiddenSelectors.map(this.toggleElementVisibility(page)));
      }

      const buffer = await page.screenshot({
        animations: 'disabled',
        clip: {
          x: rect.left - padding,
          y: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        },
      });

      if (options?.hiddenSelectors) {
        await Promise.all(options.hiddenSelectors.map(this.toggleElementVisibility(page)));
      }

      return buffer;
    };

  /**
   * Move mouse
   * @param mousePosition
   * @param selector
   */
  moveMouse = (page: Page) => async (x: number, y: number) => {
    await page.mouse.move(x, y);
  };

  /**
   * Move mouse relative to element
   *
   * @param mousePosition
   * @param selector
   */
  moveMouseRelativeToDOMElement = (page: Page) => async (mousePosition: MousePosition, selector: string) => {
    const element = await this.getBoundingClientRect(page)(selector);
    const { x, y } = getCursorPosition(mousePosition, element);
    await this.moveMouse(page)(x, y);
  };

  /**
   * Click mouse relative to element
   *
   * @param mousePosition
   * @param selector
   */
  clickMouseRelativeToDOMElement =
    (page: Page) => async (mousePosition: MousePosition, selector: string, options?: ClickOptions) => {
      const element = await this.getBoundingClientRect(page)(selector);
      const { x, y } = getCursorPosition(mousePosition, element);

      if (options?.delay && !options?.waitForDelay) {
        // TODO: revisit this - see https://github.com/microsoft/playwright/issues/28956
        // Here we need to avoid using `page.mouse.click` because it will wait for the delay to expire before resolving
        // Note: This never triggers `mouseup` action but seems to be an edge case at this point. Calling in SetTimeout fails.
        await page.mouse.move(x, y);
        await page.mouse.down(options);
      } else {
        await page.mouse.click(x, y, options);
      }
    };

  /**
   * Drag mouse relative to element
   *
   * @param mousePosition
   * @param selector
   */
  dragMouseRelativeToDOMElement =
    (page: Page) => async (start: MousePosition, end: MousePosition, selector: string) => {
      const element = await this.getBoundingClientRect(page)(selector);
      const { x: x0, y: y0 } = getCursorPosition(start, element);
      const { x: x1, y: y1 } = getCursorPosition(end, element);
      await this.moveMouse(page)(x0, y0);
      await page.mouse.down();
      await page.waitForTimeout(DRAG_DETECTION_TIMEOUT);
      await this.moveMouse(page)(x1, y1);
    };

  /**
   * Drop mouse
   *
   * @param mousePosition
   * @param selector
   */
  dropMouse = (page: Page) => async () => {
    await page.mouse.up();
  };

  /**
   * Press keyboard keys
   * @param count
   * @param key
   */
  // eslint-disable-next-line class-methods-use-this
  pressKey = (page: Page) => async (key: string, count: number) => {
    // capitalize some keys
    const keyName = ['tab', 'enter'].includes(key) ? `${key.charAt(0).toUpperCase()}${key.slice(1)}` : key;
    let i = 0;
    while (i < count) {
      await page.keyboard.press(keyName);
      i++;
    }
  };

  /**
   * Drag and drop mouse relative to element
   *
   * @param mousePosition
   * @param selector
   */
  dragAndDropMouseRelativeToDOMElement =
    (page: Page) => async (start: MousePosition, end: MousePosition, selector: string) => {
      await this.dragMouseRelativeToDOMElement(page)(start, end, selector);
      await this.dropMouse(page)();
    };

  count = 0;

  /**
   * Expect an element given a url and selector from storybook
   *
   * - Note: No need to fix host or port. They will be set automatically.
   *
   * @param url Storybook url from knobs section
   * @param selector selector of element to screenshot
   * @param options
   */
  expectElementAtUrlToMatchScreenshot =
    (page: Page) =>
    async (url: string, selector: string = 'body', options?: ScreenshotElementAtUrlOptions) => {
      const screenshotPath = CommonPage.getPathFromTestInfo(options?.screenshotPath);
      const success = await this.loadElementFromURL(page)(url, options?.waitSelector ?? selector, options?.timeout);

      expect(success).toBe(true);

      if (options?.action) {
        await options.action();

        if (options.waitSelector) {
          // check waitSelector again after any actions
          await this.waitForElement(page)(options.waitSelector, options.timeout);
        }
      }

      if (options?.delay) {
        await page.waitForTimeout(options.delay);
      }

      const element = await this.screenshotDOMElement(page)(options?.screenshotSelector ?? selector, options);

      expect(element).toBeDefined(); // TODO see why this does NOT fail the test

      if (!element) {
        throw new Error(`Failed to find element at \`${selector}\`\n\n\t${url}`);
      } else {
        expect(element).toMatchSnapshot(screenshotPath, getSnapshotOptions(options));
      }
    };

  /**
   * Expect a chart given a url from storybook
   *
   * @param url Storybook url from knobs section
   * @param options
   */
  expectChartAtUrlToMatchScreenshot = (page: Page) => async (url: string, options?: ScreenshotElementAtUrlOptions) => {
    await this.expectElementAtUrlToMatchScreenshot(page)(url, this.chartSelector, {
      waitSelector: this.chartWaitSelector,
      ...options,
    });
  };

  /**
   * Expect a chart given a url from storybook
   *
   * @param url Storybook url from knobs section
   * @param options
   */
  expectChartAtUrlToMatchScreenshotOld =
    (page: Page) => async (url: string, options?: ScreenshotElementAtUrlOptions) => {
      await this.expectElementAtUrlToMatchScreenshot(page)(url, this.chartSelector, {
        waitSelector: this.chartWaitSelector,
        ...options,
      });
    };

  /**
   * Expect a chart given a url from storybook with mouse move
   *
   * TODO - Find why this always creates a 2px diff
   *
   * @param url Storybook url from knobs section
   * @param mousePosition - position of mouse relative to chart
   * @param options
   */
  expectChartWithMouseAtUrlToMatchScreenshot =
    (page: Page) => async (url: string, mousePosition: MousePosition, options?: ScreenshotElementAtUrlOptions) => {
      const action = async () => {
        await options?.action?.();
        await this.moveMouseRelativeToDOMElement(page)(mousePosition, this.chartSelector);
      };
      await this.expectChartAtUrlToMatchScreenshot(page)(url, {
        ...options,
        action,
      });
    };

  /**
   * Expect a chart given a url from storybook with mouse click
   *
   * TODO - Find why this always creates a 2px diff
   *
   * @param url Storybook url from knobs section
   * @param mousePosition - position of mouse relative to chart
   * @param options
   */
  expectChartWithClickAtUrlToMatchScreenshot =
    (page: Page) =>
    async (
      url: string,
      mousePosition: MousePosition,
      clickOptions?: ClickOptions,
      options?: ScreenshotElementAtUrlOptions,
    ) => {
      const action = async () => {
        await options?.action?.();
        await this.clickMouseRelativeToDOMElement(page)(mousePosition, this.chartSelector, clickOptions);
      };
      await this.expectChartAtUrlToMatchScreenshot(page)(url, {
        ...options,
        action,
      });
    };

  /**
   * Expect a chart given a url from storybook with keyboard events
   * @param url
   * @param keyboardEvents
   * @param options
   */
  expectChartWithKeyboardEventsAtUrlToMatchScreenshot =
    (page: Page) =>
    async (url: string, keyboardEvents: KeyboardKeys, options?: Omit<ScreenshotElementAtUrlOptions, 'action'>) => {
      const action = async () => {
        // click to focus within the chart
        await this.clickMouseRelativeToDOMElement(page)({ top: 0, left: 0 }, this.chartSelector);
        // eslint-disable-next-line no-restricted-syntax
        for (const actions of keyboardEvents) {
          await this.pressKey(page)(actions.key, actions.count);
        }
        await this.moveMouseRelativeToDOMElement(page)({ top: 0, left: 0 }, this.chartSelector);
      };

      await this.expectChartAtUrlToMatchScreenshot(page)(url, {
        ...options,
        action,
      });
    };

  /**
   * Expect a chart given a url from storybook with mouse move
   *
   * @param url Storybook url from knobs section
   * @param start - the start position of mouse relative to chart
   * @param end - the end position of mouse relative to chart
   * @param options
   */
  expectChartWithDragAtUrlToMatchScreenshot =
    (page: Page) =>
    async (
      url: string,
      start: MousePosition,
      end: MousePosition,
      options?: Omit<ScreenshotElementAtUrlOptions, 'action'>,
    ) => {
      const action = async () => await this.dragMouseRelativeToDOMElement(page)(start, end, this.chartSelector);
      await this.expectChartAtUrlToMatchScreenshot(page)(url, {
        ...options,
        action,
      });
    };

  /**
   * Loads storybook page from raw url, and waits for element
   *
   * @param url Storybook url from knobs section
   * @param waitSelector selector of element to wait to appear in DOM
   * @param timeout timeout for waiting on element to appear in DOM
   */
  loadElementFromURL =
    (page: Page) =>
    async (url: string, waitSelector?: string, timeout?: number): Promise<boolean> => {
      const cleanUrl = CommonPage.parseUrl(url);
      await page.goto(cleanUrl);

      if (waitSelector) {
        try {
          await this.waitForElement(page)(waitSelector, timeout);
          return true;
        } catch (error) {
          console.error(error);
          console.error(`Check story at: \n\n\tstorybook url: ${url}\n\tlocal vrt url: ${cleanUrl}`);
          return false;
        }
      }

      return false;
    };

  /**
   * Wait for an element to be on the DOM
   *
   * @param {string} [waitSelector] the DOM selector to wait for, default to '.echChartStatus[data-ech-render-complete=true]'
   * @param {number} [timeout] - the timeout for the operation, default to 1000ms
   */
  waitForElement =
    (page: Page) =>
    async (waitSelector: string, timeout = 10 * 1000) => {
      await page.waitForSelector(waitSelector, {
        state: 'attached',
        timeout,
        strict: false, // should be true but some stories have multiple charts
      });
    };

  setResizeDimensions = (page: Page) => async (dimensions: { height?: string | number; width?: string | number }) => {
    const el = page.locator('#story-resize-wrapper');
    if (!(await el.isVisible())) {
      throw new Error('setResizeDimensions was called when no #story-resize-wrapper exists');
    }

    await el.evaluate((element, { height, width }) => {
      if (height !== undefined) element.style.height = typeof height === 'number' ? `${height}px` : height;
      if (width !== undefined) element.style.width = typeof width === 'number' ? `${width}px` : width;
    }, dimensions);
  };
}

function getSnapshotOptions(options?: ScreenshotDOMElementOptions) {
  if (options?.maxDiffPixels !== undefined) {
    // need to clear default options for maxDiffPixels to be respected, else could still fail on threshold or maxDiffPixelRatio
    return {
      threshold: 1,
      maxDiffPixelRatio: 1,
      ...options,
    };
  }
  return options;
}

export const common = new CommonPage();

/* eslint-enable no-console */
