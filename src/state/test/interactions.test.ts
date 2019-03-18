import { IndexedGeometry } from '../../lib/series/rendering';
import { DataSeriesColorsValues } from '../../lib/series/series';
import { BarSeriesSpec } from '../../lib/series/specs';
import { getGroupId, getSpecId } from '../../lib/utils/ids';
import { TooltipType } from '../../lib/utils/interactions';
import { ScaleBand } from '../../lib/utils/scales/scale_band';
import { ScaleContinuous } from '../../lib/utils/scales/scale_continuous';
import { ScaleType } from '../../lib/utils/scales/scales';
import { ChartStore } from '../chart_state';

describe('Chart state pointer interactions', () => {
  let store: ChartStore;

  const SPEC_ID = getSpecId('spec_1');
  const GROUP_ID = getGroupId('group_1');

  const spec: BarSeriesSpec = {
    id: SPEC_ID,
    groupId: GROUP_ID,
    seriesType: 'bar',
    yScaleToDataExtent: false,
    data: [],
    xAccessor: 'x',
    yAccessors: ['y'],
    xScaleType: ScaleType.Linear,
    yScaleType: ScaleType.Linear,
  };

  const indexedGeom: IndexedGeometry = {
    color: 'red',
    geom: {
      x: 0,
      y: 70,
      width: 50,
      height: 30,
    },
    datum: {},
    specId: SPEC_ID,
    seriesKey: [],
  };

  beforeEach(() => {
    store = new ChartStore();
    store.chartDimensions.width = 100;
    store.chartDimensions.height = 100;
    store.chartDimensions.top = 10;
    store.chartDimensions.left = 10;
    store.chartRotation = 0;
    store.seriesDomainsAndData = {
      splittedDataSeries: [],
      formattedDataSeries: {
        stacked: [],
        nonStacked: [],
      },
      seriesColors: new Map<string, DataSeriesColorsValues>(),
      xDomain: {
        scaleType: ScaleType.Ordinal,
        domain: [0, 1],
        isBandScale: true,
        minInterval: 10,
        type: 'xDomain',
      },
      yDomain: [
        {
          scaleType: ScaleType.Linear,
          domain: [0, 1],
          isBandScale: false,
          groupId: GROUP_ID,
          type: 'yDomain',
        },
      ],
    };
    store.tooltipType.set(TooltipType.VerticalCursor);
    store.seriesSpecs.set(spec.id, spec);
  });
  test('can compute chart relative x and y positions', () => {
    store.setCursorPosition(20, 20);
    expect(store.cursorPosition.x).toBe(10);
    expect(store.cursorPosition.y).toBe(10);
    store.setCursorPosition(10, 10);
    expect(store.cursorPosition.x).toBe(0);
    expect(store.cursorPosition.y).toBe(0);
    store.setCursorPosition(5, 5);
    expect(store.cursorPosition.x).toBe(-1);
    expect(store.cursorPosition.y).toBe(-1);
    store.setCursorPosition(200, 20);
    expect(store.cursorPosition.x).toBe(-1);
    expect(store.cursorPosition.y).toBe(10);
    store.setCursorPosition(20, 200);
    expect(store.cursorPosition.x).toBe(10);
    expect(store.cursorPosition.y).toBe(-1);
    store.setCursorPosition(200, 200);
    expect(store.cursorPosition.x).toBe(-1);
    expect(store.cursorPosition.y).toBe(-1);
    store.setCursorPosition(-20, -20);
    expect(store.cursorPosition.x).toBe(-1);
    expect(store.cursorPosition.y).toBe(-1);
  });

  test('call onElementOut if moving the mouse out from the chart', () => {
    store.highlightedGeometries.push(indexedGeom);
    const listener = jest.fn((): undefined => undefined);
    store.setOnElementOutListener(listener);
    store.setCursorPosition(5, 5);
    expect(listener).toBeCalledTimes(1);

    // no more calls after the first out one outside chart
    store.setCursorPosition(5, 5);
    expect(listener).toBeCalledTimes(1);
    store.setCursorPosition(3, 3);
    expect(listener).toBeCalledTimes(1);
  });

  test('can get a valid indexed geometry with ordinal x scale', () => {
    store.xScale = new ScaleBand([0, 1], [0, 100]);
    store.yScales = new Map();
    store.yScales.set(GROUP_ID, new ScaleContinuous([0, 1], [0, 100], ScaleType.Linear));
    store.geometriesIndex.set(0, [indexedGeom]);
    const onOverListener = jest.fn((): undefined => undefined);
    const onOutListener = jest.fn((): undefined => undefined);
    store.setOnElementOverListener(onOverListener);
    store.setOnElementOutListener(onOutListener);

    // top left
    store.setCursorPosition(10, 10 + 70);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(1);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(0);

    // over element bottom left
    store.setCursorPosition(10, 10 + 70 + 30);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(1);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(0);

    // over element  top right
    // 49 as width because ordinal xScale creates 2 bands from [0,49][50,99]
    store.setCursorPosition(10 + 49, 10 + 70);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(1);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(0);

    // over element  bottom right
    store.setCursorPosition(10 + 49, 10 + 70 + 30);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(1);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(0);

    // over band top left
    store.setCursorPosition(10, 10);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);

    // over band top left
    store.setCursorPosition(10, 10 + 69);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);

    // over band top right
    store.setCursorPosition(10 + 49, 10);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);

    // over band top right
    store.setCursorPosition(10 + 49, 10 + 69);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);

    // out band top left
    store.setCursorPosition(10 + 50, 10);
    expect(store.showTooltip.get()).toBe(false);
    expect(store.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);

    // over band top left
    store.setCursorPosition(10 + 50, 10 + 70);
    expect(store.showTooltip.get()).toBe(false);
    expect(store.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);

    // retesting on hover
    store.setCursorPosition(10, 10 + 70);
    expect(onOverListener).toBeCalledTimes(2);
    expect(onOutListener).toBeCalledTimes(1);

    store.setCursorPosition(9, 9);
    expect(onOverListener).toBeCalledTimes(2);
    expect(onOutListener).toBeCalledTimes(2);
  });

  test('can get a valid indexed geometry with linear x scale', () => {
    store.xScale = new ScaleContinuous([0, 1], [0, 100], ScaleType.Linear, false, 50, 0.5);
    store.yScales = new Map();
    store.yScales.set(GROUP_ID, new ScaleContinuous([0, 1], [0, 100], ScaleType.Linear));
    store.geometriesIndex.set(0, [indexedGeom]);
    const onOverListener = jest.fn((): undefined => undefined);
    const onOutListener = jest.fn((): undefined => undefined);
    store.setOnElementOverListener(onOverListener);
    store.setOnElementOutListener(onOutListener);

    // top left
    store.setCursorPosition(10, 10 + 70);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(1);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(0);

    // over element bottom left
    store.setCursorPosition(10, 10 + 70 + 30);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(1);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(0);

    // over element  top right
    // 49 as width because ordinal xScale creates 2 bands from [0,49][50,99]
    store.setCursorPosition(10 + 49, 10 + 70);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(1);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(0);

    // over element  bottom right
    store.setCursorPosition(10 + 49, 10 + 70 + 30);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(1);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(0);

    // over band top left
    store.setCursorPosition(10, 10);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);

    // over band top left
    store.setCursorPosition(10, 10 + 69);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);

    // over band top right
    store.setCursorPosition(10 + 49, 10);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);

    // over band top right
    store.setCursorPosition(10 + 49, 10 + 69);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);

    // out band top left
    store.setCursorPosition(10 + 50, 10);
    expect(store.showTooltip.get()).toBe(false);
    expect(store.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);

    // over band top left
    store.setCursorPosition(10 + 50, 10 + 70);
    expect(store.showTooltip.get()).toBe(false);
    expect(store.highlightedGeometries.length).toBe(0);
    expect(onOverListener).toBeCalledTimes(1);
    expect(onOutListener).toBeCalledTimes(1);

    // retest on over
    store.setCursorPosition(10, 10 + 70);
    expect(onOverListener).toBeCalledTimes(2);
    expect(onOutListener).toBeCalledTimes(1);

    store.setCursorPosition(9, 9);
    expect(onOverListener).toBeCalledTimes(2);
    expect(onOutListener).toBeCalledTimes(2);
  });

  test('can respond to tooltip types changes', () => {
    store.xScale = new ScaleContinuous([0, 1], [0, 100], ScaleType.Linear, false, 50, 0.5);
    store.yScales = new Map();
    store.yScales.set(GROUP_ID, new ScaleContinuous([0, 1], [0, 100], ScaleType.Linear));
    store.geometriesIndex.set(0, [indexedGeom]);

    store.tooltipType.set(TooltipType.None);
    store.setCursorPosition(10, 10 + 70);
    expect(store.tooltipData).toEqual([]);
    expect(store.showTooltip.get()).toBe(false);

    store.tooltipType.set(TooltipType.Follow);
    store.setCursorPosition(10, 10 + 70);
    expect(store.showTooltip.get()).toBe(true);
    expect(store.highlightedGeometries.length).toBe(1);
  });

  // TODO add test for point series
  // TODO add test for mixed series
  // TODO add test for clicks
});
