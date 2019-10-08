import Url from 'url';
import { toMatchImageSnapshot } from '../jest-env-setup';

expect.extend({ toMatchImageSnapshot });

const baseUrl = 'http://host.docker.internal:9001/iframe.html';

interface ScreenshotDOMElementOptions {
  padding?: number;
  path?: string;
}

const parseUrl = (url: string): string => {
  const { query } = Url.parse(url);

  return `${baseUrl}?${query}${query ? '&' : ''}knob-debug=false`;
};

class CommonPage {
  async getChart() {
    return page.$('echChart');
  }

  async screenshotDOMElement(selector: string, opts?: ScreenshotDOMElementOptions) {
    const padding: number = opts && opts.padding ? opts.padding : 0;
    const path: string | undefined = opts && opts.path ? opts.path : undefined;

    await page.waitForSelector(selector, { timeout: 5000 });
    const rect = await page.evaluate((selector) => {
      const element = document.querySelector(selector);

      if (!element) {
        return null;
      }

      const { x, y, width, height } = element.getBoundingClientRect();

      return { left: x, top: y, width, height, id: element.id };
    }, selector);

    if (!rect) throw Error(`Could not find element that matches selector: ${selector}.`);

    return page.screenshot({
      path,
      clip: {
        x: rect.left - padding,
        y: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      },
    });
  }

  /**
   * Capture screenshot or chart element only
   */
  async getChartScreenshot() {
    return this.screenshotDOMElement('.echChart');
  }

  /**
   * Expect a chart given a url from storybook.
   *
   * - Note: No need to fix host or port. They will be set automatically.
   *
   * @param url Storybook url from knobs section
   */
  async expectChartAtUrlToMatchScreenshot(url: string) {
    const cleanUrl = parseUrl(url);
    await page.goto(cleanUrl);
    const chart = await this.getChartScreenshot();
    expect(chart).toMatchImageSnapshot();
  }
}

export const common = new CommonPage();
