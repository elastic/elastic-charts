/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Fit } from '../../packages/charts/src';
import { common } from '../page_objects';

describe('Mixed series stories', () => {
  describe('Fitting functions', () => {
    describe('Area charts - no endValue', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=none&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    describe('Area charts - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    describe('Area charts - endValue set to "nearest"', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=nearest&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    describe('Area charts - with curved - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=1&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    describe('Area charts - Ordinal dataset - no endValue', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=area&knob-dataset=ordinal&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=none&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    describe('Line charts - no endValue', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=line&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=none&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    describe('Line charts - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=line&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    describe('Line charts - with curve - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-non-stacked-series&knob-seriesType=line&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=1&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });
  });

  describe('Fitting functions - Stacked charts', () => {
    describe('Area charts - no endValue', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=none&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    describe('Area charts - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    describe('Area charts - endValue set to "nearest"', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=nearest&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    describe('Area charts - with curved - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=1&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });

    describe('Area charts - Ordinal dataset - no endValue', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=ordinal&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=none&knob-Explicit value (using Fit.Explicit)=8`,
          );
        });
      });
    });
  });

  describe('Fitting functions - Stacked charts - as percentage', () => {
    describe('Area charts - no endValue', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=none&knob-Explicit value (using Fit.Explicit)=8&knob-stackMode=percentage`,
          );
        });
      });
    });

    describe('Area charts - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8&knob-stackMode=percentage`,
          );
        });
      });
    });

    describe('Area charts - endValue set to "nearest"', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=nearest&knob-Explicit value (using Fit.Explicit)=8&knob-stackMode=percentage`,
          );
        });
      });
    });

    describe('Area charts - with curved - endValue set to 2', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=all&knob-fitting function=${fitType}&knob-Curve=1&knob-End value=2&knob-Explicit value (using Fit.Explicit)=8&knob-stackMode=percentage`,
          );
        });
      });
    });

    describe('Area charts - Ordinal dataset - no endValue', () => {
      Object.values(Fit).forEach((fitType) => {
        it(`should display correct fit for type - ${fitType}`, async () => {
          await common.expectChartAtUrlToMatchScreenshot(
            `http://localhost:9001/?path=/story/mixed-charts--fitting-functions-stacked-series&knob-seriesType=area&knob-dataset=ordinal&knob-fitting function=${fitType}&knob-Curve=0&knob-End value=none&knob-Explicit value (using Fit.Explicit)=8&knob-stackMode=percentage`,
          );
        });
      });
    });

    describe('Occlusion of Points outside of chart domain', () => {
      it('should render line chart with points outside of domain correctly', async () => {
        await common.expectChartAtUrlToMatchScreenshot(
          'http://localhost:9001/?path=/story/mixed-charts--test-points-outside-of-domain&globals=theme:light&knob-Axis%20title%20padding%20-%20inner_bottom=6&knob-Axis%20title%20padding%20-%20inner_left=6&knob-Axis%20title%20padding%20-%20inner_right=6&knob-Axis%20title%20padding%20-%20inner_shared=6&knob-Axis%20title%20padding%20-%20inner_top=6&knob-Axis%20title%20padding%20-%20outer_bottom=6&knob-Axis%20title%20padding%20-%20outer_left=6&knob-Axis%20title%20padding%20-%20outer_right=6&knob-Axis%20title%20padding%20-%20outer_shared=6&knob-Axis%20title%20padding%20-%20outer_top=6&knob-Enable%20debug%20state=true&knob-Persist%20cells%20selection=true&knob-Tick%20label%20offset%20reference_bottom=local&knob-Tick%20label%20offset%20reference_left=local&knob-Tick%20label%20offset%20reference_right=local&knob-Tick%20label%20offset%20reference_shared=local&knob-Tick%20label%20offset%20reference_top=local&knob-Tick%20label%20padding%20-%20inner_bottom=0&knob-Tick%20label%20padding%20-%20inner_left=0&knob-Tick%20label%20padding%20-%20inner_right=0&knob-Tick%20label%20padding%20-%20inner_shared=0&knob-Tick%20label%20padding%20-%20inner_top=0&knob-Tick%20label%20padding%20-%20outer_bottom=0&knob-Tick%20label%20padding%20-%20outer_left=0&knob-Tick%20label%20padding%20-%20outer_right=0&knob-Tick%20label%20padding%20-%20outer_shared=0&knob-Tick%20label%20padding%20-%20outer_top=0&knob-Tick%20label%20rotation_bottom=0&knob-Tick%20label%20rotation_left=0&knob-Tick%20label%20rotation_right=0&knob-Tick%20label%20rotation_shared=0&knob-Tick%20label%20rotation_top=0&knob-Tick%20label%20x%20offset_bottom=0&knob-Tick%20label%20x%20offset_left=0&knob-Tick%20label%20x%20offset_right=0&knob-Tick%20label%20x%20offset_shared=0&knob-Tick%20label%20x%20offset_top=0&knob-Tick%20label%20y%20offset_bottom=0&knob-Tick%20label%20y%20offset_left=0&knob-Tick%20label%20y%20offset_right=0&knob-Tick%20label%20y%20offset_shared=0&knob-Tick%20label%20y%20offset_top=0&knob-Tick%20line%20padding_bottom=10&knob-Tick%20line%20padding_left=10&knob-Tick%20line%20padding_right=10&knob-Tick%20line%20padding_shared=10&knob-Tick%20line%20padding_top=10&knob-Tick%20line%20size_bottom=10&knob-Tick%20line%20size_left=10&knob-Tick%20line%20size_right=10&knob-Tick%20line%20size_shared=10&knob-Tick%20line%20size_top=10&knob-annotation%20values=a,c&knob-data%20size=20&knob-data%20values=1.5,7.2&knob-debug=true&knob-debugState=true&knob-debug_general=true&knob-end%20time%20offset=0&knob-filter%20dataset=true&knob-margin%20bottom_general=10&knob-margin%20left_general=10&knob-margin%20right_general=10&knob-margin%20top_general=10&knob-markFormat=0.0&knob-markSizeRatio=30&knob-marker%20position=undefined&knob-max%20cell%20height_grid=30&knob-max%20fontSize_labels=10&knob-min%20cell%20height_grid=10&knob-min%20fontSize_labels=6&knob-number%20of%20groups=1&knob-padding%20bottom_general=0&knob-padding%20left_general=0&knob-padding%20right_general=0&knob-padding%20top_general=0&knob-series%20type=line&knob-show%20area=true&knob-show%20bar=true&knob-show%20line=true&knob-show%20y0Accessor=true&knob-show_labels=true&knob-start%20time%20offset=0&knob-use%20global%20min%20fontSize_labels=true&knob-x%20domain%20axis%20is%20bottom=true&knob-x1%20coordinate=1&knob-y-domain%20axis%20is%20Position.Left=true&knob-y0Accessor=true',
        );
      });
      it('should render area chart with points outside of domain correclty', async () => {
        await common.expectChartAtUrlToMatchScreenshot(
          'http://localhost:9001/?path=/story/mixed-charts--test-points-outside-of-domain&globals=theme:light&knob-Axis%20title%20padding%20-%20inner_bottom=6&knob-Axis%20title%20padding%20-%20inner_left=6&knob-Axis%20title%20padding%20-%20inner_right=6&knob-Axis%20title%20padding%20-%20inner_shared=6&knob-Axis%20title%20padding%20-%20inner_top=6&knob-Axis%20title%20padding%20-%20outer_bottom=6&knob-Axis%20title%20padding%20-%20outer_left=6&knob-Axis%20title%20padding%20-%20outer_right=6&knob-Axis%20title%20padding%20-%20outer_shared=6&knob-Axis%20title%20padding%20-%20outer_top=6&knob-Enable%20debug%20state=true&knob-Persist%20cells%20selection=true&knob-Tick%20label%20offset%20reference_bottom=local&knob-Tick%20label%20offset%20reference_left=local&knob-Tick%20label%20offset%20reference_right=local&knob-Tick%20label%20offset%20reference_shared=local&knob-Tick%20label%20offset%20reference_top=local&knob-Tick%20label%20padding%20-%20inner_bottom=0&knob-Tick%20label%20padding%20-%20inner_left=0&knob-Tick%20label%20padding%20-%20inner_right=0&knob-Tick%20label%20padding%20-%20inner_shared=0&knob-Tick%20label%20padding%20-%20inner_top=0&knob-Tick%20label%20padding%20-%20outer_bottom=0&knob-Tick%20label%20padding%20-%20outer_left=0&knob-Tick%20label%20padding%20-%20outer_right=0&knob-Tick%20label%20padding%20-%20outer_shared=0&knob-Tick%20label%20padding%20-%20outer_top=0&knob-Tick%20label%20rotation_bottom=0&knob-Tick%20label%20rotation_left=0&knob-Tick%20label%20rotation_right=0&knob-Tick%20label%20rotation_shared=0&knob-Tick%20label%20rotation_top=0&knob-Tick%20label%20x%20offset_bottom=0&knob-Tick%20label%20x%20offset_left=0&knob-Tick%20label%20x%20offset_right=0&knob-Tick%20label%20x%20offset_shared=0&knob-Tick%20label%20x%20offset_top=0&knob-Tick%20label%20y%20offset_bottom=0&knob-Tick%20label%20y%20offset_left=0&knob-Tick%20label%20y%20offset_right=0&knob-Tick%20label%20y%20offset_shared=0&knob-Tick%20label%20y%20offset_top=0&knob-Tick%20line%20padding_bottom=10&knob-Tick%20line%20padding_left=10&knob-Tick%20line%20padding_right=10&knob-Tick%20line%20padding_shared=10&knob-Tick%20line%20padding_top=10&knob-Tick%20line%20size_bottom=10&knob-Tick%20line%20size_left=10&knob-Tick%20line%20size_right=10&knob-Tick%20line%20size_shared=10&knob-Tick%20line%20size_top=10&knob-annotation%20values=a,c&knob-data%20size=20&knob-data%20values=1.5,7.2&knob-debug=true&knob-debugState=true&knob-debug_general=true&knob-end%20time%20offset=0&knob-filter%20dataset=true&knob-margin%20bottom_general=10&knob-margin%20left_general=10&knob-margin%20right_general=10&knob-margin%20top_general=10&knob-markFormat=0.0&knob-markSizeRatio=30&knob-marker%20position=undefined&knob-max%20cell%20height_grid=30&knob-max%20fontSize_labels=10&knob-min%20cell%20height_grid=10&knob-min%20fontSize_labels=6&knob-number%20of%20groups=1&knob-padding%20bottom_general=0&knob-padding%20left_general=0&knob-padding%20right_general=0&knob-padding%20top_general=0&knob-series%20type=line&knob-show%20area=true&knob-show%20bar=true&knob-show%20line=true&knob-show%20y0Accessor=true&knob-show_labels=true&knob-start%20time%20offset=0&knob-use%20global%20min%20fontSize_labels=true&knob-x%20domain%20axis%20is%20bottom=true&knob-x1%20coordinate=1&knob-y-domain%20axis%20is%20Position.Left=true&knob-y0Accessor=true',
        );
      });
      it('should render area chart with points outside of the domain with y0 accessor correctly', async () => {
        await common.expectChartAtUrlToMatchScreenshot(
          'http://localhost:9001/?path=/story/mixed-charts--test-points-outside-of-domain&globals=theme:light&knob-Axis%20title%20padding%20-%20inner_bottom=6&knob-Axis%20title%20padding%20-%20inner_left=6&knob-Axis%20title%20padding%20-%20inner_right=6&knob-Axis%20title%20padding%20-%20inner_shared=6&knob-Axis%20title%20padding%20-%20inner_top=6&knob-Axis%20title%20padding%20-%20outer_bottom=6&knob-Axis%20title%20padding%20-%20outer_left=6&knob-Axis%20title%20padding%20-%20outer_right=6&knob-Axis%20title%20padding%20-%20outer_shared=6&knob-Axis%20title%20padding%20-%20outer_top=6&knob-Enable%20debug%20state=true&knob-Persist%20cells%20selection=true&knob-Tick%20label%20offset%20reference_bottom=local&knob-Tick%20label%20offset%20reference_left=local&knob-Tick%20label%20offset%20reference_right=local&knob-Tick%20label%20offset%20reference_shared=local&knob-Tick%20label%20offset%20reference_top=local&knob-Tick%20label%20padding%20-%20inner_bottom=0&knob-Tick%20label%20padding%20-%20inner_left=0&knob-Tick%20label%20padding%20-%20inner_right=0&knob-Tick%20label%20padding%20-%20inner_shared=0&knob-Tick%20label%20padding%20-%20inner_top=0&knob-Tick%20label%20padding%20-%20outer_bottom=0&knob-Tick%20label%20padding%20-%20outer_left=0&knob-Tick%20label%20padding%20-%20outer_right=0&knob-Tick%20label%20padding%20-%20outer_shared=0&knob-Tick%20label%20padding%20-%20outer_top=0&knob-Tick%20label%20rotation_bottom=0&knob-Tick%20label%20rotation_left=0&knob-Tick%20label%20rotation_right=0&knob-Tick%20label%20rotation_shared=0&knob-Tick%20label%20rotation_top=0&knob-Tick%20label%20x%20offset_bottom=0&knob-Tick%20label%20x%20offset_left=0&knob-Tick%20label%20x%20offset_right=0&knob-Tick%20label%20x%20offset_shared=0&knob-Tick%20label%20x%20offset_top=0&knob-Tick%20label%20y%20offset_bottom=0&knob-Tick%20label%20y%20offset_left=0&knob-Tick%20label%20y%20offset_right=0&knob-Tick%20label%20y%20offset_shared=0&knob-Tick%20label%20y%20offset_top=0&knob-Tick%20line%20padding_bottom=10&knob-Tick%20line%20padding_left=10&knob-Tick%20line%20padding_right=10&knob-Tick%20line%20padding_shared=10&knob-Tick%20line%20padding_top=10&knob-Tick%20line%20size_bottom=10&knob-Tick%20line%20size_left=10&knob-Tick%20line%20size_right=10&knob-Tick%20line%20size_shared=10&knob-Tick%20line%20size_top=10&knob-annotation%20values=a,c&knob-data%20size=20&knob-data%20values=1.5,7.2&knob-debug=true&knob-debugState=true&knob-debug_general=true&knob-end%20time%20offset=0&knob-filter%20dataset=true&knob-margin%20bottom_general=10&knob-margin%20left_general=10&knob-margin%20right_general=10&knob-margin%20top_general=10&knob-markFormat=0.0&knob-markSizeRatio=30&knob-marker%20position=undefined&knob-max%20cell%20height_grid=30&knob-max%20fontSize_labels=10&knob-min%20cell%20height_grid=10&knob-min%20fontSize_labels=6&knob-number%20of%20groups=1&knob-padding%20bottom_general=0&knob-padding%20left_general=0&knob-padding%20right_general=0&knob-padding%20top_general=0&knob-series%20type=line&knob-show%20area=true&knob-show%20bar=true&knob-show%20line=true&knob-show%20y0Accessor=true&knob-show_labels=true&knob-start%20time%20offset=0&knob-use%20global%20min%20fontSize_labels=true&knob-x%20domain%20axis%20is%20bottom=true&knob-x1%20coordinate=1&knob-y-domain%20axis%20is%20Position.Left=true&knob-y0Accessor=true',
        );
      });
    });
  });
});
