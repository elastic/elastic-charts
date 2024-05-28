/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test, expect } from '@playwright/test';

import { PartitionLayout, Position } from '../constants';
import { pwEach } from '../helpers';
import { common } from '../page_objects';

test.describe('Legend stories', () => {
  test('should render non-split series', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/legend--changing-specs&knob-split series=',
    );
  });
  test('should hide line series legend item', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/legend--hide-legend-items-by-series&knob-hide bar series in legend=&knob-hide line series in legend=true',
    );
  });
  test('should hide bar series legend item', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/legend--hide-legend-items-by-series&knob-hide bar series in legend=true&knob-hide line series in legend=',
    );
  });
  test('should 0 legend buffer', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/legend--legend-spacing-buffer&knob-legend buffer value=0&knob-max legend label lines=1',
    );
  });
  test('should have the same order as nested with no indent even if there are repeated labels', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/legend--piechart-repeated-labels&knob-flatLegend=true&knob-legendMaxDepth=2',
    );
  });

  test('should correctly render multiline nested legend labels', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/legend--piechart&globals=theme:light&knob-Hide color picker=true&knob-Hide color picker_Legend=true&knob-Legend position=right&knob-Legend position_Legend=right&knob-max legend label lines=0&knob-Number of series=5&knob-Popover position=leftCenter&knob-Popover position_Legend=leftCenter&knob-Series with long name=3&knob-direction_Legend=vertical&knob-floating columns_Legend=2&knob-hAlign_Legend=right&knob-legend buffer value=80&knob-legend margins=20&knob-long label text_Legend=Non do aliqua veniam dolore ipsum eu aliquip. Culpa in duis amet non velit qui non ullamco sit adipisicing. Ut sunt Lorem mollit exercitation deserunt officia sunt ipsum eu amet.&knob-multiline Legend labels=true&knob-vAlign_Legend=bottom&knob-Partition Layout=sunburst&knob-flatLegend=&knob-showLegendExtra=&knob-legendMaxDepth=2&knob-legendStrategy=key',
    );
  });

  test('should correctly render very long multiline legend labels', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/legend--legend-spacing-buffer&knob-Hide color picker=true&knob-Hide color picker_Legend=true&knob-Legend position=right&knob-Legend position_Legend=right&knob-Number of series=5&knob-Partition Layout=sunburst&knob-Popover position=leftCenter&knob-Popover position_Legend=leftCenter&knob-Series with long name=3&knob-direction_Legend=vertical&knob-flatLegend=true&knob-floating columns_Legend=2&knob-hAlign_Legend=right&knob-legend buffer value=80&knob-legend margins=20&knob-legendMaxDepth=3&knob-legendStrategy=key&knob-long label text_Legend=Non do aliqua veniam dolore ipsum eu aliquip. Culpa in duis amet non velit qui non ullamco sit adipisicing. Ut sunt Lorem mollit exercitation deserunt officia sunt ipsum eu amet.&knob-max legend label lines=0&knob-showLegendExtra=true&knob-use long labels=true&knob-vAlign_Legend=bottom',
    );
  });

  test('should breakup multiline legend labels with long continous words', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/legend--inside-chart&knob-Inside chart_Legend=false&knob-Legend position_Legend=right&knob-max label lines_Legend=0&knob-Number of series=5&knob-Popover position_Legend=leftCenter&knob-Series with long name=3&knob-direction_Legend=vertical&knob-floating columns_Legend=2&knob-hAlign_Legend=right&knob-long label_Legend=a few separate words then averyongcontinuouswordthatneedstobebrokenup&knob-vAlign_Legend=bottom',
    );
  });

  test('should break multiline legends with long url characters', async ({ page }) => {
    await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/legend--inside-chart&globals=theme:light&knob-Number of series=5&knob-Series with long name=3&knob-Inside chart_Legend=false&knob-Show legend action_Legend=true&knob-floating columns_Legend=1&knob-vAlign_Legend=bottom&knob-hAlign_Legend=right&knob-direction_Legend=vertical&knob-max label lines_Legend=0&knob-long label_Legend=/people/type:astronauts/name:gregory-chamitoff/profile',
      { left: 182, top: 178 },
    );
  });

  test('should render long floating legends inside chart', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/legend--inside-chart&globals=theme:light&knob-Number of series=40&knob-Series with long name=0&knob-Inside chart_Legend=true&knob-floating columns_Legend=1&knob-vAlign_Legend=bottom&knob-hAlign_Legend=right&knob-direction_Legend=vertical&knob-max label lines_Legend=1&knob-long label_Legend=long name',
    );
  });

  test('should render color picker on mouse click', async ({ page }) => {
    const action = async () => {
      await common.clickMouseRelativeToDOMElement(page)({ left: 0, top: 0 }, '.echLegendItem__color');
    };
    await common.expectElementAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/legend--color-picker',
      'body',
      {
        action,
        waitSelector: common.chartWaitSelector,
      },
    );
  });

  test('should render legend action on mouse hover', async ({ page }) => {
    const action = async () => {
      await common.moveMouseRelativeToDOMElement(page)({ left: 30, top: 10 }, '.echLegendItem');
    };
    await common.expectChartAtUrlToMatchScreenshot(page)('http://localhost:9001/?path=/story/legend--actions', {
      action,
    });
  });

  test('should adjust legend width for scrollbar', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/small-multiples-alpha--grid-lines&knob-Debug=true&knob-Show Legend=true',
    );
  });

  test.describe('Tooltip placement with legend', () => {
    test('should render tooltip with left legend', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/legend--positioning&knob-position=left',
        {
          bottom: 190,
          left: 310,
        },
      );
    });

    test('should render tooltip with top legend', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/legend--positioning&knob-position=top',
        {
          top: 150,
          left: 320,
        },
      );
    });

    test('should render tooltip with right legend', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/legend--positioning&knob-position=right',
        {
          bottom: 180,
          left: 330,
        },
      );
    });

    test('should render tooltip with bottom legend', async ({ page }) => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/legend--positioning&knob-position=bottom',
        {
          top: 150,
          left: 320,
        },
      );
    });
  });
  test.describe('keyboard navigation', () => {
    // eslint-disable-next-line jest/expect-expect
    test('should navigate to legend item with tab', async ({ page }) => {
      // puts mouse to the bottom left
      await common.moveMouse(page)(0, 0);
      await common.expectChartWithKeyboardEventsAtUrlToMatchScreenshot(page)(
        'http://localhost:9001/?path=/story/legend--positioning&knob-position=right',
        [
          {
            key: 'tab',
            count: 2,
          },
          {
            key: `${await common.getModifierKey(page)()}+Enter`,
            count: 1,
          },
        ],
      );
    });
    test('should change aria label to hidden when clicked', async ({ page }) => {
      await common.loadElementFromURL(page)(
        'http://localhost:9001/?path=/story/legend--positioning&knob-position=right',
        '.echLegendItem__label',
      );
      await common.clickMouseRelativeToDOMElement(page)(
        {
          bottom: 180,
          left: 330,
        },
        '.echChartStatus[data-ech-render-complete=true]',
      );
      // Make the first index legend item hidden
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press(`${await common.getModifierKey(page)()}+Enter`);

      const hiddenResults: number[] = [];
      // Filter the labels
      const labels = page.evaluate(() =>
        Array.from(document.getElementsByClassName('echLegendItem'), (e) => e.outerHTML),
      );
      (await labels).forEach((label, index) => {
        const ariaInteractionLabel = label.split('; ')[1];
        if (ariaInteractionLabel && /show/.test(ariaInteractionLabel)) {
          hiddenResults.push(index);
        }
      });
      expect(hiddenResults).toEqual([1]);
    });

    test('title interactive help should change according to the legend context for the item', async ({ page }) => {
      await common.loadElementFromURL(page)(
        'http://localhost:9001/?path=/story/legend--positioning&knob-position=right',
        '.echLegendItem__label',
      );

      // check that the first item has a "isolate" title as second line
      const initialLabels = await page.evaluate(() =>
        Array.from(document.getElementsByClassName('echLegendItem__label'), (e) => e.getAttribute('title')),
      );

      expect(initialLabels.map((label) => (label ? label.split('\n')[1] : ''))).toEqual(
        new Array(initialLabels.length).fill('Click: isolate series'),
      );

      // click on the first item
      await page.keyboard.press('Tab');
      await page.keyboard.press(`Enter`);

      // now check that it has a "show all" title this time
      // check that all the other items (hidden) have a "show" title
      const secondRoundLabels = await page.evaluate(() =>
        Array.from(document.getElementsByClassName('echLegendItem__label'), (e) => e.getAttribute('title')),
      );
      expect(secondRoundLabels.map((label) => (label ? label.split('\n')[1] : ''))).toEqual(
        ['Click: show all series'].concat(new Array(secondRoundLabels.length - 1).fill('Click: show series')),
      );

      // now click on the second item (hidden)
      await page.keyboard.press('Tab');
      await page.keyboard.press(`Enter`);

      // check that the first two items have a "hide" title and the rest have a "show" title
      const thirdRoundLabels = await page.evaluate(() =>
        Array.from(document.getElementsByClassName('echLegendItem__label'), (e) => e.getAttribute('title')),
      );
      expect(thirdRoundLabels.map((label) => (label ? label.split('\n')[1] : ''))).toEqual(
        ['Click: hide series', 'Click: hide series'].concat(
          new Array(secondRoundLabels.length - 2).fill('Click: show series'),
        ),
      );
    });
  });

  test.describe('Extra values', () => {
    pwEach.test([PartitionLayout.sunburst, PartitionLayout.treemap])(
      (l) => `should display flat legend extra values on ${l}`,
      async (page, layout) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/legend--piechart&knob-Partition Layout=${layout}&knob-flatLegend=true&knob-showLegendExtra=true&knob-legendMaxDepth=2`,
        );
      },
    );

    pwEach.test([PartitionLayout.sunburst, PartitionLayout.treemap])(
      (l) => `should display nested legend extra values on ${l}`,
      async (page, layout) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/legend--piechart&knob-Partition Layout=${layout}&knob-flatLegend=false&knob-showLegendExtra=true&knob-legendMaxDepth=2`,
        );
      },
    );
  });

  test.describe('Legend inside chart', () => {
    const getPositionalUrl = (p1: string, p2: string, others: string = '') =>
      `http://localhost:9001/?path=/story/legend--inside-chart&knob-vAlign_Legend=${p1}&knob-hAlign_Legend=${p2}${others}`;

    pwEach.test<[Position, Position]>([
      [Position.Top, Position.Left],
      [Position.Top, Position.Right],
      [Position.Bottom, Position.Left],
      [Position.Bottom, Position.Right],
    ])(
      ([p1, p2]) => `should correctly display ${p1} ${p2}`,
      async (page, [p1, p2]) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(getPositionalUrl(p1, p2, '&globals=theme:light'));
      },
    );

    pwEach.test<[Position, Position]>([
      [Position.Top, Position.Left],
      [Position.Top, Position.Right],
      [Position.Bottom, Position.Left],
      [Position.Bottom, Position.Right],
    ])(
      ([p1, p2]) => `should correctly display ${p1} ${p2} in dark mode`,
      async (page, [p1, p2]) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(getPositionalUrl(p1, p2, '&globals=theme:dark'));
      },
    );

    const longLabel =
      'Non do aliqua veniam dolore ipsum eu aliquip. Culpa in duis amet non velit qui non ullamco sit adipisicing. Ut sunt Lorem mollit exercitation deserunt officia sunt ipsum eu amet.';

    pwEach.test<[Position, Position]>([
      [Position.Top, Position.Left],
      [Position.Top, Position.Right],
      [Position.Bottom, Position.Left],
      [Position.Bottom, Position.Right],
    ])(
      ([p1, p2]) => `should correctly display ${p1} ${p2} in multiline mode`,
      async (page, [p1, p2]) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          getPositionalUrl(p1, p2, `&knob-max label lines_Legend=0&knob-long label_Legend=${longLabel}`),
        );
      },
    );

    pwEach.test([0, 1, 3])(
      (l) => `should correctly truncate multiline labels up to maxLines set to ${l}`,
      async (page, maxLines) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/legend--inside-chart&knob-Number of series=5&knob-Series with long name=3&knob-Inside chart_Legend=false&knob-floating columns_Legend=2&knob-vAlign_Legend=bottom&knob-hAlign_Legend=right&knob-direction_Legend=vertical&knob-max label lines_Legend=${maxLines}&knob-long label_Legend=${longLabel}`,
        );
      },
    );
  });

  test.describe('Custom width', () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getUrl = (position: string, size: number) =>
      `http://localhost:9001/?path=/story/legend--positioning&knob-position=${position}&knob-enable legend size=true&knob-legend size=${size}`;

    pwEach.describe(['top', 'right', 'bottom', 'left'])(
      (p) => `position ${p}`,
      (position) => {
        const isVertical = position === 'left' || position === 'right';
        if (isVertical) {
          test('should limit width to min of 30% of computed width', async ({ page }) => {
            await common.expectChartAtUrlToMatchScreenshot(page)(getUrl(position, 1));
          });
        }

        test('should limit size to max 70% of chart dimension', async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(getUrl(position, 100000));
        });

        test('should set exact size of legend within constraints', async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(getUrl(position, isVertical ? 400 : 300));
        });
      },
    );
  });
  test.describe('Legend tabular data', () => {
    const datasetKnob = (p1: string, p2: string) => `&globals=&knob-Dataset_Legend=${p1}&knob-dataset=${p2}`;
    const getDatasetUrl = (p1: string, p2: string, others = '') => {
      return `http://localhost:9001/?path=/story/legend--tabular-data${datasetKnob(p1, p2)}${others}`;
    };

    const legendPositionKnob = (position: string) => `&knob-Legend position_Legend=${position}`;

    const getPositionUrl = (p1: string, others = '') => {
      return `http://localhost:9001/?path=/story/legend--tabular-data${legendPositionKnob(p1)}${others}`;
    };

    const legendValueKnob = (values: string[]) => values.map((v, i) => `&knob-Legend Value_Legend[${i}]=${v}`).join('');
    const getlegendValueUrl = (values: string[], others = '') => {
      return `http://localhost:9001/?path=/story/legend--tabular-data${legendValueKnob(values)}${others}`;
    };

    pwEach.test<[string, string]>([
      ['shortCopyDataset', 'short copy'],
      ['longCopyDataset', 'long copy'],
      ['defaultDataset', 'default'],
    ])(
      ([p2]) => `should correctly display ${p2} dataset`,
      async (page, [p1, p2]) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(getDatasetUrl(p1, p2));
      },
    );

    pwEach.test<string>(['right', 'left', 'top', 'bottom'])(
      (p) => `should correctly display ${p} positon`,
      async (page, p) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(getPositionUrl(p));
      },
    );

    pwEach.test<string[]>([
      ['median'],
      ['currentAndLastValue', 'median'],
      ['median', 'max', 'min', 'average', 'firstNonNullValue'],

      ['median', 'max', 'min', 'average', 'firstNonNullValue', 'stdDeviation', 'firstValue', 'currentAndLastValue'],
    ])(
      (p) => `should correctly display ${p} values`,
      async (page, p) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(getlegendValueUrl(p));
      },
    );
  });
});
