import { common } from '../../page_objects';

describe('Bar charts - basic', () => {
  it('visually looks correct', async () => {
    await page.goto('http://localhost:9001/iframe.html?id=bar-chart--basic');
    const chart = await common.getChartScreenshot();
    expect(chart).toMatchImageSnapshot();
  });
});
