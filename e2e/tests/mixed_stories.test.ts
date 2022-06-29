/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { test } from '@playwright/test';

import { Fit, StackMode, SeriesType } from '../constants';
import { pwEach } from '../helpers';
import { common } from '../page_objects';

test.describe('Mixed series stories', () => {
  test.describe('Fitting functions', () => {
    test.describe('Area charts - no endValue', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=none&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    test.describe('Area charts - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    test.describe('Area charts - endValue set to "nearest"', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=nearest&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    test.describe('Area charts - with curved - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=1&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    test.describe('Area charts - Ordinal dataset - no endValue', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=area&knob-dataset=ordinal&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=none&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    test.describe('Line charts - no endValue', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=line&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=none&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    test.describe('Line charts - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=line&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    test.describe('Line charts - with curve - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=line&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=1&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });
  });

  test.describe('Fitting functions - Stacked charts', () => {
    test.describe('Area charts - no endValue', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=none&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    test.describe('Area charts - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    test.describe('Area charts - endValue set to "nearest"', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=nearest&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    test.describe('Area charts - with curved - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=1&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    test.describe('Area charts - Ordinal dataset - no endValue', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=ordinal&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=none&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });
  });

  test.describe('Fitting functions - Stacked charts - as percentage', () => {
    test.describe('Area charts - no endValue', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=none&knob-Explicit value (using Fit.Explicit)=8&knob-stackMode=percentage`,
          );
        });
      });
    });

    test.describe('Area charts - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8&knob-stackMode=percentage`,
          );
        });
      });
    });

    test.describe('Area charts - endValue set to "nearest"', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=nearest&knob-Explicit value (using Fit.Explicit)=8&knob-stackMode=percentage`,
          );
        });
      });
    });

    test.describe('Area charts - with curved - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=1&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8&knob-stackMode=percentage`,
          );
        });
      });
    });

    test.describe('Area charts - Ordinal dataset - no endValue', () => {
      Object.values(Fit).forEach((fitType) => {
        test(`should display correct fit for type - ${fitType}`, async ({ page }) => {
          await common.expectChartAtUrlToMatchScreenshot(page)(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=ordinal&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=none&knob-Explicit value (using Fit.Explicit)=8&knob-stackMode=percentage`,
          );
        });
      });
    });
  });

  pwEach.describe(Object.values(StackMode))(
    (m) => `Stack mode - ${m}`,
    (mode) => {
      pwEach.describe(['Mixed', 'Positive', 'Negative'])(
        (p) => `Polarity - ${p}`,
        (polarity) => {
          pwEach.describe([SeriesType.Bar, SeriesType.Area])(
            (t) => `${t} series`,
            (type) => {
              test('should display correct stacking', async ({ page }) => {
                await common.expectChartAtUrlToMatchScreenshot(page)(
                  `http://localhost:9001/?path=/story/mixed-charts--polarized-stacked&globals=theme:light&knob-stacked=true&knob-data polarity=${polarity}&knob-custom domain=false&knob-stackMode=${mode}&knob-SeriesType=${type}`,
                );
              });

              test('should show area chart with toggled series and mouse over', async ({ page }) => {
                const action = async () => {
                  await page.click('.echLegendItem:nth-child(2) .echLegendItem__label');
                };
                await common.expectChartWithMouseAtUrlToMatchScreenshot(page)(
                  `http://localhost:9001/?path=/story/mixed-charts--polarized-stacked&globals=theme:light&knob-stacked=true&knob-data polarity=${polarity}&knob-custom domain=false&knob-stackMode=${mode}&knob-SeriesType=${type}`,
                  { top: 170, left: 490 },
                  { action },
                );
              });
            },
          );
        },
      );
    },
  );
});
