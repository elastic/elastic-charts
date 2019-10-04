interface ScreenshotDOMElementOptions {
  padding?: number;
  path?: string;
}

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

  getChartScreenshot() {
    return this.screenshotDOMElement('.echChart');
  }
}

export const common = new CommonPage();
