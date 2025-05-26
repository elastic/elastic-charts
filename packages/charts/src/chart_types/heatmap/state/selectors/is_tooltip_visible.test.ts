/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from 'redux';

import { isTooltipVisibleSelector } from './is_tooltip_visible';
import * as tooltipInfo from './tooltip';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { onPointerMove } from '../../../../state/actions/mouse';
import type { GlobalChartState } from '../../../../state/chart_state';

jest.mock('./tooltip', () => ({
  getTooltipInfoSelector: jest.fn(),
}));

describe('isTooltipVisibleSelector', () => {
  let store: Store<GlobalChartState>;

  beforeEach(() => {
    jest.resetAllMocks();

    // By default use the real implementation in mocked version
    jest
      .mocked(tooltipInfo.getTooltipInfoSelector)
      .mockImplementation(jest.requireActual<typeof tooltipInfo>('./tooltip').getTooltipInfoSelector);

    store = MockStore.default({ width: 700, height: 300, top: 0, left: 0 }, 'chartId');
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins({
          legendPosition: 'right',
          theme: {
            heatmap: {
              xAxisLabel: {
                visible: false,
              },
              yAxisLabel: {
                visible: false,
              },
            },
          },
        }),
        MockSeriesSpec.heatmap({
          xScale: { type: ScaleType.Ordinal },
          data: [
            {
              name: 'Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1',
              unifiedY: '',
              value: 674,
            },
            {
              name: 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.50 Safari/534.24',
              unifiedY: '',
              value: 574,
            },
            {
              name: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)',
              unifiedY: '',
              value: 488,
            },
          ],
          xAccessor: 'name',
          yAccessor: 'unifiedY',
          valueAccessor: 'value',
          xSortPredicate: 'alphaAsc',
          ySortPredicate: 'dataIndex',
        }),
      ],
      store,
    );
  });

  it('should return visible: true when tooltip info is available', () => {
    store.dispatch(onPointerMove({ position: { x: 200, y: 150 }, time: 0 }));
    const state = store.getState();
    const result = isTooltipVisibleSelector(state);

    expect(result.visible).toBe(true);
  });

  it('should return visible: false when tooltip info values is an empty array', () => {
    store.dispatch(onPointerMove({ position: { x: 0, y: 150 }, time: 0 }));
    const state = store.getState();
    const result = isTooltipVisibleSelector(state);

    expect(result.visible).toBe(false);
  });

  it('should return visible: false when every element of the tooltipInfo values has isVisible: false', () => {
    jest.mocked(tooltipInfo.getTooltipInfoSelector).mockReturnValue({
      disableActions: true,
      header: null,
      values: [
        {
          color: 'transparent',
          datum: '',
          displayOnly: true,
          formattedValue: '',
          isHighlighted: false,
          isVisible: false,
          label: '',
          seriesIdentifier: { specId: 'testHeatmap', key: 'testHeatmap' },
          value: '',
        },
      ],
    });
    const state = store.getState();
    const result = isTooltipVisibleSelector(state);

    expect(result.visible).toBe(false);
  });
});
