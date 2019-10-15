import { createStore, Store } from 'redux';
import { BarSeriesSpec, BasicSeriesSpec, AxisSpec, Position } from '../utils/specs';
import { TooltipType } from '../utils/interactions';
import { ScaleType } from '../../../utils/scales/scales';
import { chartStoreReducer, GlobalChartState } from '../../../state/chart_state';
import { SettingsSpec, DEFAULT_SETTINGS_SPEC } from '../../../specs';
import { computeSeriesGeometriesSelector } from './selectors/compute_series_geometries';
import { computeCursorPositionSelector } from './selectors/compute_cursor_position';
import {
  getHighlightedGeomsSelector,
  getTooltipValuesAndGeometriesSelector,
} from './selectors/get_tooltip_values_highlighted_geoms';
import { isTooltipVisibleSelector } from './selectors/is_tooltip_visible';
import { createOnElementOutCaller } from './selectors/on_element_out_caller';
import { createOnElementOverCaller } from './selectors/on_element_over_caller';
import { getCursorBandPositionSelector } from './selectors/get_cursor_band';
import { getSettingsSpecSelector } from '../../../state/selectors/get_settings_specs';
import { upsertSpec, specParsed } from '../../../state/actions/specs';
import { updateParentDimensions } from '../../../state/actions/chart_settings';
import { onCursorPositionChange } from '../../../state/actions/cursor';

const SPEC_ID = 'spec_1';
const GROUP_ID = 'group_1';

const ordinalBarSeries: BarSeriesSpec = {
  chartType: 'xy_axis',
  specType: 'series',
  id: SPEC_ID,
  groupId: GROUP_ID,
  seriesType: 'bar',
  yScaleToDataExtent: false,
  data: [[0, 10], [1, 5]],
  xAccessor: 0,
  yAccessors: [1],
  xScaleType: ScaleType.Ordinal,
  yScaleType: ScaleType.Linear,
  hideInLegend: false,
};
const linearBarSeries: BarSeriesSpec = {
  chartType: 'xy_axis',
  specType: 'series',
  id: SPEC_ID,
  groupId: GROUP_ID,
  seriesType: 'bar',
  yScaleToDataExtent: false,
  data: [[0, 10], [1, 5]],
  xAccessor: 0,
  yAccessors: [1],
  xScaleType: ScaleType.Linear,
  yScaleType: ScaleType.Linear,
  hideInLegend: false,
};
const chartTop = 10;
const chartLeft = 10;
const settingSpec: SettingsSpec = {
  ...DEFAULT_SETTINGS_SPEC,
  tooltip: {
    type: TooltipType.VerticalCursor,
  },
  hideDuplicateAxes: false,
  theme: {
    chartPaddings: { top: 0, left: 0, bottom: 0, right: 0 },
    chartMargins: { top: 10, left: 10, bottom: 0, right: 0 },
    scales: {
      barsPadding: 0,
    },
  },
};

function initStore(spec: BasicSeriesSpec) {
  const storeReducer = chartStoreReducer('chartId');
  const store = createStore(storeReducer);

  store.dispatch(upsertSpec(settingSpec));
  store.dispatch(upsertSpec(spec));
  store.dispatch(specParsed());
  store.dispatch(updateParentDimensions({ width: 100, height: 100, top: chartTop, left: chartLeft }));

  return store;
}

// const barStyle = {
//   rect: {
//     opacity: 1,
//   },
//   rectBorder: {
//     strokeWidth: 1,
//     visible: false,
//   },
//   displayValue: {
//     fill: 'black',
//     fontFamily: '',
//     fontSize: 2,
//     offsetX: 0,
//     offsetY: 0,
//     padding: 2,
//   },
// };
// const indexedGeom1Red: BarGeometry = {
//   color: 'red',
//   x: 0,
//   y: 0,
//   width: 50,
//   height: 100,
//   value: {
//     x: 0,
//     y: 10,
//     accessor: 'y1',
//   },
//   geometryId: {
//     specId: SPEC_ID,
//     seriesKey: [],
//   },
//   seriesStyle: barStyle,
// };
// const indexedGeom2Blue: BarGeometry = {
//   color: 'blue',
//   x: 50,
//   y: 50,
//   width: 50,
//   height: 50,
//   value: {
//     x: 1,
//     y: 5,
//     accessor: 'y1',
//   },
//   geometryId: {
//     specId: SPEC_ID,
//     seriesKey: [],
//   },
//   seriesStyle: barStyle,
// };

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
    expect(geometries.bars.length).toBe(2);
  });

  test('can convert/limit cursor positions relative to chart dimensions', () => {
    store.dispatch(onCursorPositionChange(20, 20));
    debugger;
    let cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition.x).toBe(10);
    expect(cursorPosition.y).toBe(10);

    store.dispatch(onCursorPositionChange(10, 10));
    cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition.x).toBe(0);
    expect(cursorPosition.y).toBe(0);
    store.dispatch(onCursorPositionChange(5, 5));
    cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition.x).toBe(-1);
    expect(cursorPosition.y).toBe(-1);
    store.dispatch(onCursorPositionChange(200, 20));
    cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition.x).toBe(-1);
    expect(cursorPosition.y).toBe(10);
    store.dispatch(onCursorPositionChange(20, 200));
    cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition.x).toBe(10);
    expect(cursorPosition.y).toBe(-1);
    store.dispatch(onCursorPositionChange(200, 200));
    cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition.x).toBe(-1);
    expect(cursorPosition.y).toBe(-1);
    store.dispatch(onCursorPositionChange(-20, -20));
    cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition.x).toBe(-1);
    expect(cursorPosition.y).toBe(-1);
  });

  test('call onElementOut if moving the mouse out from the chart', () => {
    const onOutListener = jest.fn((): undefined => undefined);
    const settingsWithListeners: SettingsSpec = {
      ...settingSpec,
      onElementOut: onOutListener,
    };
    store.dispatch(upsertSpec(settingsWithListeners));
    store.dispatch(specParsed());
    // registering the out/over listener caller
    store.subscribe(() => {
      onElementOutCaller(store.getState());
      onElementOverCaller(store.getState());
    });
    store.dispatch(onCursorPositionChange(20, 20));
    expect(onOutListener).toBeCalledTimes(0);

    // no more calls after the first out one outside chart
    store.dispatch(onCursorPositionChange(5, 5));
    expect(onOutListener).toBeCalledTimes(1);
    store.dispatch(onCursorPositionChange(3, 3));
    expect(onOutListener).toBeCalledTimes(1);
  });

  test('can respond to tooltip types changes', () => {
    let updatedSettings: SettingsSpec = {
      ...settingSpec,
      tooltip: {
        type: TooltipType.None,
      },
    };
    store.dispatch(upsertSpec(updatedSettings));
    store.dispatch(specParsed());
    store.dispatch(onCursorPositionChange(10, 10 + 70));
    const tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
    expect(tooltipData.tooltipValues.length).toBe(2);
    expect(tooltipData.tooltipValues[0].isXValue).toBe(true);
    expect(tooltipData.tooltipValues[1].isXValue).toBe(false);
    expect(tooltipData.tooltipValues[1].isHighlighted).toBe(true);
    let isTooltipVisible = isTooltipVisibleSelector(store.getState());
    expect(isTooltipVisible).toBe(false);

    updatedSettings = {
      ...settingSpec,
      tooltip: {
        type: TooltipType.Follow,
      },
    };
    store.dispatch(upsertSpec(updatedSettings));
    store.dispatch(specParsed());
    store.dispatch(onCursorPositionChange(10, 10 + 70));
    const { geometriesIndex } = computeSeriesGeometriesSelector(store.getState());
    expect(geometriesIndex.size).toBe(2);
    const highlightedGeometries = getHighlightedGeomsSelector(store.getState());
    expect(highlightedGeometries.length).toBe(1);
    isTooltipVisible = isTooltipVisibleSelector(store.getState());
    expect(isTooltipVisible).toBe(true);
  });

  describe('mouse over with Ordinal scale', () => {
    mouseOverTestSuite(ScaleType.Ordinal);
  });
  describe('mouse over with Linear scale', () => {
    mouseOverTestSuite(ScaleType.Linear);
  });

  // TODO add test for point series
  // TODO add test for mixed series
  // TODO add test for clicks
});

function mouseOverTestSuite(scaleType: ScaleType) {
  let store: Store<GlobalChartState>;
  let onOverListener: jest.Mock<undefined>;
  let onOutListener: jest.Mock<undefined>;
  const spec = scaleType === ScaleType.Ordinal ? ordinalBarSeries : linearBarSeries;
  beforeEach(() => {
    store = initStore(spec);
    onOverListener = jest.fn((): undefined => undefined);
    onOutListener = jest.fn((): undefined => undefined);
    const settingsWithListeners: SettingsSpec = {
      ...settingSpec,
      onElementOver: onOverListener,
      onElementOut: onOutListener,
    };
    store.dispatch(upsertSpec(settingsWithListeners));
    store.dispatch(specParsed());
    const onElementOutCaller = createOnElementOutCaller();
    const onElementOverCaller = createOnElementOverCaller();
    store.subscribe(() => {
      onElementOutCaller(store.getState());
      onElementOverCaller(store.getState());
    });
    const tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
    expect(tooltipData.tooltipValues).toEqual([]);
  });

  test('store is correctly configured', () => {
    // checking this to avoid broken tests due to nested describe and before
    const seriesGeoms = computeSeriesGeometriesSelector(store.getState());
    expect(seriesGeoms.scales.xScale).not.toBeUndefined();
    expect(seriesGeoms.scales.yScales).not.toBeUndefined();
  });

  // test('set cursor from external source', () => {
  //   store.setCursorValue(0);
  //   expect(store.externalCursorShown.get()).toBe(true);
  //   expect(store.cursorBandPosition).toEqual({
  //     height: 100,
  //     left: 10,
  //     top: 10,
  //     visible: true,
  //     width: 50,
  //   });

  //   store.setCursorValue(1);
  //   expect(store.externalCursorShown.get()).toBe(true);
  //   expect(store.cursorBandPosition).toEqual({
  //     height: 100,
  //     left: 60,
  //     top: 10,
  //     visible: true,
  //     width: 50,
  //   });

  //   store.setCursorValue(2);
  //   expect(store.externalCursorShown.get()).toBe(true);
  //   // equal to the latest except the visiblility
  //   expect(store.cursorBandPosition).toEqual({
  //     height: 100,
  //     left: 60,
  //     top: 10,
  //     visible: false,
  //     width: 50,
  //   });
  // });
  // test('can determine which tooltip to display if chart & annotation tooltips possible', () => {
  //   const annotationDimensions = [{ rect: { x: 49, y: -1, width: 3, height: 99 } }];
  //   const rectAnnotationSpec: RectAnnotationSpec = {
  //     id: 'rect',
  //     groupId: GROUP_ID,
  //     annotationType: 'rectangle',
  //     dataValues: [{ coordinates: { x0: 1, x1: 1.5, y0: 0.5, y1: 10 } }],
  //   };

  //   store.annotationSpecs.set(rectAnnotationSpec.annotationId, rectAnnotationSpec);
  //   store.annotationDimensions.set(rectAnnotationSpec.annotationId, annotationDimensions);
  //   debugger;
  //   // isHighlighted false, chart tooltip true; should show annotationTooltip only
  //   store.setCursorPosition(chartLeft + 51, chartTop + 1);
  //   expect(store.isTooltipVisible.get()).toBe(false);
  // });

  test('can hover top-left corner of the first bar', () => {
    let tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
    expect(tooltipData.tooltipValues).toEqual([]);
    store.dispatch(onCursorPositionChange(chartLeft + 0, chartTop + 0));
    let cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition).toEqual({ x: 0, y: 0 });
    const cursorBandPosition = getCursorBandPositionSelector(store.getState());
    expect(cursorBandPosition).toBeDefined();
    expect(cursorBandPosition!.left).toBe(chartLeft + 0);
    expect(cursorBandPosition!.width).toBe(45);
    let isTooltipVisible = isTooltipVisibleSelector(store.getState());
    expect(isTooltipVisible).toBe(true);
    tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
    expect(tooltipData.tooltipValues.length).toBe(2); // x value + 1 y value
    expect(tooltipData.highlightedGeometries.length).toBe(1);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(0);
    expect(onOverListener.mock.calls[0][0]).toEqual([
      {
        x: 0,
        y: 10,
        accessor: 'y1',
      },
    ]);

    store.dispatch(onCursorPositionChange(chartLeft - 1, chartTop - 1));
    cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition).toEqual({ x: -1, y: -1 });
    isTooltipVisible = isTooltipVisibleSelector(store.getState());
    expect(isTooltipVisible).toBe(false);
    tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
    expect(tooltipData.tooltipValues.length).toBe(0);
    expect(tooltipData.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);
  });

  test('can hover bottom-left corner of the first bar', () => {
    store.dispatch(onCursorPositionChange(chartLeft + 0, chartTop + 89));
    let cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition).toEqual({ x: 0, y: 89 });
    const cursorBandPosition = getCursorBandPositionSelector(store.getState());
    expect(cursorBandPosition).toBeDefined();
    expect(cursorBandPosition!.left).toBe(chartLeft + 0);
    expect(cursorBandPosition!.width).toBe(45);
    let isTooltipVisible = isTooltipVisibleSelector(store.getState());
    expect(isTooltipVisible).toBe(true);
    let tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
    expect(tooltipData.highlightedGeometries.length).toBe(1);
    expect(tooltipData.tooltipValues.length).toBe(2); // x value + 1 y value
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(0);
    expect(onOverListener.mock.calls[0][0]).toEqual([
      {
        x: 0,
        y: 10,
        accessor: 'y1',
      },
    ]);
    store.dispatch(onCursorPositionChange(chartLeft - 1, chartTop + 89));
    cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition).toEqual({ x: -1, y: 89 });
    isTooltipVisible = isTooltipVisibleSelector(store.getState());
    expect(isTooltipVisible).toBe(false);
    tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
    expect(tooltipData.tooltipValues.length).toBe(0);
    expect(tooltipData.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);
  });

  test('can hover top-right corner of the first bar', () => {
    let scaleOffset = 0;
    if (scaleType !== ScaleType.Ordinal) {
      scaleOffset = 1;
    }
    store.dispatch(onCursorPositionChange(chartLeft + 44 + scaleOffset, chartTop + 0));
    let cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition).toEqual({ x: 44 + scaleOffset, y: 0 });
    let cursorBandPosition = getCursorBandPositionSelector(store.getState());
    expect(cursorBandPosition).toBeDefined();
    expect(cursorBandPosition!.left).toBe(chartLeft + 0);
    expect(cursorBandPosition!.width).toBe(45);
    let isTooltipVisible = isTooltipVisibleSelector(store.getState());
    expect(isTooltipVisible).toBe(true);
    let tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
    expect(tooltipData.highlightedGeometries.length).toBe(1);
    expect(tooltipData.tooltipValues.length).toBe(2);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(0);
    expect(onOverListener.mock.calls[0][0]).toEqual([
      {
        x: 0,
        y: 10,
        accessor: 'y1',
      },
    ]);

    store.dispatch(onCursorPositionChange(chartLeft + 45 + scaleOffset, chartTop + 0));
    cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition).toEqual({ x: 45 + scaleOffset, y: 0 });
    cursorBandPosition = getCursorBandPositionSelector(store.getState());
    expect(cursorBandPosition).toBeDefined();
    expect(cursorBandPosition!.left).toBe(chartLeft + 45);
    expect(cursorBandPosition!.width).toBe(45);
    isTooltipVisible = isTooltipVisibleSelector(store.getState());
    expect(isTooltipVisible).toBe(true);
    tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
    expect(tooltipData.tooltipValues.length).toBe(2);
    expect(tooltipData.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);
  });

  test('can hover bottom-right corner of the first bar', () => {
    let scaleOffset = 0;
    if (scaleType !== ScaleType.Ordinal) {
      scaleOffset = 1;
    }
    store.dispatch(onCursorPositionChange(chartLeft + 44 + scaleOffset, chartTop + 89));
    let cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition).toEqual({ x: 44 + scaleOffset, y: 89 });
    let cursorBandPosition = getCursorBandPositionSelector(store.getState());
    expect(cursorBandPosition).toBeDefined();
    expect(cursorBandPosition!.left).toBe(chartLeft + 0);
    expect(cursorBandPosition!.width).toBe(45);
    let isTooltipVisible = isTooltipVisibleSelector(store.getState());
    expect(isTooltipVisible).toBe(true);
    let tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
    expect(tooltipData.highlightedGeometries.length).toBe(1);
    expect(tooltipData.tooltipValues.length).toBe(2);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(0);
    expect(onOverListener.mock.calls[0][0]).toEqual([
      {
        x: spec.data[0][0],
        y: spec.data[0][1],
        accessor: 'y1',
      },
    ]);

    store.dispatch(onCursorPositionChange(chartLeft + 45 + scaleOffset, chartTop + 89));
    cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition).toEqual({ x: 45 + scaleOffset, y: 89 });
    cursorBandPosition = getCursorBandPositionSelector(store.getState());
    expect(cursorBandPosition).toBeDefined();
    expect(cursorBandPosition!.left).toBe(chartLeft + 45);
    expect(cursorBandPosition!.width).toBe(45);
    isTooltipVisible = isTooltipVisibleSelector(store.getState());
    expect(isTooltipVisible).toBe(true);
    tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
    expect(tooltipData.tooltipValues.length).toBe(2);
    // we are over the second bar here
    expect(tooltipData.highlightedGeometries.length).toBe(1);
    expect(onOverListener).toBeCalledTimes(2);
    expect(onOverListener.mock.calls[1][0]).toEqual([
      {
        x: spec.data[1][0],
        y: spec.data[1][1],
        accessor: 'y1',
      },
    ]);

    expect(onOutListener).toBeCalledTimes(0);

    store.dispatch(onCursorPositionChange(chartLeft + 47 + scaleOffset, chartTop + 89));
  });

  test('can hover top-right corner of the chart', () => {
    expect(onOverListener).toBeCalledTimes(0);
    expect(onOutListener).toBeCalledTimes(0);
    let tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
    expect(tooltipData.highlightedGeometries.length).toBe(0);
    expect(tooltipData.tooltipValues.length).toBe(0);

    store.dispatch(onCursorPositionChange(chartLeft + 89, chartTop + 0));
    const cursorPosition = computeCursorPositionSelector(store.getState());
    expect(cursorPosition).toEqual({ x: 89, y: 0 });
    const cursorBandPosition = getCursorBandPositionSelector(store.getState());
    expect(cursorBandPosition).toBeDefined();
    expect(cursorBandPosition!.left).toBe(chartLeft + 45);
    expect(cursorBandPosition!.width).toBe(45);

    const isTooltipVisible = isTooltipVisibleSelector(store.getState());
    expect(isTooltipVisible).toBe(true);
    tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
    expect(tooltipData.highlightedGeometries.length).toBe(0);
    expect(tooltipData.tooltipValues.length).toBe(2);
    expect(onOverListener).toBeCalledTimes(0);
    expect(onOutListener).toBeCalledTimes(0);
  });

  test('will call only one time the listener with the same values', () => {
    expect(onOverListener).toBeCalledTimes(0);
    expect(onOutListener).toBeCalledTimes(0);
    let halfWidth = 45;
    if (scaleType !== ScaleType.Ordinal) {
      halfWidth = 46;
    }
    for (let i = 0; i < halfWidth; i++) {
      store.dispatch(onCursorPositionChange(chartLeft + i, chartTop + 89));
      expect(onOverListener).toBeCalledTimes(1);
      expect(onOutListener).toBeCalledTimes(0);
    }
    for (let i = halfWidth; i < 90; i++) {
      store.dispatch(onCursorPositionChange(chartLeft + i, chartTop + 89));
      expect(onOverListener).toBeCalledTimes(2);
      expect(onOutListener).toBeCalledTimes(0);
    }
    for (let i = 0; i < halfWidth; i++) {
      store.dispatch(onCursorPositionChange(chartLeft + i, chartTop + 0));
      expect(onOverListener).toBeCalledTimes(3);
      expect(onOutListener).toBeCalledTimes(0);
    }
    for (let i = halfWidth; i < 90; i++) {
      store.dispatch(onCursorPositionChange(chartLeft + i, chartTop + 0));
      expect(onOverListener).toBeCalledTimes(3);
      expect(onOutListener).toBeCalledTimes(1);
    }
  });

  test('can hover bottom-right corner of the chart', () => {
    store.dispatch(onCursorPositionChange(chartLeft + 89, chartTop + 89));
    const cursorPosition = computeCursorPositionSelector(store.getState());
    // store.setCursorPosition(chartLeft + 99, chartTop + 99);
    expect(cursorPosition).toEqual({ x: 89, y: 89 });
    const cursorBandPosition = getCursorBandPositionSelector(store.getState());
    expect(cursorBandPosition).toBeDefined();
    expect(cursorBandPosition!.left).toBe(chartLeft + 45);
    expect(cursorBandPosition!.width).toBe(45);
    const isTooltipVisible = isTooltipVisibleSelector(store.getState());
    expect(isTooltipVisible).toBe(true);
    const tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
    expect(tooltipData.highlightedGeometries.length).toBe(1);
    expect(tooltipData.tooltipValues.length).toBe(2);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOverListener.mock.calls[0][0]).toEqual([
      {
        x: 1,
        y: 5,
        accessor: 'y1',
      },
    ]);
    expect(onOutListener).toBeCalledTimes(0);
  });

  // describe('can position tooltip within chart when xScale is a single value scale', () => {
  //   beforeEach(() => {
  //     const singleValueScale =
  //       store.xScale!.type === ScaleType.Ordinal
  //         ? new ScaleBand(['a'], [0, 0])
  //         : new ScaleContinuous({ type: ScaleType.Linear, domain: [1, 1], range: [0, 0] });
  //     store.xScale = singleValueScale;
  //   });
  //   test('horizontal chart rotation', () => {
  //     store.setCursorPosition(chartLeft + 99, chartTop + 99);
  //     const expectedTransform = `translateX(${chartLeft}px) translateX(-0%) translateY(109px) translateY(-100%)`;
  //     expect(store.tooltipPosition.transform).toBe(expectedTransform);
  //   });

  //   test('vertical chart rotation', () => {
  //     store.chartRotation = 90;
  //     store.setCursorPosition(chartLeft + 99, chartTop + 99);
  //     const expectedTransform = `translateX(109px) translateX(-100%) translateY(${chartTop}px) translateY(-0%)`;
  //     expect(store.tooltipPosition.transform).toBe(expectedTransform);
  //   });
  // });
  describe('can format tooltip values on rotated chart', () => {
    beforeEach(() => {
      const leftAxis: AxisSpec = {
        chartType: 'xy_axis',
        specType: 'axis',
        hide: true,
        id: 'yaxis',
        groupId: GROUP_ID,
        position: Position.Left,
        tickFormat: (value) => `left ${Number(value)}`,
        showOverlappingLabels: false,
        showOverlappingTicks: false,
        tickPadding: 0,
        tickSize: 0,
      };
      const bottomAxis: AxisSpec = {
        chartType: 'xy_axis',
        specType: 'axis',
        hide: true,
        id: 'xaxis',
        groupId: GROUP_ID,
        position: Position.Bottom,
        tickFormat: (value) => `bottom ${Number(value)}`,
        showOverlappingLabels: false,
        showOverlappingTicks: false,
        tickPadding: 0,
        tickSize: 0,
      };
      store.dispatch(upsertSpec(leftAxis));
      store.dispatch(upsertSpec(bottomAxis));
      store.dispatch(specParsed());
    });
    test('chart 0 rotation', () => {
      store.dispatch(onCursorPositionChange(chartLeft + 0, chartTop + 89));
      const tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
      expect(tooltipData.tooltipValues[0].value).toBe('bottom 0');
      expect(tooltipData.tooltipValues[1].value).toBe('left 10');
    });

    test.skip('chart 90 deg rotated', () => {
      const settings = getSettingsSpecSelector(store.getState());
      const updatedSettings: SettingsSpec = {
        ...settings,
        rotation: 90,
      };
      store.dispatch(upsertSpec(updatedSettings));
      store.dispatch(specParsed());
      store.dispatch(onCursorPositionChange(chartLeft + 0, chartTop + 89));
      const tooltipData = getTooltipValuesAndGeometriesSelector(store.getState());
      expect(tooltipData.tooltipValues[0].value).toBe('left 1');
      expect(tooltipData.tooltipValues[1].value).toBe('bottom 5');
    });
  });
}
