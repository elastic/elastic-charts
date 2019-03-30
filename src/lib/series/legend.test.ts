import { getGroupId, getSpecId, SpecId } from '../utils/ids';
import { ScaleType } from '../utils/scales/scales';
import { computeLegend } from './legend';
import { DataSeriesColorsValues } from './series';
import { BasicSeriesSpec } from './specs';

const colorValues1a = {
  specId: getSpecId('spec1'),
  colorValues: [],
};
const colorValues1b = {
  specId: getSpecId('spec1'),
  colorValues: ['a', 'b'],
};
const colorValues2a = {
  specId: getSpecId('spec2'),
  colorValues: [],
};
const colorValues2b = {
  specId: getSpecId('spec3'),
  colorValues: ['c', 'd'],
};
const spec1: BasicSeriesSpec = {
  id: getSpecId('spec1'),
  groupId: getGroupId('group'),
  seriesType: 'line',
  yScaleType: ScaleType.Log,
  xScaleType: ScaleType.Linear,
  xAccessor: 'x',
  yAccessors: ['y'],
  yScaleToDataExtent: false,
  data: [],
};
const spec2: BasicSeriesSpec = {
  id: getSpecId('spec2'),
  groupId: getGroupId('group'),
  seriesType: 'line',
  yScaleType: ScaleType.Log,
  xScaleType: ScaleType.Linear,
  xAccessor: 'x',
  yAccessors: ['y'],
  yScaleToDataExtent: false,
  data: [],
};

describe('Legends', () => {
  const seriesColor = new Map<string, DataSeriesColorsValues>();
  const seriesColorMap = new Map<string, string>();
  const specs = new Map<SpecId, BasicSeriesSpec>();
  specs.set(spec1.id, spec1);
  specs.set(spec2.id, spec2);
  seriesColorMap.set('colorSeries1a', 'red');
  seriesColorMap.set('colorSeries1b', 'blue');
  seriesColorMap.set('colorSeries2a', 'green');
  seriesColorMap.set('colorSeries2b', 'white');
  beforeEach(() => {
    seriesColor.clear();
  });
  it('compute legend for a single series', () => {
    seriesColor.set('colorSeries1a', colorValues1a);
    const legend = computeLegend(seriesColor, seriesColorMap, specs, 'violet');
    const expected = [
      {
        color: 'red',
        label: 'spec1',
        value: { colorValues: [], specId: 'spec1' },
        isVisible: true,
        key: 'colorSeries1a',
      },
    ];
    expect(Array.from(legend.values())).toEqual(expected);
  });
  it('compute legend for a single spec but with multiple series', () => {
    seriesColor.set('colorSeries1a', colorValues1a);
    seriesColor.set('colorSeries1b', colorValues1b);
    const legend = computeLegend(seriesColor, seriesColorMap, specs, 'violet');
    const expected = [
      {
        color: 'red',
        label: 'spec1',
        value: { colorValues: [], specId: 'spec1' },
        isVisible: true,
        key: 'colorSeries1a',
      },
      {
        color: 'blue',
        label: 'a - b',
        value: { colorValues: ['a', 'b'], specId: 'spec1' },
        isVisible: true,
        key: 'colorSeries1b',
      },
    ];
    expect(Array.from(legend.values())).toEqual(expected);
  });
  it('compute legend for multiple specs', () => {
    seriesColor.set('colorSeries1a', colorValues1a);
    seriesColor.set('colorSeries2a', colorValues2a);
    const legend = computeLegend(seriesColor, seriesColorMap, specs, 'violet');
    const expected = [
      {
        color: 'red',
        label: 'spec1',
        value: { colorValues: [], specId: 'spec1' },
        isVisible: true,
        key: 'colorSeries1a',
      },
      {
        color: 'green',
        label: 'spec2',
        value: { colorValues: [], specId: 'spec2' },
        isVisible: true,
        key: 'colorSeries2a',
      },
    ];
    expect(Array.from(legend.values())).toEqual(expected);
  });
  it('empty legend for missing spec', () => {
    seriesColor.set('colorSeries2b', colorValues2b);
    const legend = computeLegend(seriesColor, seriesColorMap, specs, 'violet');
    expect(legend.size).toEqual(0);
  });
  it('compute legend with default color for missing series color', () => {
    seriesColor.set('colorSeries1a', colorValues1a);
    const emptyColorMap = new Map<string, string>();
    const legend = computeLegend(seriesColor, emptyColorMap, specs, 'violet');
    const expected = [
      {
        color: 'violet',
        label: 'spec1',
        value: { colorValues: [], specId: 'spec1' },
        isVisible: true,
        key: 'colorSeries1a',
      },
    ];
    expect(Array.from(legend.values())).toEqual(expected);
  });
  it('default all series legend items to visible when deselectedDataSeries is null', () => {
    seriesColor.set('colorSeries1a', colorValues1a);
    seriesColor.set('colorSeries1b', colorValues1b);
    seriesColor.set('colorSeries2a', colorValues2a);
    seriesColor.set('colorSeries2b', colorValues2b);

    const emptyColorMap = new Map<string, string>();
    const deselectedDataSeries = null;

    const legend = computeLegend(seriesColor, emptyColorMap, specs, 'violet', deselectedDataSeries);

    const visibility = [...legend.values()].map((item) => item.isVisible);

    expect(visibility).toEqual([true, true, true, true]);
  });
  it('selectively sets series to visible when there are deselectedDataSeries items', () => {
    seriesColor.set('colorSeries1a', colorValues1a);
    seriesColor.set('colorSeries1b', colorValues1b);
    seriesColor.set('colorSeries2a', colorValues2a);
    seriesColor.set('colorSeries2b', colorValues2b);

    const emptyColorMap = new Map<string, string>();
    const deselectedDataSeries = [colorValues1a, colorValues1b];

    const legend = computeLegend(seriesColor, emptyColorMap, specs, 'violet', deselectedDataSeries);

    const visibility = [...legend.values()].map((item) => item.isVisible);
    expect(visibility).toEqual([false, false, true, true]);
  });
});
