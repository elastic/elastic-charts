/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { computeChartElementSizesSelector } from './compute_chart_element_sizes';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { horizontalPad } from '../../../../utils/dimensions';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';

jest.mock('../../../../utils/bbox/canvas_text_bbox_calculator', () => {
  const actual = jest.requireActual('../../../../utils/bbox/canvas_text_bbox_calculator');
  return {
    ...actual,
    withTextMeasure: (
      fun: (measure: (text: string, font: unknown, fontSize: number) => { width: number; height: number }) => unknown,
    ) => fun((text: string, _font: unknown, fontSize: number) => ({ width: text.length * 7, height: fontSize })),
  };
});

const CHAR_WIDTH = 7;
const LABEL = 'Category';
const LABEL_COUNT = 10;
const CONTAINER = { width: 900, height: 300, top: 0, left: 0 };

describe('computeAxesSizesSelector', () => {
  const labelSpace = LABEL.length * CHAR_WIDTH + horizontalPad(LIGHT_THEME.heatmap.xAxisLabel.padding);

  const chartState = (left: number) => {
    const store = MockStore.default(CONTAINER);
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins({
          showLegend: false,
          theme: {
            chartPaddings: { left, right: 0, top: 0, bottom: 0 },
            chartMargins: { left, right: 0, top: 0, bottom: 0 },
          },
        }),
        MockSeriesSpec.heatmap({
          xScale: { type: ScaleType.Ordinal },
          xAxisShowOverlappingLabels: false,
          xAxisLabelFormatter: () => LABEL,
          yAxisLabelFormatter: () => 'Y',
          data: Array.from({ length: LABEL_COUNT }, (_, i) => ({ x: `x-${i}`, y: 'row', value: i })),
          xAccessor: 'x',
          yAccessor: 'y',
          valueAccessor: 'value',
        }),
      ],
      store,
    );
    return store.getState();
  };

  it('skips more x labels when left padding and margin shrink the panel', () => {
    const plain = chartState(0);
    const inset = chartState(250);
    const plainCadence = computeChartElementSizesSelector(plain).xAxisTickCadence;
    const insetCadence = computeChartElementSizesSelector(inset).xAxisTickCadence;
    const panelWidth = computeChartDimensionsSelector(inset).chartDimensions.width;

    expect(plainCadence).toBeGreaterThan(0);
    expect(insetCadence).toBeGreaterThan(plainCadence);
    expect((panelWidth / LABEL_COUNT) * insetCadence).toBeGreaterThanOrEqual(labelSpace);
  });
});
