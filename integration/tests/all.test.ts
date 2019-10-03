import { common } from '../page_objects';
import { getStorybookInfo } from '../helpers';

// mock required for importing trick, otherwise .scss files will throw an error
jest.mock('../../.storybook/theme_service.ts', () => ({
  switchTheme: () => undefined,
}));

const storyGroups = getStorybookInfo();

storyGroups.forEach(({ group, encodedGroup, stories }) => {
  describe(group, () => {
    stories.forEach(({ title, encodedTitle }) => {
      describe(title, () => {
        it('visually looks correct', async () => {
          await page.goto(`http://localhost:9001/iframe.html?id=${encodedGroup}--${encodedTitle}`);
          const chart = await common.getChartScreenshot();
          expect(chart).toMatchImageSnapshot();
        });
      });
    });
  });
});
