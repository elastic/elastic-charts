/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PartitionLayout, SeriesType } from '../../packages/charts/src';
import { eachRotation } from '../helpers';
import { common } from '../page_objects';

describe('Test cases stories', () => {
  it('should render custom no results component', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/test-cases--no-series&knob-Show custom no results=true',
      {
        waitSelector: '.echReactiveChart_noResults .euiIcon:not(.euiIcon-isLoading)',
      },
    );
  });

  it('should render default no results component', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/test-cases--no-series&knob-Show custom no results=false',
      { waitSelector: '.echReactiveChart_noResults' },
    );
  });

  describe('annotation marker rotation', () => {
    eachRotation.it(async (rotation) => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/iframe.html?id=test-cases--no-axes-annotation-bug-fix&knob-horizontal marker position=undefined&knob-vertical marker position=undefined&knob-chartRotation=${rotation}`,
      );
    }, 'should render marker with annotations with %s degree rotations');
  });

  describe('RTL support', () => {
    describe.each([SeriesType.Bar, PartitionLayout.treemap, PartitionLayout.sunburst])('%s chart type', (type) => {
      describe.each(['HE', 'AR'])('lang %s', (lang) => {
        describe.each(['rtl', 'ltr', 'mostly-rtl', 'mostly-ltr'])('%s text', (charSet) => {
          it('should render with correct direction', async () => {
            await common.expectChartAtUrlToMatchScreenshot(
              `http://localhost:9001/?path=/story/test-cases--rtl-text&globals=background:white;theme:light&knob-Chart type=${type}&knob-character set=${charSet}&knob-show legend=true&knob-clockwiseSectors=true&knob-rtl language=${lang}`,
            );
          });

          if (type === PartitionLayout.sunburst) {
            it('should render with correct direction - clockwiseSectors', async () => {
              await common.expectChartAtUrlToMatchScreenshot(
                `http://localhost:9001/?path=/story/test-cases--rtl-text&globals=background:white;theme:light&knob-Chart type=${type}&knob-character set=${charSet}&knob-show legend=true&knob-clockwiseSectors=false&knob-rtl language=${lang}`,
              );
            });
          }
        });
      });
    });
  });
});

describe('Occlusion of Points outside of chart domain', () => {
  it('should render line chart with points outside of domain correctly', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/test-cases--test-points-outside-of-domain&knob-series%20type=line',
    );
  });
  it('should render area chart with points outside of domain correclty', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/test-cases--test-points-outside-of-domain&knob-series%20type=area&knob-show%20y0Accessor=false',
    );
  });
  it('should render area chart with points outside of the domain with y0 accessor correctly', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/test-cases--test-points-outside-of-domain&knob-series%20type=areaknob-show%20y0Accessor=true',
    );
  });
});
