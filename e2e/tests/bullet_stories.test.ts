/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { pwEach } from '../helpers';
import { common } from '../page_objects/common';

export const BulletSubtype = ['vertical', 'horizontal', 'circle', 'half-circle', 'two-thirds-circle'];
const testCases: [string, { start: number; end: number; value: number; target: number }][] = [
  ['positive values', { start: 4, end: 167, value: 50, target: 100 }],
  ['positive values - reversed', { start: 167, end: 4, value: 50, target: 100 }],
  ['positive/negative values', { start: -57, end: 97, value: -12, target: 50 }],
  ['positive/negative values - reversed', { start: 97, end: -57, value: -12, target: 50 }],
  ['negative values', { start: -194, end: -5, value: -50, target: -150 }],
  ['negative values - reversed', { start: -5, end: -194, value: -50, target: -150 }],
];

test.describe('Bullet stories', () => {
  test('renders single bullet', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)('http://localhost:9001/?path=/story/bullet-graph--single');
  });

  test('renders angular bullet', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)('http://localhost:9001/?path=/story/bullet-graph--angular');
  });

  test('renders single row bullet', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)('http://localhost:9001/?path=/story/bullet-graph--single-row');
  });

  test('renders single column bullet', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/bullet-graph--single-column',
    );
  });

  test('renders grid bullet', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)('http://localhost:9001/?path=/story/bullet-graph--grid');
  });

  pwEach.describe(BulletSubtype)(
    (subtype) => `subtype - ${subtype}`,
    (subtype) => {
      test('should render in dark theme', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/bullet-graph--single&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:dark&knob-Config 1 - Color_Color Bands=RGBA(70, 130, 96, 1)&knob-Config 2 - Steps_Color Bands=5&knob-Config 3 - json_Color Bands={"classes":[0,20,40,100],"colors":["&knob-debug=&knob-title_General=Error rate title&knob-subtitle_General=Here is the subtitle&knob-value_General=56&knob-target_General=75&knob-start_General=0&knob-end_General=100&knob-format (numeraljs)_General=0.[0]&knob-subtype_General=${subtype}&knob-niceDomain_Ticks=&knob-tick strategy_Ticks=auto&knob-ticks(approx. count)_Ticks=5&knob-ticks(placements)_Ticks[0]=-200&knob-ticks(placements)_Ticks[1]=-100&knob-ticks(placements)_Ticks[2]=0&knob-ticks(placements)_Ticks[3]=5&knob-ticks(placements)_Ticks[4]=10&knob-ticks(placements)_Ticks[5]=15&knob-ticks(placements)_Ticks[6]=20&knob-ticks(placements)_Ticks[7]=25&knob-ticks(placements)_Ticks[8]=50&knob-ticks(placements)_Ticks[9]=100&knob-ticks(placements)_Ticks[10]=200`,
        );
      });

      test.describe('Ticks', () => {
        test('should render with auto ticks', async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/bullet-graph--single&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-end_General=100&knob-format (numeraljs)_General=0.[0]&knob-niceDomain_Ticks=true&knob-start_General=0&knob-subtype_General=${subtype}&knob-target_General=81&knob-tick strategy_Ticks=auto&knob-ticks(approx. count)_Ticks=10&knob-ticks(placements)_Ticks[0]=-200&knob-ticks(placements)_Ticks[1]=-100&knob-ticks(placements)_Ticks[2]=0&knob-ticks(placements)_Ticks[3]=5&knob-ticks(placements)_Ticks[4]=10&knob-ticks(placements)_Ticks[5]=15&knob-ticks(placements)_Ticks[6]=20&knob-ticks(placements)_Ticks[7]=25&knob-ticks(placements)_Ticks[8]=50&knob-ticks(placements)_Ticks[9]=100&knob-ticks(placements)_Ticks[10]=200&knob-title_General=Error rate&knob-value_General=57&knob-debug=&knob-subtitle_General=`,
          );
        });

        test('should render with explicit tick count', async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9002/?path=/story/bullet-graph--single&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-end_General=100&knob-format%20(numeraljs)_General=0.[0]&knob-niceDomain_Ticks=true&knob-start_General=0&knob-subtype_General=${subtype}&knob-target_General=81&knob-tick%20strategy_Ticks[0]=count&knob-tick%20strategy_Ticks[1]=auto&knob-ticks(approx.%20count)_Ticks=14&knob-ticks(placements)_Ticks[0]=-200&knob-ticks(placements)_Ticks[1]=-100&knob-ticks(placements)_Ticks[2]=0&knob-ticks(placements)_Ticks[3]=5&knob-ticks(placements)_Ticks[4]=10&knob-ticks(placements)_Ticks[5]=15&knob-ticks(placements)_Ticks[6]=20&knob-ticks(placements)_Ticks[7]=25&knob-ticks(placements)_Ticks[8]=50&knob-ticks(placements)_Ticks[9]=100&knob-ticks(placements)_Ticks[10]=200&knob-title_General=Error%20rate&knob-value_General=57&knob-debug=&knob-subtitle_General=`,
          );
        });

        test('should render with explicit tick placements', async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/bullet-graph--single&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-end_General=100&knob-format (numeraljs)_General=0.[0]&knob-niceDomain_Ticks=true&knob-start_General=0&knob-subtype_General=${subtype}&knob-target_General=81&knob-tick strategy_Ticks=placements&knob-ticks(approx. count)_Ticks=16&knob-ticks(placements)_Ticks[0]=-200&knob-ticks(placements)_Ticks[1]=-100&knob-ticks(placements)_Ticks[2]=0&knob-ticks(placements)_Ticks[3]=5&knob-ticks(placements)_Ticks[4]=10&knob-ticks(placements)_Ticks[5]=15&knob-ticks(placements)_Ticks[6]=20&knob-ticks(placements)_Ticks[7]=25&knob-ticks(placements)_Ticks[8]=50&knob-ticks(placements)_Ticks[9]=100&knob-ticks(placements)_Ticks[10]=200&knob-title_General=Error rate&knob-value_General=57&knob-debug=&knob-subtitle_General=`,
          );
        });
      });

      // Each color config type

      pwEach.describe([1, 2, 3, 4])(
        (v) => `Color config - ${v}`,
        (configIndex) => {
          test('should render colors with config', async ({ page }) => {
            await common.expectChartAtUrlToMatchScreenshot(page)(
              `http://localhost:9001/?path=/story/bullet-graph--color-bands&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-color config_Color Bands=${configIndex}&knob-Config 1 - Color_Color Bands=RGBA(70, 130, 96, 1)&knob-Config 2 - Palette_Color Bands=0&knob-Config 2 - Steps_Color Bands=5&knob-Config 2 - Reverse_Color Bands=&knob-Config 3 - json_Color Bands={"classes":5,"colors":["pink","yellow","blue"]}&knob-Config 4 - json_Color Bands=[{"color":"red","gte":0,"lt":20},{"color":"green","gte":20,"lte":40},{"color":"blue","gt":40,"lte":{"type":"percentage","value":100}}]&knob-start_Domain=0&knob-end_Domain=100&knob-value_Domain=56&knob-target_Domain=75&knob-niceDomain_Ticks=&knob-tick strategy_Ticks=auto&knob-ticks(approx. count)_Ticks=5&knob-ticks(placements)_Ticks[0]=-200&knob-ticks(placements)_Ticks[1]=-100&knob-ticks(placements)_Ticks[2]=0&knob-ticks(placements)_Ticks[3]=5&knob-ticks(placements)_Ticks[4]=10&knob-ticks(placements)_Ticks[5]=15&knob-ticks(placements)_Ticks[6]=20&knob-ticks(placements)_Ticks[7]=25&knob-ticks(placements)_Ticks[8]=50&knob-ticks(placements)_Ticks[9]=100&knob-ticks(placements)_Ticks[10]=200&knob-debug=&knob-subtype=${subtype}`,
            );
          });

          if (configIndex === 3 || configIndex === 4) {
            test('renders color bands independent of ticks', async ({ page }) => {
              await common.expectChartAtUrlToMatchScreenshot(page)(
                `http://localhost:9001/?path=/story/bullet-graph--color-bands&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-Config%201%20-%20Color_Color%20Bands=RGBA(70,%20130,%2096,%201)&knob-Config%202%20-%20Steps_Color%20Bands=5&knob-Config%203%20-%20json_Color%20Bands={%22classes%22:3,%22colors%22:[%22rgb(140,%20185,%20189)%22,%22rgb(236,%20177,%2089)%22,%22rgb(182,%20115,%2082)%22]}&knob-Config%204%20-%20json_Color%20Bands=[{%22color%22:%22red%22,%22gte%22:0,%22lt%22:20},{%22color%22:%22green%22,%22gte%22:20,%22lte%22:40},{%22color%22:%22blue%22,%22gt%22:40,%22lte%22:{%22type%22:%22percentage%22,%22value%22:100}}]&knob-color%20config_Color%20Bands=${configIndex}&knob-end_Domain=100&knob-start_Domain=0&knob-subtype=${subtype}&knob-target_Domain=75&knob-tick%20strategy_Ticks=auto&knob-ticks(approx.%20count)_Ticks=5&knob-ticks(placements)_Ticks[0]=-200&knob-ticks(placements)_Ticks[1]=-100&knob-ticks(placements)_Ticks[2]=0&knob-ticks(placements)_Ticks[3]=5&knob-ticks(placements)_Ticks[4]=10&knob-ticks(placements)_Ticks[5]=15&knob-ticks(placements)_Ticks[6]=20&knob-ticks(placements)_Ticks[7]=25&knob-ticks(placements)_Ticks[8]=50&knob-ticks(placements)_Ticks[9]=100&knob-ticks(placements)_Ticks[10]=200&knob-value_Domain=56&knob-Config%202%20-%20Palette_Color%20Bands=0&knob-Config%202%20-%20Reverse_Color%20Bands=&knob-niceDomain_Ticks=&knob-debug=`,
              );
            });

            test('renders color bands independent of ticks flipped domain', async ({ page }) => {
              await common.expectChartAtUrlToMatchScreenshot(page)(
                `http://localhost:9001/?path=/story/bullet-graph--color-bands&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-Config%201%20-%20Color_Color%20Bands=RGBA(70,%20130,%2096,%201)&knob-Config%202%20-%20Steps_Color%20Bands=5&knob-Config%203%20-%20json_Color%20Bands={%22classes%22:3,%22colors%22:[%22rgb(140,%20185,%20189)%22,%22rgb(236,%20177,%2089)%22,%22rgb(182,%20115,%2082)%22]}&knob-Config%204%20-%20json_Color%20Bands=[{%22color%22:%22red%22,%22gte%22:0,%22lt%22:20},{%22color%22:%22green%22,%22gte%22:20,%22lte%22:40},{%22color%22:%22blue%22,%22gt%22:40,%22lte%22:{%22type%22:%22percentage%22,%22value%22:100}}]&knob-color%20config_Color%20Bands=${configIndex}&knob-end_Domain=0&knob-start_Domain=100&knob-subtype=${subtype}&knob-target_Domain=75&knob-tick%20strategy_Ticks=auto&knob-ticks(approx.%20count)_Ticks=5&knob-ticks(placements)_Ticks[0]=-200&knob-ticks(placements)_Ticks[1]=-100&knob-ticks(placements)_Ticks[2]=0&knob-ticks(placements)_Ticks[3]=5&knob-ticks(placements)_Ticks[4]=10&knob-ticks(placements)_Ticks[5]=15&knob-ticks(placements)_Ticks[6]=20&knob-ticks(placements)_Ticks[7]=25&knob-ticks(placements)_Ticks[8]=50&knob-ticks(placements)_Ticks[9]=100&knob-ticks(placements)_Ticks[10]=200&knob-value_Domain=56&knob-Config%202%20-%20Palette_Color%20Bands=0&knob-Config%202%20-%20Reverse_Color%20Bands=&knob-niceDomain_Ticks=&knob-debug=`,
              );
            });
          }
        },
      );

      test('should render colors with discrete classes', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/bullet-graph--color-bands&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-Config 1 - Color_Color Bands=RGBA(70, 130, 96, 1)&knob-Config 2 - Steps_Color Bands=5&knob-Config 3 - json_Color Bands={"classes":[0,20,40,100],"colors":["pink","yellow","blue"]}&knob-Config 4 - json_Color Bands=[]&knob-color config_Color Bands=3&knob-end_Domain=100&knob-start_Domain=0&knob-subtype=${subtype}&knob-target_Domain=75&knob-tick strategy_Ticks=auto&knob-ticks(approx. count)_Ticks=5&knob-ticks(placements)_Ticks[0]=-200&knob-ticks(placements)_Ticks[1]=-100&knob-ticks(placements)_Ticks[2]=0&knob-ticks(placements)_Ticks[3]=5&knob-ticks(placements)_Ticks[4]=10&knob-ticks(placements)_Ticks[5]=15&knob-ticks(placements)_Ticks[6]=20&knob-ticks(placements)_Ticks[7]=25&knob-ticks(placements)_Ticks[8]=50&knob-ticks(placements)_Ticks[9]=100&knob-ticks(placements)_Ticks[10]=200&knob-value_Domain=56&knob-Config 2 - Palette_Color Bands=0&knob-Config 2 - Reverse_Color Bands=&knob-niceDomain_Ticks=&knob-debug=`,
        );
      });

      pwEach.describe([true, false])(
        (d) => `Nice domain - ${d}`,
        (niceDomain) => {
          pwEach.test(testCases)(
            ([v]) => `should render with ${v}`,
            async (page, [, { start, end, target, value }]) => {
              await common.expectChartAtUrlToMatchScreenshot(page)(
                `http://localhost:9001/?path=/story/bullet-graph--single&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-debug=&knob-title_General=Error rate&knob-subtitle_General=&knob-value_General=${value}&knob-target_General=${target}&knob-start_General=${start}&knob-end_General=${end}&knob-format (numeraljs)_General=0.[0]&knob-subtype_General=${subtype}&knob-niceDomain_Ticks=${niceDomain}&knob-tick strategy_Ticks=auto&knob-ticks(approx. count)_Ticks=10&knob-ticks(placements)_Ticks[0]=-200&knob-ticks(placements)_Ticks[1]=-100&knob-ticks(placements)_Ticks[2]=0&knob-ticks(placements)_Ticks[3]=5&knob-ticks(placements)_Ticks[4]=10&knob-ticks(placements)_Ticks[5]=15&knob-ticks(placements)_Ticks[6]=20&knob-ticks(placements)_Ticks[7]=25&knob-ticks(placements)_Ticks[8]=50&knob-ticks(placements)_Ticks[9]=100&knob-ticks(placements)_Ticks[10]=200`,
              );
            },
          );
        },
      );
    },
  );

  pwEach.describe([
    { subtype: 'vertical', width: '140px' },
    { subtype: 'horizontal', height: '85px' },
    { subtype: 'two-thirds-circle', height: '195px' },
  ])(
    ({ subtype }) => `Bullet as Metric - ${subtype}`,
    ({ subtype, height, width }) => {
      test.describe('Bullet as Metric', () => {
        pwEach.test(testCases)(
          ([v]) => `should render with ${v}`,
          async (page, [, { start, end, target, value }]) => {
            await common.expectChartAtUrlToMatchScreenshot(page)(
              `http://localhost:9001/?path=/story/bullet-graph--single&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-debug=&knob-title_General=Error rate&knob-subtitle_General=&knob-value_General=${value}&knob-target_General=${target}&knob-start_General=${start}&knob-end_General=${end}&knob-format (numeraljs)_General=0.[0]&knob-subtype_General=${subtype}&knob-niceDomain_Ticks=false&knob-tick strategy_Ticks=auto&knob-ticks(approx. count)_Ticks=10&knob-ticks(placements)_Ticks[0]=-200&knob-ticks(placements)_Ticks[1]=-100&knob-ticks(placements)_Ticks[2]=0&knob-ticks(placements)_Ticks[3]=5&knob-ticks(placements)_Ticks[4]=10&knob-ticks(placements)_Ticks[5]=15&knob-ticks(placements)_Ticks[6]=20&knob-ticks(placements)_Ticks[7]=25&knob-ticks(placements)_Ticks[8]=50&knob-ticks(placements)_Ticks[9]=100&knob-ticks(placements)_Ticks[10]=200`,
              {
                action: async () => await common.setResizeDimensions(page)({ height, width }),
              },
            );
          },
        );
      });
    },
  );
});
