/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { eachTheme, pwEach } from '../helpers';
import { common } from '../page_objects';

test.describe('Metric', () => {
  test('should render horizontal progress bar', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:light&knob-use progress bar=true&knob-progress bar direction=horizontal&knob-max trend data points=30&knob-layout=grid',
    );
  });
  test('should render no progress bar', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:light&knob-use progress bar=&knob-progress bar direction=horizontal&knob-max trend data points=30&knob-layout=grid',
    );
  });
  test('should render vertical progress bar in dark mode', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:dark&knob-layout=grid&knob-max trend data points=30&knob-progress bar direction=vertical&knob-use progress bar=true',
    );
  });
  test('should render horizontal progress bar in dark mode', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:dark&knob-layout=grid&knob-max trend data points=30&knob-progress bar direction=horizontal&knob-use progress bar=true',
    );
  });
  test('should render no progress bar in dark mode', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:dark&knob-layout=grid&knob-max trend data points=30&knob-progress bar direction=horizontal&knob-use progress bar=',
    );
  });
  test('text value with trend', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--basic&globals=theme:light&knob-EUI icon glyph name=warning&knob-color=rgba(166, 219, 208, 1)&knob-extra=1310 (-74% week before)&knob-is numeric metric=false&knob-progress bar direction=vertical&knob-progress max=100&knob-progress or trend=trend&knob-subtitle=&knob-title=Most used in&knob-trend a11y description=The trend shows a peak of CPU usage in the last 5 minutes&knob-trend a11y title=The Cluster CPU Usage trend&knob-trend data points=30&knob-trend shape=area&knob-value=United States&knob-value postfix=&knob-value prefix=&knob-show icon=',
    );
  });
  test('value icon and value color', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--basic&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-EUI icon glyph name=warning&knob-EUI value icon glyph name=sortUp&knob-color=rgba(255, 255, 255, 1)&knob-extra=last <b>5m</b>&knob-is numeric metric=true&knob-progress bar direction=vertical&knob-progress max=100&knob-progress or trend=trend&knob-show icon=true&knob-show value icon=true&knob-subtitle=host: 1dc4e&knob-title=Network out&knob-trend a11y description=The trend shows a peak of CPU usage in the last 5 minutes&knob-trend a11y title=The Cluster CPU Usage trend&knob-trend data points=30&knob-trend shape=area&knob-use value color=true&knob-value=55.23&knob-value color=rgba(189, 0, 0, 1)&knob-value postfix=GB&knob-value prefix=&knob-use blending background=&knob-blending background=rgba(255,255,255,1)&knob-value font mode=default&knob-value font size (px)=40&knob-title text-align=left&knob-values text-align=right&knob-icon align=right',
    );
  });
  test('should render with empty and missing background colors', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--grid&globals=theme:light;background:gray&knob-empty background=white&knob-number of columns=3',
    );
  });

  test('should render metric body contents', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--body-content',
      {
        maxDiffPixels: 5,
      },
    );
  });

  test('should render metric value fit font size', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      'http://localhost:9001/?path=/story/metric-alpha--array-of-values&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;theme:light&knob-Blue groupId_Annotations=primary&knob-Dataset_Legend=shortCopyDataset&knob-Domain axis_Annotations=y&knob-EUI icon glyph name=warning&knob-EUI value icon glyph name=sortUp&knob-Enable debug state=true&knob-FadeOnFocusingOthers_Animations=true&knob-Hide color picker_Legend=true&knob-Legend Value_Legend=median,min,max&knob-Legend position_Legend=right&knob-Number formatting precision_Legend=2&knob-Outside dimension_Annotations=4&knob-Popover position_Legend=leftCenter&knob-Red groupId_Annotations=primary&knob-Render outside chart_Annotations=true&knob-Scale type=linear&knob-Series type=area&knob-SeriesType=bar&knob-Tick size=10&knob-annotation count_Styles=6&knob-annotation opacity_Styles=0.5&knob-annotation zIndex_Styles=0&knob-attach click handler=true&knob-blending background=rgba(255,255,255,1)&knob-chartRotation=180&knob-empty background=transparent&knob-max trend data points=30&knob-number of columns=3&knob-value font mode=fit&knob-value font size (px)=40&knob-show grid border=&knob-debug randomized data=',
    );
  });

  test('small size with fixed font size', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      `http://localhost:9001/?path=/story/metric-alpha--basic&knob-value%20font%20mode=custom&knob-value%20font%20size%20(px)=100`,
      {
        action: async () => await common.setResizeDimensions(page)({ height: 180, width: 180 }),
      },
    );
  });
  test('small size with fit font size', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      `http://localhost:9001/?path=/story/metric-alpha--basic&knob-value%20font%20mode=fit&knob-value%20font%20size%20(px)=100`,
      {
        action: async () => await common.setResizeDimensions(page)({ height: 180, width: 180 }),
      },
    );
  });
  test('small size with default font size', async ({ page }) => {
    await common.expectChartAtUrlToMatchScreenshot(page)(
      `http://localhost:9001/?path=/story/metric-alpha--basic&knob-value%20font%20mode=default&knob-value%20font%20size%20(px)=100`,
      {
        action: async () => await common.setResizeDimensions(page)({ height: 180, width: 180 }),
      },
    );
  });

  test.describe('Extra badge props', () => {
    for (const breakpoint of ['small', 'big']) {
      for (const badge of ['icon', 'value', 'both']) {
        test(`extra badge with ${breakpoint} breakpoints with trend ${badge}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/metric-alpha--extra-badges&knob-Show%20breakpoints=${breakpoint}&knob-Trend%20option=${badge}`,
          );
        });
      }
    }
  });

  pwEach.describe(['trend', 'bar', 'none'])(
    (v) => `Metric - ${v} type`,
    (type) => {
      test('should render with blended background color', async ({ page }) => {
        await common.expectChartAtUrlToMatchScreenshot(page)(
          `http://localhost:9001/?path=/story/metric-alpha--basic&globals=toggles.showHeader:true;toggles.showChartTitle:false;toggles.showChartDescription:false;toggles.showChartBoundary:false;background:red;theme:light&knob-Config 1 - Color_Color Bands=rgba(245, 247, 250, 1)&knob-Config 2 - Palette_Color Bands=5&knob-Config 2 - Steps_Color Bands=5&knob-Config 3 - json_Color Bands={"steps":5,"colors":["pink","yellow","blue"]}&knob-Config 4 - json_Color Bands=[{"color":"red","gte":0,"lt":20},{"color":"green","gte":20,"lte":40},{"color":"blue","gt":40,"lte":{"type":"percentage","value":100}}]&knob-Domain padding unit=pixel&knob-EUI icon glyph name=warning&knob-EUI value icon glyph name=sortUp&knob-SeriesType=line&knob-Specs to fit (yDomain)=theshold,rect&knob-active tick step=0&knob-add series=true&knob-attach click handler=true&knob-bars padding=0.25&knob-blending background=rgba(255,255,255,1)&knob-color=rgba(51, 143, 200, 0.49)&knob-color config_Color Bands=2&knob-constrain padding=true&knob-dataset=both&knob-debug=true&knob-empty background=rgba(99, 69, 69, 0)&knob-enableHistogramMode=true&knob-end=100&knob-end_Domain=100&knob-end_General=100&knob-extra=last <b>5m</b>&knob-fit Y domain to data=true&knob-format=0&knob-format (numeraljs)_General=0.[0]&knob-hasHistogramBarSeries=true&knob-histogram padding=0.05&knob-is numeric metric=true&knob-max trend data points=30&knob-nice=true&knob-number of columns=4&knob-number of series=1&knob-other series=line&knob-point series alignment=center&knob-progress bar direction=vertical&knob-progress max=100&knob-progress or trend=${type}&knob-stacked=true&knob-start=-113&knob-start_Domain=0&knob-start_General=0&knob-subtitle=Cluster CPU usage&knob-subtitle_General=Lorem laborum nostrud consectetur&knob-subtype=two-thirds-circle&knob-subtype_General=vertical&knob-sync cursor=true&knob-target=75&knob-target_Domain=75&knob-target_General=75&knob-theshold - rect={"y0":100,"y1":null}&knob-thesholds - line=200&knob-tick label padding=10&knob-tick strategy_Ticks=auto&knob-tickFormat=0[.]00&knob-ticks(approx. count)_Ticks=5&knob-ticks(placements)_Ticks=-,2,0,,,5,,,1,0,,,1,5,,,0,2,0,,,2,5,,,5,0,,,1,0,0,0,,,2,0,0,,,-,1,0,0,,&knob-title=21d7f8b7-92ea-41a0-8c03-0db0ec7e11b9&knob-title_General=Ea consequat voluptate&knob-trend a11y description=The trend shows a peak of CPU usage in the last 5 minutes&knob-trend a11y title=The Cluster CPU Usage trend&knob-trend data points=30&knob-trend shape=area&knob-use blending background=true&knob-use custom minInterval of 30s=true&knob-use multilayer time axis=true&knob-use progress bar=true&knob-value=55.23&knob-value color=#3c3c3c&knob-value prefix=&knob-value postfix= %&knob-use value color=&knob-show icon=&knob-show value icon=`,
        );
      });

      eachTheme.describe(
        ({ urlParam }) => {
          const metricUrl = `http://localhost:9001/?path=/story/metric-alpha--basic&${urlParam}&knob-EUI icon glyph name=warning&knob-EUI value icon glyph name=sortUp&knob-color=rgba(157, 66, 66, 0.44)&knob-extra=last <b>5m</b>&knob-is numeric metric=true&knob-progress bar direction=vertical&knob-progress max=100&knob-progress or trend=${type}&knob-subtitle=Cluster CPU usage&knob-title=21d7f8b7-92ea-41a0-8c03-0db0ec7e11b9&knob-trend a11y description=The trend shows a peak of CPU usage in the last 5 minutes&knob-trend a11y title=The Cluster CPU Usage trend&knob-trend data points=30&knob-trend shape=area&knob-value=55.23&knob-value color=#3c3c3c&knob-value prefix=&knob-value postfix= %&knob-use value color=&knob-show icon=&knob-show value icon=`;
          test('should render metric with transparent bg color', async ({ page }) => {
            await common.expectChartAtUrlToMatchScreenshot(page)(metricUrl);
          });

          test('should render metric with hover interaction', async ({ page }) => {
            await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(metricUrl, { top: 100, left: 100 });
          });

          test('should render metric with click interaction', async ({ page }) => {
            await common.expectChartWithClickAtUrlToMatchScreenshot(page)(
              metricUrl,
              { top: 100, left: 100 },
              { delay: 10 }, // delay to capture click and hold
            );
          });
        },
        (t) => `${t} theme`,
      );
    },
  );
});
