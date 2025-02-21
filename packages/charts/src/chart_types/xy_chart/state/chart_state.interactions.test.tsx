/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable jest/no-conditional-expect */

import React from 'react';
import type { Store } from 'redux';

import { computeSeriesGeometriesSelector } from './selectors/compute_series_geometries';
import { getCursorBandPositionSelector } from './selectors/get_cursor_band';
import { getProjectedPointerPositionSelector } from './selectors/get_projected_pointer_position';
import {
  getHighlightedGeomsSelector,
  getHighlightedTooltipTooltipValuesSelector,
} from './selectors/get_tooltip_values_highlighted_geoms';
import { isTooltipVisibleSelector } from './selectors/is_tooltip_visible';
import { createOnBrushEndCaller } from './selectors/on_brush_end_caller';
import { createOnClickCaller } from './selectors/on_click_caller';
import { createOnElementOutCaller } from './selectors/on_element_out_caller';
import { createOnElementOverCaller } from './selectors/on_element_over_caller';
import { createOnPointerMoveCaller } from './selectors/on_pointer_move_caller';
import { ChartType } from '../..';
import { Icon } from '../../../components/icons/icon';
import type { Rect } from '../../../geoms/types';
import { MockAnnotationSpec, MockGlobalSpec, MockSeriesSpec } from '../../../mocks/specs/specs';
import { MockStore } from '../../../mocks/store';
import { ScaleType } from '../../../scales/constants';
import type { BrushEvent, SettingsSpec } from '../../../specs';
import { BrushAxis, TooltipType } from '../../../specs';
import { SpecType } from '../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { onExternalPointerEvent } from '../../../state/actions/events';
import { onPointerMove, onMouseDown, onMouseUp } from '../../../state/actions/mouse';
import type { GlobalChartState } from '../../../state/chart_state';
import { getSettingsSpecSelector } from '../../../state/selectors/get_settings_spec';
import type { RecursivePartial } from '../../../utils/common';
import { Position } from '../../../utils/common';
import type { AxisStyle } from '../../../utils/themes/theme';
import type { BarSeriesSpec, BasicSeriesSpec, AxisSpec } from '../utils/specs';
import { StackMode, SeriesType, AnnotationDomainType } from '../utils/specs';

const SPEC_ID = 'spec_1';
const GROUP_ID = 'group_1';

const ordinalBarSeries = MockSeriesSpec.bar({
  id: SPEC_ID,
  groupId: GROUP_ID,
  data: [
    [0, 10],
    [1, 5],
  ],
  xAccessor: 0,
  yAccessors: [1],
  xScaleType: ScaleType.Ordinal,
  yScaleType: ScaleType.Linear,
  hideInLegend: false,
});
const linearBarSeries = MockSeriesSpec.bar({
  chartType: ChartType.XYAxis,
  specType: SpecType.Series,
  id: SPEC_ID,
  groupId: GROUP_ID,
  seriesType: SeriesType.Bar,
  data: [
    [0, 10],
    [1, 5],
  ],
  xAccessor: 0,
  yAccessors: [1],
  xScaleType: ScaleType.Linear,
  yScaleType: ScaleType.Linear,
  hideInLegend: false,
});
const chartTop = 10;
const chartLeft = 10;
const settingSpec = MockGlobalSpec.settings({
  theme: {
    chartPaddings: { top: 0, left: 0, bottom: 0, right: 0 },
    chartMargins: { top: 10, left: 10, bottom: 0, right: 0 },
    scales: {
      barsPadding: 0,
    },
  },
});

function initStore(spec: BasicSeriesSpec) {
  const store = MockStore.default({ width: 100, height: 100, top: chartTop, left: chartLeft }, 'chartId');
  MockStore.addSpecs([settingSpec, spec], store);
  return store;
}

describe('Chart state pointer interactions', () => {
  let store: Store<GlobalChartState>;
  const onElementOutCaller = createOnElementOutCaller();
  const onElementOverCaller = createOnElementOverCaller();
  beforeEach(() => {
    store = initStore(ordinalBarSeries);
  });
  test('check initial geoms', () => {
    const { geometries } = computeSeriesGeometriesSelector(store.getState());
    expect(geometries).toBeDefined();
    expect(geometries.bars).toBeDefined();
    expect(geometries.bars[0]?.value.length).toBe(2);
  });

  test('can convert/limit mouse pointer positions relative to chart projection', () => {
    store.dispatch(onPointerMove({ position: { x: 20, y: 20 }, time: 0 }));
    let projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
    expect(projectedPointerPosition.x).toBe(10);
    expect(projectedPointerPosition.y).toBe(10);

    store.dispatch(onPointerMove({ position: { x: 10, y: 10 }, time: 1 }));
    projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
    expect(projectedPointerPosition.x).toBe(0);
    expect(projectedPointerPosition.y).toBe(0);
    store.dispatch(onPointerMove({ position: { x: 5, y: 5 }, time: 2 }));
    projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
    expect(projectedPointerPosition.x).toBe(-1);
    expect(projectedPointerPosition.y).toBe(-1);
    store.dispatch(onPointerMove({ position: { x: 200, y: 20 }, time: 3 }));
    projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
    expect(projectedPointerPosition.x).toBe(-1);
    expect(projectedPointerPosition.y).toBe(10);
    store.dispatch(onPointerMove({ position: { x: 20, y: 200 }, time: 4 }));
    projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
    expect(projectedPointerPosition.x).toBe(10);
    expect(projectedPointerPosition.y).toBe(-1);
    store.dispatch(onPointerMove({ position: { x: 200, y: 200 }, time: 5 }));
    projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
    expect(projectedPointerPosition.x).toBe(-1);
    expect(projectedPointerPosition.y).toBe(-1);
    store.dispatch(onPointerMove({ position: { x: -20, y: -20 }, time: 6 }));
    projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
    expect(projectedPointerPosition.x).toBe(-1);
    expect(projectedPointerPosition.y).toBe(-1);
  });

  test('call onElementOut if moving the mouse out from the chart', () => {
    const onOutListener = jest.fn((): undefined => undefined);
    const settingsWithListeners: SettingsSpec = {
      ...settingSpec,
      onElementOut: onOutListener,
    };

    MockStore.addSpecs([ordinalBarSeries, settingsWithListeners], store);
    // registering the out/over listener caller
    store.subscribe(() => {
      onElementOutCaller(store.getState());
      onElementOverCaller(store.getState());
    });
    store.dispatch(onPointerMove({ position: { x: 20, y: 20 }, time: 0 }));
    expect(onOutListener).toHaveBeenCalledTimes(0);

    // no more calls after the first out one outside chart
    store.dispatch(onPointerMove({ position: { x: 5, y: 5 }, time: 1 }));
    expect(onOutListener).toHaveBeenCalledTimes(1);
    store.dispatch(onPointerMove({ position: { x: 3, y: 3 }, time: 2 }));
    expect(onOutListener).toHaveBeenCalledTimes(1);
  });

  test('can respond to tooltip types changes', () => {
    MockStore.addSpecs(
      [
        ordinalBarSeries,
        settingSpec,
        MockGlobalSpec.tooltip({
          type: TooltipType.None,
        }),
      ],
      store,
    );
    store.dispatch(onPointerMove({ position: { x: 10, y: 10 + 70 }, time: 0 }));
    const tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
    // no tooltip values exist if we have a TooltipType === None
    expect(tooltipInfo.tooltip.values.length).toBe(0);
    let isTooltipVisible = isTooltipVisibleSelector(store.getState());
    expect(isTooltipVisible.visible).toBe(false);

    MockStore.addSpecs(
      [
        ordinalBarSeries,
        settingSpec,
        MockGlobalSpec.tooltip({
          type: TooltipType.Follow,
        }),
      ],
      store,
    );
    store.dispatch(onPointerMove({ position: { x: 10, y: 10 + 70 }, time: 1 }));
    const { geometriesIndex } = computeSeriesGeometriesSelector(store.getState());
    expect(geometriesIndex.size).toBe(2);
    const highlightedGeometries = getHighlightedGeomsSelector(store.getState());
    expect(highlightedGeometries.length).toBe(1);
    isTooltipVisible = isTooltipVisibleSelector(store.getState());
    expect(isTooltipVisible.visible).toBe(true);
  });

  describe.each([ScaleType.Ordinal, ScaleType.Linear])('mouse over with %s scale', (scaleType) => {
    let store: Store<GlobalChartState>;
    let onOverListener: jest.Mock;
    let onOutListener: jest.Mock;
    let onPointerUpdateListener: jest.Mock;
    const spec = scaleType === ScaleType.Ordinal ? ordinalBarSeries : linearBarSeries;

    beforeEach(() => {
      store = initStore(spec);
      onOverListener = jest.fn();
      onOutListener = jest.fn();
      onPointerUpdateListener = jest.fn();

      const settingsWithListeners: SettingsSpec = {
        ...settingSpec,
        onElementOver: onOverListener,
        onElementOut: onOutListener,
        onPointerUpdate: onPointerUpdateListener,
      };
      MockStore.addSpecs([spec, settingsWithListeners], store);
      const onElementOutCaller = createOnElementOutCaller();
      const onElementOverCaller = createOnElementOverCaller();
      const onPointerMoveCaller = createOnPointerMoveCaller();
      store.subscribe(() => {
        const state = store.getState();
        onElementOutCaller(state);
        onElementOverCaller(state);
        onPointerMoveCaller(state);
      });
      const tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo.tooltip.values).toEqual([]);
    });

    test('store is correctly configured', () => {
      // checking this to avoid broken tests due to nested describe and before
      const seriesGeoms = computeSeriesGeometriesSelector(store.getState());
      expect(seriesGeoms.scales.xScale).not.toBeUndefined();
      expect(seriesGeoms.scales.yScales).not.toBeUndefined();
    });

    it('should avoid calling pointer update listener if moving over the same element', () => {
      store.dispatch(onPointerMove({ position: { x: chartLeft + 10, y: chartTop + 10 }, time: 0 }));
      MockStore.flush(store);
      expect(onPointerUpdateListener).toHaveBeenCalledTimes(1);

      const tooltipInfo1 = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo1.tooltip.values.length).toBe(1);
      // avoid calls
      store.dispatch(onPointerMove({ position: { x: chartLeft + 12, y: chartTop + 12 }, time: 1 }));
      MockStore.flush(store);
      expect(onPointerUpdateListener).toHaveBeenCalledTimes(1);

      const tooltipInfo2 = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo2.tooltip.values.length).toBe(1);
      expect(tooltipInfo1).toEqual(tooltipInfo2);
    });

    it.skip('should avoid calling projection update listener if moving over the same element with same y', () => {
      MockStore.updateSettings(store, { pointerUpdateTrigger: 'y' });
      store.dispatch(onPointerMove({ position: { x: chartLeft + 10, y: chartTop + 10 }, time: 0 }));
      MockStore.flush(store);
      expect(onPointerUpdateListener).toHaveBeenCalledTimes(1);

      const tooltipInfo1 = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo1.tooltip.values.length).toBe(1);
      // avoid calls
      store.dispatch(onPointerMove({ position: { x: chartLeft + 12, y: chartTop + 10 }, time: 1 }));
      MockStore.flush(store);
      expect(onPointerUpdateListener).toHaveBeenCalledTimes(1);

      const tooltipInfo2 = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo2.tooltip.values.length).toBe(1);
      expect(tooltipInfo1).toEqual(tooltipInfo2);
    });

    it.skip('should call projection update listener if moving over the same element with differnt y', () => {
      store.dispatch(onPointerMove({ position: { x: chartLeft + 10, y: chartTop + 10 }, time: 0 }));
      MockStore.flush(store);
      expect(onPointerUpdateListener).toHaveBeenCalledTimes(1);
      expect(onPointerUpdateListener.mock.calls[0]?.[0]).toMatchObject({
        x: 0,
        y: [
          {
            groupId: 'group_1',
            value: 8.88888888888889,
          },
        ],
      });

      // avoid calls
      store.dispatch(onPointerMove({ position: { x: chartLeft + 10, y: chartTop + 11 }, time: 1 }));
      MockStore.flush(store);
      expect(onPointerUpdateListener).toHaveBeenCalledTimes(2);
      expect(onPointerUpdateListener.mock.calls[1][0]).toMatchObject({
        x: 0,
        y: [
          {
            groupId: 'group_1',
            value: 8.777777777777779,
          },
        ],
      });
    });

    it('should call pointer update listeners on move', () => {
      store.dispatch(onPointerMove({ position: { x: chartLeft + 10, y: chartTop + 10 }, time: 0 }));
      MockStore.flush(store);
      expect(onPointerUpdateListener).toHaveBeenCalledTimes(1);
      expect(onPointerUpdateListener).toHaveBeenCalledWith({
        chartId: 'chartId',
        scale: scaleType,
        type: 'Over',
        unit: undefined,
        x: 0,
        y: [
          {
            groupId: 'group_1',
            value: 8.88888888888889,
          },
        ],
        smVerticalValue: null,
        smHorizontalValue: null,
      });

      // avoid multiple calls for the same value
      store.dispatch(onPointerMove({ position: { x: chartLeft + 50, y: chartTop + 11 }, time: 1 }));
      MockStore.flush(store);
      expect(onPointerUpdateListener).toHaveBeenCalledTimes(2);

      expect(onPointerUpdateListener.mock.calls[1][0]).toEqual({
        chartId: 'chartId',
        scale: scaleType,
        type: 'Over',
        unit: undefined,
        x: 1,
        y: [
          {
            groupId: 'group_1',
            value: 8.777777777777779,
          },
        ],
        smVerticalValue: null,
        smHorizontalValue: null,
      });

      store.dispatch(onPointerMove({ position: { x: chartLeft + 200, y: chartTop + 12 }, time: 1 }));
      MockStore.flush(store);
      expect(onPointerUpdateListener).toHaveBeenCalledTimes(3);
      expect(onPointerUpdateListener.mock.calls[2][0]).toEqual({
        chartId: 'chartId',
        type: 'Out',
      });
    });

    test('handle only external pointer update', () => {
      store.dispatch(
        onExternalPointerEvent({
          chartId: 'chartId',
          scale: scaleType,
          type: 'Over',
          unit: undefined,
          x: 0,
          y: [],
          smVerticalValue: null,
          smHorizontalValue: null,
        }),
      );
      let cursorBandPosition = getCursorBandPositionSelector(store.getState());
      expect(cursorBandPosition).toBeUndefined();

      store.dispatch(
        onExternalPointerEvent({
          chartId: 'differentChart',
          scale: scaleType,
          type: 'Over',
          unit: undefined,
          x: 0,
          y: [],
          smVerticalValue: null,
          smHorizontalValue: null,
        }),
      );
      cursorBandPosition = getCursorBandPositionSelector(store.getState());
      expect(cursorBandPosition).toBeDefined();
    });

    test.skip('can determine which tooltip to display if chart & annotation tooltips possible', () => {
      // const annotationDimensions = [{ rect: { x: 49, y: -1, width: 3, height: 99 } }];
      // const rectAnnotationSpec: RectAnnotationSpec = {
      //   id: 'rect',
      //   groupId: GROUP_ID,
      //   annotationType: 'rectangle',
      //   dataValues: [{ coordinates: { x0: 1, x1: 1.5, y0: 0.5, y1: 10 } }],
      // };
      // store.annotationSpecs.set(rectAnnotationSpec.annotationId, rectAnnotationSpec);
      // store.annotationDimensions.set(rectAnnotationSpec.annotationId, annotationDimensions);
      // debugger;
      // // isHighlighted false, chart tooltip true; should show annotationTooltip only
      // store.setCursorPosition(chartLeft + 51, chartTop + 1);
      // expect(store.isTooltipVisible.get()).toBe(false);
    });

    test('can hover top-left corner of the first bar', () => {
      let tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo.tooltip.values).toEqual([]);
      store.dispatch(onPointerMove({ position: { x: chartLeft + 0, y: chartTop + 0 }, time: 0 }));
      let projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
      expect(projectedPointerPosition).toMatchObject({ x: 0, y: 0 });
      const cursorBandPosition = getCursorBandPositionSelector(store.getState());
      expect(cursorBandPosition).toBeDefined();
      expect((cursorBandPosition as Rect).x).toBe(chartLeft + 0);
      expect((cursorBandPosition as Rect).width).toBe(45);
      let isTooltipVisible = isTooltipVisibleSelector(store.getState());
      expect(isTooltipVisible.visible).toBe(true);
      tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo.tooltip.values.length).toBe(1);
      expect(tooltipInfo.highlightedGeometries.length).toBe(1);
      expect(onOverListener).toHaveBeenCalledTimes(1);
      expect(onOutListener).toHaveBeenCalledTimes(0);
      expect(onOverListener).toHaveBeenCalledWith([
        [
          {
            x: 0,
            y: 10,
            accessor: 'y1',
            mark: null,
            datum: [0, 10],
          },
          {
            key: 'groupId{group_1}spec{spec_1}yAccessor{1}splitAccessors{}',
            seriesKeys: [1],
            specId: 'spec_1',
            splitAccessors: new Map(),
            xAccessor: 0,
            yAccessor: 1,
          },
        ],
      ]);

      store.dispatch(onPointerMove({ position: { x: chartLeft - 1, y: chartTop - 1 }, time: 1 }));
      projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
      expect(projectedPointerPosition).toMatchObject({ x: -1, y: -1 });
      isTooltipVisible = isTooltipVisibleSelector(store.getState());
      expect(isTooltipVisible.visible).toBe(false);
      tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo.tooltip.values.length).toBe(0);
      expect(tooltipInfo.highlightedGeometries.length).toBe(0);
      expect(onOverListener).toHaveBeenCalledTimes(1);
      expect(onOutListener).toHaveBeenCalledTimes(1);
    });

    test('can hover bottom-left corner of the first bar', () => {
      store.dispatch(onPointerMove({ position: { x: chartLeft + 0, y: chartTop + 89 }, time: 0 }));
      let projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
      expect(projectedPointerPosition).toMatchObject({ x: 0, y: 89 });
      const cursorBandPosition = getCursorBandPositionSelector(store.getState());
      expect(cursorBandPosition).toBeDefined();
      expect((cursorBandPosition as Rect).x).toBe(chartLeft + 0);
      expect((cursorBandPosition as Rect).width).toBe(45);
      let isTooltipVisible = isTooltipVisibleSelector(store.getState());
      expect(isTooltipVisible.visible).toBe(true);
      let tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo.highlightedGeometries.length).toBe(1);
      expect(tooltipInfo.tooltip.values.length).toBe(1);
      expect(onOverListener).toHaveBeenCalledTimes(1);
      expect(onOutListener).toHaveBeenCalledTimes(0);
      expect(onOverListener).toHaveBeenCalledWith([
        [
          {
            x: 0,
            y: 10,
            accessor: 'y1',
            mark: null,
            datum: [0, 10],
          },
          {
            key: 'groupId{group_1}spec{spec_1}yAccessor{1}splitAccessors{}',
            seriesKeys: [1],
            specId: 'spec_1',
            splitAccessors: new Map(),
            xAccessor: 0,
            yAccessor: 1,
          },
        ],
      ]);
      store.dispatch(onPointerMove({ position: { x: chartLeft - 1, y: chartTop + 89 }, time: 1 }));
      projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
      expect(projectedPointerPosition).toMatchObject({ x: -1, y: 89 });
      isTooltipVisible = isTooltipVisibleSelector(store.getState());
      expect(isTooltipVisible.visible).toBe(false);
      tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo.tooltip.values.length).toBe(0);
      expect(tooltipInfo.highlightedGeometries.length).toBe(0);
      expect(onOverListener).toHaveBeenCalledTimes(1);
      expect(onOutListener).toHaveBeenCalledTimes(1);
    });

    test('can hover top-right corner of the first bar', () => {
      let scaleOffset = 0;
      if (scaleType !== ScaleType.Ordinal) {
        scaleOffset = 1;
      }
      store.dispatch(onPointerMove({ position: { x: chartLeft + 44 + scaleOffset, y: chartTop + 0 }, time: 0 }));
      let projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
      expect(projectedPointerPosition).toMatchObject({ x: 44 + scaleOffset, y: 0 });
      let cursorBandPosition = getCursorBandPositionSelector(store.getState());
      expect(cursorBandPosition).toBeDefined();
      expect((cursorBandPosition as Rect).x).toBe(chartLeft + 0);
      expect((cursorBandPosition as Rect).width).toBe(45);
      let isTooltipVisible = isTooltipVisibleSelector(store.getState());
      expect(isTooltipVisible.visible).toBe(true);
      let tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo.highlightedGeometries.length).toBe(1);
      expect(tooltipInfo.tooltip.values.length).toBe(1);
      expect(onOverListener).toHaveBeenCalledTimes(1);
      expect(onOutListener).toHaveBeenCalledTimes(0);
      expect(onOverListener).toHaveBeenCalledWith([
        [
          {
            x: 0,
            y: 10,
            accessor: 'y1',
            mark: null,
            datum: [0, 10],
          },
          {
            key: 'groupId{group_1}spec{spec_1}yAccessor{1}splitAccessors{}',
            seriesKeys: [1],
            specId: 'spec_1',
            splitAccessors: new Map(),
            xAccessor: 0,
            yAccessor: 1,
          },
        ],
      ]);

      store.dispatch(onPointerMove({ position: { x: chartLeft + 45 + scaleOffset, y: chartTop + 0 }, time: 1 }));
      projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
      expect(projectedPointerPosition).toMatchObject({ x: 45 + scaleOffset, y: 0 });
      cursorBandPosition = getCursorBandPositionSelector(store.getState());
      expect(cursorBandPosition).toBeDefined();
      expect((cursorBandPosition as Rect).x).toBe(chartLeft + 45);
      expect((cursorBandPosition as Rect).width).toBe(45);
      isTooltipVisible = isTooltipVisibleSelector(store.getState());
      expect(isTooltipVisible.visible).toBe(true);
      tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo.tooltip.values.length).toBe(1);
      expect(tooltipInfo.highlightedGeometries.length).toBe(0);
      expect(onOverListener).toHaveBeenCalledTimes(1);
      expect(onOutListener).toHaveBeenCalledTimes(1);
    });

    test('can hover bottom-right corner of the first bar', () => {
      let scaleOffset = 0;
      if (scaleType !== ScaleType.Ordinal) {
        scaleOffset = 1;
      }
      store.dispatch(onPointerMove({ position: { x: chartLeft + 44 + scaleOffset, y: chartTop + 89 }, time: 0 }));
      let projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
      expect(projectedPointerPosition).toMatchObject({ x: 44 + scaleOffset, y: 89 });
      let cursorBandPosition = getCursorBandPositionSelector(store.getState());
      expect(cursorBandPosition).toBeDefined();
      expect((cursorBandPosition as Rect).x).toBe(chartLeft + 0);
      expect((cursorBandPosition as Rect).width).toBe(45);
      let isTooltipVisible = isTooltipVisibleSelector(store.getState());
      expect(isTooltipVisible.visible).toBe(true);
      let tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo.highlightedGeometries.length).toBe(1);
      expect(tooltipInfo.tooltip.values.length).toBe(1);
      expect(onOverListener).toHaveBeenCalledTimes(1);
      expect(onOutListener).toHaveBeenCalledTimes(0);
      expect(onOverListener).toHaveBeenCalledWith([
        [
          {
            x: (spec.data[0] as Array<any>)[0],
            y: (spec.data[0] as Array<any>)[1],
            accessor: 'y1',
            mark: null,
            datum: [(spec.data[0] as Array<any>)[0], (spec.data[0] as Array<any>)[1]],
          },
          {
            key: 'groupId{group_1}spec{spec_1}yAccessor{1}splitAccessors{}',
            seriesKeys: [1],
            specId: 'spec_1',
            splitAccessors: new Map(),
            xAccessor: 0,
            yAccessor: 1,
          },
        ],
      ]);

      store.dispatch(onPointerMove({ position: { x: chartLeft + 45 + scaleOffset, y: chartTop + 89 }, time: 1 }));
      projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
      expect(projectedPointerPosition).toMatchObject({ x: 45 + scaleOffset, y: 89 });
      cursorBandPosition = getCursorBandPositionSelector(store.getState());
      expect(cursorBandPosition).toBeDefined();
      expect((cursorBandPosition as Rect).x).toBe(chartLeft + 45);
      expect((cursorBandPosition as Rect).width).toBe(45);
      isTooltipVisible = isTooltipVisibleSelector(store.getState());
      expect(isTooltipVisible.visible).toBe(true);
      tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo.tooltip.values.length).toBe(1);
      // we are over the second bar here
      expect(tooltipInfo.highlightedGeometries.length).toBe(1);
      expect(onOverListener).toHaveBeenCalledTimes(2);
      expect(onOverListener.mock.calls[1][0]).toEqual([
        [
          {
            x: (spec.data[1] as Array<any>)[0],
            y: (spec.data[1] as Array<any>)[1],
            accessor: 'y1',
            mark: null,
            datum: [(spec.data[1] as Array<any>)[0], (spec.data[1] as Array<any>)[1]],
          },
          {
            key: 'groupId{group_1}spec{spec_1}yAccessor{1}splitAccessors{}',
            seriesKeys: [1],
            specId: 'spec_1',
            splitAccessors: new Map(),
            xAccessor: 0,
            yAccessor: 1,
          },
        ],
      ]);

      expect(onOutListener).toHaveBeenCalledTimes(0);

      store.dispatch(onPointerMove({ position: { x: chartLeft + 47 + scaleOffset, y: chartTop + 89 }, time: 2 }));
    });

    test('can hover top-right corner of the chart', () => {
      expect(onOverListener).toHaveBeenCalledTimes(0);
      expect(onOutListener).toHaveBeenCalledTimes(0);
      let tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo.highlightedGeometries.length).toBe(0);
      expect(tooltipInfo.tooltip.values.length).toBe(0);

      store.dispatch(onPointerMove({ position: { x: chartLeft + 89, y: chartTop + 0 }, time: 0 }));
      const projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
      expect(projectedPointerPosition).toMatchObject({ x: 89, y: 0 });
      const cursorBandPosition = getCursorBandPositionSelector(store.getState());
      expect(cursorBandPosition).toBeDefined();
      expect((cursorBandPosition as Rect).x).toBe(chartLeft + 45);
      expect((cursorBandPosition as Rect).width).toBe(45);

      const isTooltipVisible = isTooltipVisibleSelector(store.getState());
      expect(isTooltipVisible.visible).toBe(true);
      tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo.highlightedGeometries.length).toBe(0);
      expect(tooltipInfo.tooltip.values.length).toBe(1);
      expect(onOverListener).toHaveBeenCalledTimes(0);
      expect(onOutListener).toHaveBeenCalledTimes(0);
    });

    test('will call only one time the listener with the same values', () => {
      expect(onOverListener).toHaveBeenCalledTimes(0);
      expect(onOutListener).toHaveBeenCalledTimes(0);
      let halfWidth = 45;
      if (scaleType !== ScaleType.Ordinal) {
        halfWidth = 46;
      }
      let timeCounter = 0;
      for (let i = 0; i < halfWidth; i++) {
        store.dispatch(onPointerMove({ position: { x: chartLeft + i, y: chartTop + 89 }, time: timeCounter }));
        expect(onOverListener).toHaveBeenCalledTimes(1);
        expect(onOutListener).toHaveBeenCalledTimes(0);
        timeCounter++;
      }
      for (let i = halfWidth; i < 90; i++) {
        store.dispatch(onPointerMove({ position: { x: chartLeft + i, y: chartTop + 89 }, time: timeCounter }));
        expect(onOverListener).toHaveBeenCalledTimes(2);
        expect(onOutListener).toHaveBeenCalledTimes(0);
        timeCounter++;
      }
      for (let i = 0; i < halfWidth; i++) {
        store.dispatch(onPointerMove({ position: { x: chartLeft + i, y: chartTop + 0 }, time: timeCounter }));
        expect(onOverListener).toHaveBeenCalledTimes(3);
        expect(onOutListener).toHaveBeenCalledTimes(0);
        timeCounter++;
      }
      for (let i = halfWidth; i < 90; i++) {
        store.dispatch(onPointerMove({ position: { x: chartLeft + i, y: chartTop + 0 }, time: timeCounter }));
        expect(onOverListener).toHaveBeenCalledTimes(3);
        expect(onOutListener).toHaveBeenCalledTimes(1);
        timeCounter++;
      }
    });

    test('can hover bottom-right corner of the chart', () => {
      store.dispatch(onPointerMove({ position: { x: chartLeft + 89, y: chartTop + 89 }, time: 0 }));
      const projectedPointerPosition = getProjectedPointerPositionSelector(store.getState());
      // store.setCursorPosition(chartLeft + 99, chartTop + 99);
      expect(projectedPointerPosition).toMatchObject({ x: 89, y: 89 });
      const cursorBandPosition = getCursorBandPositionSelector(store.getState());
      expect(cursorBandPosition).toBeDefined();
      expect((cursorBandPosition as Rect).x).toBe(chartLeft + 45);
      expect((cursorBandPosition as Rect).width).toBe(45);
      const isTooltipVisible = isTooltipVisibleSelector(store.getState());
      expect(isTooltipVisible.visible).toBe(true);
      const tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
      expect(tooltipInfo.highlightedGeometries.length).toBe(1);
      expect(tooltipInfo.tooltip.values.length).toBe(1);
      expect(onOverListener).toHaveBeenCalledTimes(1);
      expect(onOverListener).toHaveBeenCalledWith([
        [
          {
            x: 1,
            y: 5,
            accessor: 'y1',
            mark: null,
            datum: [1, 5],
          },
          {
            key: 'groupId{group_1}spec{spec_1}yAccessor{1}splitAccessors{}',
            seriesKeys: [1],
            specId: 'spec_1',
            splitAccessors: new Map(),
            xAccessor: 0,
            yAccessor: 1,
          },
        ],
      ]);
      expect(onOutListener).toHaveBeenCalledTimes(0);
    });

    describe.skip('can position tooltip within chart when xScale is a single value scale', () => {
      beforeEach(() => {
        // const singleValueScale =
        //   store.xScale!.type === ScaleType.Ordinal
        //     ? new ScaleBand(['a'], [0, 0])
        //     : new ScaleContinuous({ type: ScaleType.Linear, domain: [1, 1], range: [0, 0] });
        // store.xScale = singleValueScale;
      });
      test.skip('horizontal chart rotation', () => {
        // store.setCursorPosition(chartLeft + 99, chartTop + 99);
        // const expectedTransform = `translateX(${chartLeft}px) translateX(-0%) translateY(109px) translateY(-100%)`;
        // expect(store.tooltipPosition.transform).toBe(expectedTransform);
      });

      test.skip('vertical chart rotation', () => {
        // store.chartRotation = 90;
        // store.setCursorPosition(chartLeft + 99, chartTop + 99);
        // const expectedTransform = `translateX(109px) translateX(-100%) translateY(${chartTop}px) translateY(-0%)`;
        // expect(store.tooltipPosition.transform).toBe(expectedTransform);
      });
    });
    describe('can format tooltip values on rotated chart', () => {
      let leftAxis: AxisSpec;
      let bottomAxis: AxisSpec;
      let currentSettingSpec: SettingsSpec;
      const style: RecursivePartial<AxisStyle> = {
        tickLine: {
          size: 0,
          padding: 0,
        },
      };
      beforeEach(() => {
        leftAxis = {
          chartType: ChartType.XYAxis,
          specType: SpecType.Axis,
          hide: true,
          id: 'yaxis',
          groupId: GROUP_ID,
          position: Position.Left,
          tickFormat: (value) => `left ${Number(value)}`,
          showOverlappingLabels: false,
          showOverlappingTicks: false,
          style,
          timeAxisLayerCount: 0,
        };
        bottomAxis = {
          chartType: ChartType.XYAxis,
          specType: SpecType.Axis,
          hide: true,
          id: 'xaxis',
          groupId: GROUP_ID,
          position: Position.Bottom,
          tickFormat: (value) => `bottom ${Number(value)}`,
          showOverlappingLabels: false,
          showOverlappingTicks: false,
          style,
          timeAxisLayerCount: 0,
        };
        currentSettingSpec = getSettingsSpecSelector(store.getState());
      });

      test('chart 0 rotation', () => {
        MockStore.addSpecs([spec, leftAxis, bottomAxis, currentSettingSpec], store);
        store.dispatch(onPointerMove({ position: { x: chartLeft + 0, y: chartTop + 89 }, time: 0 }));
        const tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
        expect(tooltipInfo.tooltip.header?.value).toBe(0);
        expect(tooltipInfo.tooltip.header?.formattedValue).toBe('bottom 0');
        expect(tooltipInfo.tooltip.values[0]?.value).toBe(10);
        expect(tooltipInfo.tooltip.values[0]?.formattedValue).toBe('left 10');
      });

      test('chart 90 deg rotated', () => {
        const updatedSettings: SettingsSpec = {
          ...currentSettingSpec,
          rotation: 90,
        };
        MockStore.addSpecs([spec, leftAxis, bottomAxis, updatedSettings], store);

        store.dispatch(onPointerMove({ position: { x: chartLeft + 0, y: chartTop + 89 }, time: 0 }));
        const tooltipInfo = getHighlightedTooltipTooltipValuesSelector(store.getState());
        expect(tooltipInfo.tooltip.header?.value).toBe(1);
        expect(tooltipInfo.tooltip.header?.formattedValue).toBe('left 1');
        expect(tooltipInfo.tooltip.values[0]?.value).toBe(5);
        expect(tooltipInfo.tooltip.values[0]?.formattedValue).toBe('bottom 5');
      });
    });
    describe('brush', () => {
      test('can respond to a brush end event', () => {
        const brushEndListener = jest.fn<void, [BrushEvent]>((): void => undefined);
        const onBrushCaller = createOnBrushEndCaller();
        store.subscribe(() => {
          onBrushCaller(store.getState());
        });
        const settings = getSettingsSpecSelector(store.getState());
        const updatedSettings: SettingsSpec = {
          ...settings,
          theme: {
            ...settings.theme,
            chartMargins: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            },
          },
          onBrushEnd: brushEndListener,
        };
        MockStore.addSpecs(
          [
            {
              ...spec,
              data: [
                [0, 1],
                [1, 1],
                [2, 2],
                [3, 3],
              ],
            } as BarSeriesSpec,
            updatedSettings,
          ],
          store,
        );

        const start1 = { x: 0, y: 0 };
        const end1 = { x: 75, y: 0 };

        store.dispatch(onMouseDown({ position: start1, time: 0 }));
        store.dispatch(onPointerMove({ position: end1, time: 200 }));
        store.dispatch(onMouseUp({ position: end1, time: 300 }));
        if (scaleType === ScaleType.Ordinal) {
          expect(brushEndListener).not.toHaveBeenCalled();
        } else {
          expect(brushEndListener).toHaveBeenCalled();
          expect(brushEndListener).toHaveBeenCalledWith({ x: [0, 2.5] });
        }
        const start2 = { x: 75, y: 0 };
        const end2 = { x: 100, y: 0 };

        store.dispatch(onMouseDown({ position: start2, time: 400 }));
        store.dispatch(onPointerMove({ position: end2, time: 500 }));
        store.dispatch(onMouseUp({ position: end2, time: 600 }));
        if (scaleType === ScaleType.Ordinal) {
          expect(brushEndListener).not.toHaveBeenCalled();
        } else {
          expect(brushEndListener).toHaveBeenCalled();
          expect(brushEndListener.mock.calls[1]?.[0]).toEqual({ x: [2.5, 3] });
        }

        const start3 = { x: 75, y: 0 };
        const end3 = { x: 250, y: 0 };
        store.dispatch(onMouseDown({ position: start3, time: 700 }));
        store.dispatch(onPointerMove({ position: end3, time: 800 }));
        store.dispatch(onMouseUp({ position: end3, time: 900 }));
        if (scaleType === ScaleType.Ordinal) {
          expect(brushEndListener).not.toHaveBeenCalled();
        } else {
          expect(brushEndListener).toHaveBeenCalled();
          expect(brushEndListener.mock.calls[2]?.[0]).toEqual({ x: [2.5, 3] });
        }

        const start4 = { x: 25, y: 0 };
        const end4 = { x: -20, y: 0 };
        store.dispatch(onMouseDown({ position: start4, time: 1000 }));
        store.dispatch(onPointerMove({ position: end4, time: 1100 }));
        store.dispatch(onMouseUp({ position: end4, time: 1200 }));
        if (scaleType === ScaleType.Ordinal) {
          expect(brushEndListener).not.toHaveBeenCalled();
        } else {
          expect(brushEndListener).toHaveBeenCalled();
          expect(brushEndListener.mock.calls[3]?.[0]).toEqual({ x: [0, 0.5] });
        }

        store.dispatch(onMouseDown({ position: { x: 25, y: 0 }, time: 1300 }));
        store.dispatch(onPointerMove({ position: { x: 28, y: 0 }, time: 1390 }));
        store.dispatch(onMouseUp({ position: { x: 28, y: 0 }, time: 1400 }));
        if (scaleType === ScaleType.Ordinal) {
          expect(brushEndListener).not.toHaveBeenCalled();
        } else {
          expect(brushEndListener.mock.calls[4]).toBeUndefined();
        }
      });
      test('can respond to a brush end event on rotated chart', () => {
        const brushEndListener = jest.fn<void, [BrushEvent]>((): void => undefined);
        const onBrushCaller = createOnBrushEndCaller();
        store.subscribe(() => {
          onBrushCaller(store.getState());
        });
        const settings = getSettingsSpecSelector(store.getState());
        const updatedSettings: SettingsSpec = {
          ...settings,
          rotation: 90,
          theme: {
            ...settings.theme,
            chartMargins: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            },
          },
          onBrushEnd: brushEndListener,
        };
        MockStore.addSpecs([spec, updatedSettings], store);

        const start1 = { x: 0, y: 25 };
        const end1 = { x: 0, y: 75 };

        store.dispatch(onMouseDown({ position: start1, time: 0 }));
        store.dispatch(onPointerMove({ position: end1, time: 100 }));
        store.dispatch(onMouseUp({ position: end1, time: 200 }));
        if (scaleType === ScaleType.Ordinal) {
          expect(brushEndListener).not.toHaveBeenCalled();
        } else {
          expect(brushEndListener).toHaveBeenCalled();
          expect(brushEndListener).toHaveBeenCalledWith({ x: [0, 1] });
        }
        const start2 = { x: 0, y: 75 };
        const end2 = { x: 0, y: 100 };

        store.dispatch(onMouseDown({ position: start2, time: 400 }));
        store.dispatch(onPointerMove({ position: end2, time: 500 }));
        store.dispatch(onMouseUp({ position: end2, time: 600 }));
        if (scaleType === ScaleType.Ordinal) {
          expect(brushEndListener).not.toHaveBeenCalled();
        } else {
          expect(brushEndListener).toHaveBeenCalled();
          expect(brushEndListener.mock.calls[1]?.[0]).toEqual({ x: [1, 1] });
        }

        const start3 = { x: 0, y: 75 };
        const end3 = { x: 0, y: 200 };
        store.dispatch(onMouseDown({ position: start3, time: 700 }));
        store.dispatch(onPointerMove({ position: end3, time: 800 }));
        store.dispatch(onMouseUp({ position: end3, time: 900 }));
        if (scaleType === ScaleType.Ordinal) {
          expect(brushEndListener).not.toHaveBeenCalled();
        } else {
          expect(brushEndListener).toHaveBeenCalled();
          expect(brushEndListener.mock.calls[2]?.[0]).toEqual({ x: [1, 1] }); // max of chart
        }

        const start4 = { x: 0, y: 25 };
        const end4 = { x: 0, y: -20 };
        store.dispatch(onMouseDown({ position: start4, time: 1000 }));
        store.dispatch(onPointerMove({ position: end4, time: 1100 }));
        store.dispatch(onMouseUp({ position: end4, time: 1200 }));
        if (scaleType === ScaleType.Ordinal) {
          expect(brushEndListener).not.toHaveBeenCalled();
        } else {
          expect(brushEndListener).toHaveBeenCalled();
          expect(brushEndListener.mock.calls[3]?.[0]).toEqual({ x: [0, 0] });
        }
      });
      test('can respond to a Y brush', () => {
        const brushEndListener = jest.fn<void, [BrushEvent]>((): void => undefined);
        const onBrushCaller = createOnBrushEndCaller();
        store.subscribe(() => {
          onBrushCaller(store.getState());
        });
        const settings = getSettingsSpecSelector(store.getState());
        const updatedSettings: SettingsSpec = {
          ...settings,
          brushAxis: BrushAxis.Y,
          theme: {
            ...settings.theme,
            chartMargins: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            },
          },
          onBrushEnd: brushEndListener,
        };
        MockStore.addSpecs(
          [
            {
              ...spec,
              data: [
                [0, 1],
                [1, 1],
                [2, 2],
                [3, 3],
              ],
            } as BarSeriesSpec,
            updatedSettings,
          ],
          store,
        );

        const start1 = { x: 0, y: 0 };
        const end1 = { x: 0, y: 75 };

        store.dispatch(onMouseDown({ position: start1, time: 0 }));
        store.dispatch(onPointerMove({ position: end1, time: 100 }));
        store.dispatch(onMouseUp({ position: end1, time: 200 }));
        if (scaleType === ScaleType.Ordinal) {
          expect(brushEndListener).not.toHaveBeenCalled();
        } else {
          expect(brushEndListener).toHaveBeenCalled();
          expect(brushEndListener).toHaveBeenCalledWith({
            y: [
              {
                groupId: spec.groupId,
                extent: [0.75, 3],
              },
            ],
          });
        }
        const start2 = { x: 0, y: 75 };
        const end2 = { x: 0, y: 100 };

        store.dispatch(onMouseDown({ position: start2, time: 400 }));
        store.dispatch(onPointerMove({ position: end2, time: 500 }));
        store.dispatch(onMouseUp({ position: end2, time: 600 }));
        if (scaleType === ScaleType.Ordinal) {
          expect(brushEndListener).not.toHaveBeenCalled();
        } else {
          expect(brushEndListener).toHaveBeenCalled();
          expect(brushEndListener.mock.calls[1]?.[0]).toEqual({
            y: [
              {
                groupId: spec.groupId,
                extent: [0, 0.75],
              },
            ],
          });
        }
      });
      test('can respond to rectangular brush', () => {
        const brushEndListener = jest.fn<void, [BrushEvent]>((): void => undefined);
        const onBrushCaller = createOnBrushEndCaller();
        store.subscribe(() => {
          onBrushCaller(store.getState());
        });
        const settings = getSettingsSpecSelector(store.getState());
        const updatedSettings: SettingsSpec = {
          ...settings,
          brushAxis: BrushAxis.Both,
          theme: {
            ...settings.theme,
            chartMargins: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            },
          },
          onBrushEnd: brushEndListener,
        };
        MockStore.addSpecs(
          [
            {
              ...spec,
              data: [
                [0, 1],
                [1, 1],
                [2, 2],
                [3, 3],
              ],
            } as BarSeriesSpec,
            updatedSettings,
          ],
          store,
        );

        const start1 = { x: 0, y: 0 };
        const end1 = { x: 75, y: 75 };

        store.dispatch(onMouseDown({ position: start1, time: 0 }));
        store.dispatch(onPointerMove({ position: end1, time: 100 }));
        store.dispatch(onMouseUp({ position: end1, time: 300 }));
        if (scaleType === ScaleType.Ordinal) {
          expect(brushEndListener).not.toHaveBeenCalled();
        } else {
          expect(brushEndListener).toHaveBeenCalled();
          expect(brushEndListener).toHaveBeenCalledWith({
            x: [0, 2.5],
            y: [
              {
                groupId: spec.groupId,
                extent: [0.75, 3],
              },
            ],
          });
        }
        const start2 = { x: 75, y: 75 };
        const end2 = { x: 100, y: 100 };

        store.dispatch(onMouseDown({ position: start2, time: 400 }));
        store.dispatch(onPointerMove({ position: end2, time: 500 }));
        store.dispatch(onMouseUp({ position: end2, time: 600 }));
        if (scaleType === ScaleType.Ordinal) {
          expect(brushEndListener).not.toHaveBeenCalled();
        } else {
          expect(brushEndListener).toHaveBeenCalled();
          expect(brushEndListener.mock.calls[1]?.[0]).toEqual({
            x: [2.5, 3],
            y: [
              {
                groupId: spec.groupId,
                extent: [0, 0.75],
              },
            ],
          });
        }
      });
    });
  });

  it.todo('add test for point series');
  it.todo('add test for mixed series');
  it.todo('add test for clicks');
});

describe('Negative bars click and hover', () => {
  let store: Store<GlobalChartState>;
  let onElementClick: jest.Mock<void, any[]>;
  beforeEach(() => {
    store = MockStore.default({ width: 100, height: 100, top: 0, left: 0 }, 'chartId');
    onElementClick = jest.fn<void, any[]>((): void => undefined);
    const onElementClickCaller = createOnClickCaller();
    store.subscribe(() => {
      onElementClickCaller(store.getState());
    });
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins({
          onElementClick,
        }),
        MockSeriesSpec.bar({
          xAccessor: 0,
          yAccessors: [1],
          data: [
            [0, 10],
            [1, -10],
            [2, 10],
          ],
        }),
      ],
      store,
    );
  });

  test('highlight negative bars', () => {
    store.dispatch(onPointerMove({ position: { x: 50, y: 75 }, time: 0 }));
    const highlightedGeoms = getHighlightedGeomsSelector(store.getState());
    expect(highlightedGeoms.length).toBe(1);
    expect(highlightedGeoms[0]?.value.datum).toEqual([1, -10]);
  });
  test('click negative bars', () => {
    store.dispatch(onPointerMove({ position: { x: 50, y: 75 }, time: 0 }));
    store.dispatch(onMouseDown({ position: { x: 50, y: 75 }, time: 100 }));
    store.dispatch(onMouseUp({ position: { x: 50, y: 75 }, time: 200 }));

    expect(onElementClick).toHaveBeenCalled();
    const callArgs = onElementClick.mock.calls[0]?.[0];
    expect(callArgs[0][0].datum).toEqual([1, -10]);
  });
});

describe('Clickable annotations', () => {
  test('click rect1 annotation', () => {
    const store = MockStore.default({ width: 500, height: 500, top: 0, left: 0 }, 'chartId');
    const onAnnotationClick = jest.fn<void, any[]>((data: any): void => data);
    const onAnnotationClickCaller = createOnClickCaller();
    store.subscribe(() => {
      onAnnotationClickCaller(store.getState());
    });
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins({
          onAnnotationClick,
        }),
        MockSeriesSpec.bar({
          xScaleType: ScaleType.Linear,
          yScaleType: ScaleType.Linear,
          xAccessor: 'x',
          yAccessors: ['y'],
          data: [
            { x: 0, y: 2 },
            { x: 1, y: 3 },
            { x: 3, y: 6 },
          ],
        }),
        MockAnnotationSpec.rect({
          id: 'rect1',
          dataValues: [
            {
              coordinates: {
                x0: 0,
                x1: 1,
                y0: 0,
                y1: 4,
              },
              details: 'details about this annotation',
            },
          ],
          style: { fill: 'red' },
        }),
      ],
      store,
    );

    store.dispatch(onPointerMove({ position: { x: 130, y: 217 }, time: 0 }));
    store.dispatch(onMouseDown({ position: { x: 130, y: 217 }, time: 100 }));
    store.dispatch(onMouseUp({ position: { x: 130, y: 217 }, time: 200 }));

    expect(onAnnotationClick).toHaveBeenCalled();
    const callArgs = onAnnotationClick.mock.calls[0]?.[0];
    expect(callArgs.rects[0].id).toEqual('rect1______0__1__0__4__details about this annotation__0');
    // confirming there is only one rect annotation being picked up
    expect(callArgs.rects.length).toEqual(1);
  });
  test('click with two overlapping rect annotations', () => {
    const store = MockStore.default({ width: 500, height: 500, top: 0, left: 0 }, 'chartId');
    const onAnnotationClick = jest.fn<void, any[]>((data: any): void => data);
    const onAnnotationClickCaller = createOnClickCaller();
    store.subscribe(() => {
      onAnnotationClickCaller(store.getState());
    });
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins({
          onAnnotationClick,
        }),
        MockSeriesSpec.bar({
          xScaleType: ScaleType.Linear,
          yScaleType: ScaleType.Linear,
          xAccessor: 'x',
          yAccessors: ['y'],
          data: [
            { x: 0, y: 2 },
            { x: 1, y: 3 },
            { x: 3, y: 6 },
          ],
        }),
        MockAnnotationSpec.rect({
          id: 'rect1',
          dataValues: [
            {
              coordinates: {
                x0: 0,
                x1: 1,
                y0: 0,
                y1: 4,
              },
              details: 'details about this annotation',
            },
          ],
          style: { fill: 'red' },
        }),
        MockAnnotationSpec.rect({
          id: 'rect2',
          dataValues: [
            {
              coordinates: {
                x0: 1,
                x1: 2,
                y0: 1,
                y1: 5,
              },
              details: 'details about this other annotation',
            },
          ],
          style: { fill: 'blue' },
        }),
      ],
      store,
    );
    // the overlap of the blue and red rect
    store.dispatch(onPointerMove({ position: { x: 200, y: 195 }, time: 0 }));
    store.dispatch(onMouseDown({ position: { x: 200, y: 195 }, time: 100 }));
    store.dispatch(onMouseUp({ position: { x: 200, y: 195 }, time: 200 }));

    expect(onAnnotationClick).toHaveBeenCalled();
    const callArgs = onAnnotationClick.mock.calls[0]?.[0];
    expect(callArgs.rects[1]).toMatchObject({
      datum: {
        coordinates: {
          x0: 1,
          x1: 2,
          y0: 1,
          y1: 5,
        },
        details: 'details about this other annotation',
      },
    });
    expect(callArgs.rects[0]).toMatchObject({
      datum: {
        coordinates: {
          x0: 0,
          x1: 1,
          y0: 0,
          y1: 4,
        },
        details: 'details about this annotation',
      },
    });
  });
  test.skip('click line marker annotation', () => {
    const store = MockStore.default({ width: 500, height: 500, top: 0, left: 0 }, 'chartId');
    const onAnnotationClick = jest.fn<void, any[]>((data: any): void => data);
    const onAnnotationClickCaller = createOnClickCaller();
    store.subscribe(() => {
      onAnnotationClickCaller(store.getState());
    });
    MockStore.addSpecs(
      [
        MockGlobalSpec.settingsNoMargins({
          onAnnotationClick,
        }),
        MockSeriesSpec.bar({
          xScaleType: ScaleType.Linear,
          yScaleType: ScaleType.Linear,
          xAccessor: 'x',
          yAccessors: ['y'],
          data: [
            { x: 0, y: 2 },
            { x: 1, y: 3 },
            { x: 3, y: 6 },
          ],
        }),
        MockAnnotationSpec.line({
          id: 'foo',
          domainType: AnnotationDomainType.XDomain,
          dataValues: [{ dataValue: 2, details: 'foo' }],
          marker: <Icon type="alert" />,
          markerPosition: Position.Top,
        }),
      ],
      store,
    );
    // the line marker
    store.dispatch(onPointerMove({ position: { x: 10, y: 10 }, time: 0 }));
    store.dispatch(onMouseDown({ position: { x: 10, y: 10 }, time: 100 }));
    store.dispatch(onMouseUp({ position: { x: 10, y: 10 }, time: 200 }));
    expect(onAnnotationClick).toHaveBeenCalled();
  });

  describe('Tooltip on null/missing values', () => {
    const partialSpec = {
      data: [
        { x: 0, y: 0, g: 'a' },
        { x: 1, y: null, g: 'a' },
        { x: 0, y: 4, g: 'b' },
        { x: 1, y: 5, g: 'b' },
        { x: 2, y: 2, g: 'b' },
      ],
      xAccessor: 'x',
      yAccessors: ['y'],
      splitSeriesAccessors: ['g'],
      stackAccessors: ['x'],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    let store: Store;
    beforeEach(() => {
      store = MockStore.default({ width: 90, height: 100, top: 0, left: 0 });
    });

    const tooltipValues = (s: Store) =>
      getHighlightedTooltipTooltipValuesSelector(s.getState()).tooltip.values.map((d) => [d.label, d.value]);

    it.each`
      type               | stackMode               | first                   | second        | third
      ${SeriesType.Bar}  | ${StackMode.Percentage} | ${[['a', 0], ['b', 1]]} | ${[['b', 1]]} | ${[['b', 1]]}
      ${SeriesType.Bar}  | ${undefined}            | ${[['a', 0], ['b', 4]]} | ${[['b', 5]]} | ${[['b', 2]]}
      ${SeriesType.Area} | ${StackMode.Percentage} | ${[['a', 0], ['b', 1]]} | ${[['b', 1]]} | ${[['b', 1]]}
      ${SeriesType.Area} | ${undefined}            | ${[['a', 0], ['b', 4]]} | ${[['b', 5]]} | ${[['b', 2]]}
    `(
      `tooltip should hide null/missing values on stacked $type in $stackMode mode`,
      ({ type, stackMode, first, second, third }) => {
        MockStore.addSpecs(
          [
            MockSeriesSpec.byTypePartial(type)({ ...partialSpec, stackMode }),
            MockGlobalSpec.settingsNoMargins({ theme: { colors: { vizColors: ['red', 'blue'] } } }),
          ],
          store,
        );
        // move over the 1st bar
        store.dispatch(onPointerMove({ position: { x: 15, y: 50 }, time: 0 }));
        expect(tooltipValues(store)).toIncludeSameMembers(first);
        // move over the 2nd bar (hide the null)
        store.dispatch(onPointerMove({ position: { x: 45, y: 50 }, time: 1 }));
        expect(tooltipValues(store)).toIncludeSameMembers(second);
        // move over the 3rd bar (hide missing series)
        store.dispatch(onPointerMove({ position: { x: 75, y: 50 }, time: 1 }));
        expect(tooltipValues(store)).toIncludeSameMembers(third);
      },
    );
  });
});

/* eslint-enable jest/no-conditional-expect */
