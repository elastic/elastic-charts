/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PartitionLayout, Position } from '../../packages/charts/src';
import { common } from '../page_objects';

describe('Legend stories', () => {
  it('should render non-split series', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--changing-specs&knob-split series=',
    );
  });
  it('should hide line series legend item', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--hide-legend-items-by-series&knob-hide bar series in legend=&knob-hide line series in legend=true',
    );
  });
  it('should hide bar series legend item', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--hide-legend-items-by-series&knob-hide bar series in legend=true&knob-hide line series in legend=',
    );
  });
  it('should 0 legend buffer', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--legend-spacing-buffer&knob-legend buffer value=0&knob-max legend label lines=1',
    );
  });
  it('should have the same order as nested with no indent even if there are repeated labels', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--piechart-repeated-labels&knob-flatLegend=true&knob-legendMaxDepth=2',
    );
  });

  it('should correctly render multiline nested legend labels', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--piechart&globals=backgrounds.value:!hex(fff);themes.value:Light&knob-Hide color picker=true&knob-Hide color picker_Legend=true&knob-Legend position=right&knob-Legend position_Legend=right&knob-max legend label lines=0&knob-Number of series=5&knob-Popover position=leftCenter&knob-Popover position_Legend=leftCenter&knob-Series with long name=3&knob-direction_Legend=vertical&knob-floating columns_Legend=2&knob-hAlign_Legend=right&knob-legend buffer value=80&knob-legend margins=20&knob-long label text_Legend=Non do aliqua veniam dolore ipsum eu aliquip. Culpa in duis amet non velit qui non ullamco sit adipisicing. Ut sunt Lorem mollit exercitation deserunt officia sunt ipsum eu amet.&knob-multiline Legend labels=true&knob-vAlign_Legend=bottom&knob-Partition Layout=sunburst&knob-flatLegend=&knob-showLegendExtra=&knob-legendMaxDepth=2&knob-legendStrategy=key',
    );
  });

  it('should correctly render very long multiline legend labels', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--legend-spacing-buffer&globals=backgrounds.value:transparent;themes.value:Light&knob-Hide color picker=true&knob-Hide color picker_Legend=true&knob-Legend position=right&knob-Legend position_Legend=right&knob-Number of series=5&knob-Partition Layout=sunburst&knob-Popover position=leftCenter&knob-Popover position_Legend=leftCenter&knob-Series with long name=3&knob-direction_Legend=vertical&knob-flatLegend=true&knob-floating columns_Legend=2&knob-hAlign_Legend=right&knob-legend buffer value=80&knob-legend margins=20&knob-legendMaxDepth=3&knob-legendStrategy=key&knob-long label text_Legend=Non do aliqua veniam dolore ipsum eu aliquip. Culpa in duis amet non velit qui non ullamco sit adipisicing. Ut sunt Lorem mollit exercitation deserunt officia sunt ipsum eu amet.&knob-max legend label lines=0&knob-showLegendExtra=true&knob-use long labels=true&knob-vAlign_Legend=bottom',
    );
  });

  it('should breakup multiline legend labels with long continous words', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--inside-chart&globals=backgrounds.value:transparent;themes.value:Light&knob-Inside chart_Legend=false&knob-Legend position_Legend=right&knob-max label lines_Legend=0&knob-Number of series=5&knob-Popover position_Legend=leftCenter&knob-Series with long name=3&knob-direction_Legend=vertical&knob-floating columns_Legend=2&knob-hAlign_Legend=right&knob-long label_Legend=a few separate words then averyongcontinuouswordthatneedstobebrokenup&knob-vAlign_Legend=bottom',
    );
  });

  it('should render color picker on mouse click', async () => {
    const action = async () => {
      await common.clickMouseRelativeToDOMElement({ left: 0, top: 0 }, '.echLegendItem__color');
    };
    await common.expectElementAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--color-picker',
      'body',
      {
        action,
        waitSelector: common.chartWaitSelector,
      },
    );
  });

  it('should render legend action on mouse hover', async () => {
    const action = async () => {
      await common.moveMouseRelativeToDOMElement({ left: 30, top: 10 }, '.echLegendItem');
    };
    await common.expectChartAtUrlToMatchScreenshot('http://localhost:9001/?path=/story/legend--actions', {
      action,
    });
  });

  it('should adjust legend width for scrollbar', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/small-multiples-alpha--grid-lines&knob-Debug=true&knob-Show Legend=true',
    );
  });

  describe('Tooltip placement with legend', () => {
    it('should render tooltip with left legend', async () => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot('http://localhost:9001/?path=/story/legend--left', {
        bottom: 190,
        left: 310,
      });
    });

    it('should render tooltip with top legend', async () => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot('http://localhost:9001/?path=/story/legend--top', {
        top: 150,
        left: 320,
      });
    });

    it('should render tooltip with right legend', async () => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot('http://localhost:9001/?path=/story/legend--right', {
        bottom: 180,
        left: 330,
      });
    });

    it('should render tooltip with bottom legend', async () => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot('http://localhost:9001/?path=/story/legend--bottom', {
        top: 150,
        left: 320,
      });
    });
  });
  describe('keyboard navigation', () => {
    // eslint-disable-next-line jest/expect-expect
    it('should navigate to legend item with tab', async () => {
      // puts mouse to the bottom left
      await common.moveMouse(0, 0);
      await common.expectChartWithKeyboardEventsAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/legend--right',
        [
          {
            key: 'tab',
            count: 2,
          },
          {
            key: 'enter',
            count: 1,
          },
        ],
      );
    });
    it('should change aria label to hidden when clicked', async () => {
      await common.loadElementFromURL('http://localhost:9001/?path=/story/legend--right', '.echLegendItem__label');
      await common.clickMouseRelativeToDOMElement(
        {
          bottom: 180,
          left: 330,
        },
        '.echChartStatus[data-ech-render-complete=true]',
      );
      // Make the first index legend item hidden
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      const hiddenResults: number[] = [];
      // Filter the labels
      const labels = page.evaluate(() =>
        Array.from(document.getElementsByClassName('echLegendItem'), (e) => e.outerHTML),
      );
      (await labels).forEach((label, index) => {
        if (label.includes('Activate to show series')) {
          hiddenResults.push(index);
        }
      });
      expect(hiddenResults).toEqual([1]);
    });
  });

  describe('Extra values', () => {
    it.each([PartitionLayout.sunburst, PartitionLayout.treemap])(
      'should display flat legend extra values on %s',
      async (layout) => {
        await common.expectChartAtUrlToMatchScreenshot(
          `http://localhost:9001/?path=/story/legend--piechart&knob-Partition Layout=${layout}&knob-flatLegend=true&knob-showLegendExtra=true&knob-legendMaxDepth=2`,
        );
      },
    );

    it.each([PartitionLayout.sunburst, PartitionLayout.treemap])(
      'should display nested legend extra values on %s',
      async (layout) => {
        await common.expectChartAtUrlToMatchScreenshot(
          `http://localhost:9001/?path=/story/legend--piechart&knob-Partition Layout=${layout}&knob-flatLegend=false&knob-showLegendExtra=true&knob-legendMaxDepth=2`,
        );
      },
    );
  });

  describe('Legend inside chart', () => {
    const getPositionalUrl = (p1: string, p2: string, others: string = '') =>
      `http://localhost:9001/?path=/story/legend--inside-chart&knob-vAlign_Legend=${p1}&knob-hAlign_Legend=${p2}${others}`;

    it.each([
      [Position.Top, Position.Left],
      [Position.Top, Position.Right],
      [Position.Bottom, Position.Left],
      [Position.Bottom, Position.Right],
    ])('should correctly display %s %s', async (p1, p2) => {
      await common.expectChartAtUrlToMatchScreenshot(getPositionalUrl(p1, p2, '&globals=theme:light'));
    });

    it.each([
      [Position.Top, Position.Left],
      [Position.Top, Position.Right],
      [Position.Bottom, Position.Left],
      [Position.Bottom, Position.Right],
    ])('should correctly display %s %s in dark mode', async (p1, p2) => {
      await common.expectChartAtUrlToMatchScreenshot(getPositionalUrl(p1, p2, '&globals=theme:dark'));
    });

    const longLabel =
      'Non do aliqua veniam dolore ipsum eu aliquip. Culpa in duis amet non velit qui non ullamco sit adipisicing. Ut sunt Lorem mollit exercitation deserunt officia sunt ipsum eu amet.';

    it.each([
      [Position.Top, Position.Left],
      [Position.Top, Position.Right],
      [Position.Bottom, Position.Left],
      [Position.Bottom, Position.Right],
    ])('should correctly display %s %s in multiline mode', async (p1, p2) => {
      await common.expectChartAtUrlToMatchScreenshot(
        getPositionalUrl(p1, p2, `&knob-max label lines_Legend=0&knob-long label_Legend=${longLabel}`),
      );
    });

    it.each([0, 1, 3])('should correctly truncate multiline labels up to maxLines set to %d', async (maxLines) => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/legend--inside-chart&globals=backgrounds.value:transparent;themes.value:Light&knob-Number of series=5&knob-Series with long name=3&knob-Inside chart_Legend=false&knob-floating columns_Legend=2&knob-vAlign_Legend=bottom&knob-hAlign_Legend=right&knob-direction_Legend=vertical&knob-max label lines_Legend=${maxLines}&knob-long label_Legend=${longLabel}`,
      );
    });
  });
});
