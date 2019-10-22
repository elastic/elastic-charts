import { AxisId, getAxisId, getGroupId, getSpecId, SpecId } from '../../../utils/ids';
import { ScaleType } from '../../../utils/scales/scales';
import { computeLegend } from './legend';
import { SeriesCollectionValue, getSeriesLabel } from '../utils/series';
import { AxisSpec, BasicSeriesSpec, Position } from '../utils/specs';

const nullDisplayValue = {
  formatted: {
    y0: null,
    y1: null,
  },
  raw: {
    y0: null,
    y1: null,
  },
};
const colorValues1a = {
  seriesIdentifier: {
    specId: getSpecId('spec1'),
    yAccessor: 'y1',
    splitAccessors: new Map(),
    seriesKeys: [],
    key: '',
  },
};
const colorValues1b = {
  seriesIdentifier: {
    specId: getSpecId('spec1'),
    yAccessor: 'y1',
    splitAccessors: new Map(),
    seriesKeys: ['a', 'b'],
    key: '',
  },
};
const colorValues2a = {
  seriesIdentifier: {
    specId: getSpecId('spec2'),
    yAccessor: 'y1',
    splitAccessors: new Map(),
    seriesKeys: [],
    key: '',
  },
};
const colorValues2b = {
  seriesIdentifier: {
    specId: getSpecId('spec3'),
    yAccessor: 'y1',
    splitAccessors: new Map(),
    seriesKeys: ['c', 'd'],
    key: '',
  },
};
const spec1: BasicSeriesSpec = {
  id: getSpecId('spec1'),
  name: 'Spec 1 title',
  groupId: getGroupId('group'),
  seriesType: 'line',
  yScaleType: ScaleType.Log,
  xScaleType: ScaleType.Linear,
  xAccessor: 'x',
  yAccessors: ['y'],
  yScaleToDataExtent: false,
  data: [],
  hideInLegend: false,
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
  hideInLegend: false,
};

const axesSpecs = new Map<AxisId, AxisSpec>();
const axisSpec: AxisSpec = {
  id: getAxisId('axis1'),
  groupId: getGroupId('group1'),
  hide: false,
  showOverlappingTicks: false,
  showOverlappingLabels: false,
  position: Position.Left,
  tickSize: 10,
  tickPadding: 10,
  tickFormat: (value: any) => {
    return `${value}`;
  },
};
axesSpecs.set(axisSpec.id, axisSpec);

describe('Legends', () => {
  const seriesColor = new Map<string, SeriesCollectionValue>();
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
    const legend = computeLegend(seriesColor, seriesColorMap, specs, 'violet', axesSpecs);
    const expected = [
      {
        color: 'red',
        label: 'Spec 1 title',
        value: { colorValues: [], specId: 'spec1' },
        isSeriesVisible: true,
        isLegendItemVisible: true,
        key: 'colorSeries1a',
        displayValue: nullDisplayValue,
      },
    ];
    expect(Array.from(legend.values())).toEqual(expected);
  });
  it('compute legend for a single spec but with multiple series', () => {
    seriesColor.set('colorSeries1a', colorValues1a);
    seriesColor.set('colorSeries1b', colorValues1b);
    const legend = computeLegend(seriesColor, seriesColorMap, specs, 'violet', axesSpecs);
    const expected = [
      {
        color: 'red',
        label: 'Spec 1 title',
        value: { colorValues: [], specId: 'spec1' },
        isSeriesVisible: true,
        isLegendItemVisible: true,
        key: 'colorSeries1a',
        displayValue: nullDisplayValue,
      },
      {
        color: 'blue',
        label: 'a - b',
        value: { colorValues: ['a', 'b'], specId: 'spec1' },
        isSeriesVisible: true,
        isLegendItemVisible: true,
        key: 'colorSeries1b',
        displayValue: nullDisplayValue,
      },
    ];
    expect(Array.from(legend.values())).toEqual(expected);
  });
  it('compute legend for multiple specs', () => {
    seriesColor.set('colorSeries1a', colorValues1a);
    seriesColor.set('colorSeries2a', colorValues2a);
    const legend = computeLegend(seriesColor, seriesColorMap, specs, 'violet', axesSpecs);
    const expected = [
      {
        color: 'red',
        label: 'Spec 1 title',
        value: { colorValues: [], specId: 'spec1' },
        isSeriesVisible: true,
        isLegendItemVisible: true,
        key: 'colorSeries1a',
        displayValue: nullDisplayValue,
      },
      {
        color: 'green',
        label: 'spec2',
        value: { colorValues: [], specId: 'spec2' },
        isSeriesVisible: true,
        isLegendItemVisible: true,
        key: 'colorSeries2a',
        displayValue: nullDisplayValue,
      },
    ];
    expect(Array.from(legend.values())).toEqual(expected);
  });
  it('empty legend for missing spec', () => {
    seriesColor.set('colorSeries2b', colorValues2b);
    const legend = computeLegend(seriesColor, seriesColorMap, specs, 'violet', axesSpecs);
    expect(legend.size).toEqual(0);
  });
  it('compute legend with default color for missing series color', () => {
    seriesColor.set('colorSeries1a', colorValues1a);
    const emptyColorMap = new Map<string, string>();
    const legend = computeLegend(seriesColor, emptyColorMap, specs, 'violet', axesSpecs);
    const expected = [
      {
        color: 'violet',
        label: 'Spec 1 title',
        value: { colorValues: [], specId: 'spec1' },
        isSeriesVisible: true,
        isLegendItemVisible: true,
        key: 'colorSeries1a',
        displayValue: nullDisplayValue,
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

    const legend = computeLegend(seriesColor, emptyColorMap, specs, 'violet', axesSpecs, []);

    const visibility = [...legend.values()].map((item) => item.isSeriesVisible);

    expect(visibility).toEqual([true, true, true]);
  });
  it('selectively sets series to visible when there are deselectedDataSeries items', () => {
    seriesColor.set('colorSeries1a', colorValues1a);
    seriesColor.set('colorSeries1b', colorValues1b);
    seriesColor.set('colorSeries2a', colorValues2a);
    seriesColor.set('colorSeries2b', colorValues2b);

    const emptyColorMap = new Map<string, string>();
    const deselectedDataSeries = [colorValues1a.seriesIdentifier, colorValues1b.seriesIdentifier];

    const legend = computeLegend(seriesColor, emptyColorMap, specs, 'violet', axesSpecs, deselectedDataSeries);

    const visibility = [...legend.values()].map((item) => item.isSeriesVisible);
    expect(visibility).toEqual([false, false, true]);
  });
  it('returns the right series label for a color series', () => {
    const seriesIdentifier1 = {
      specId: getSpecId(''),
      yAccessor: 'y1',
      splitAccessors: new Map(),
      seriesKeys: [],
      key: '',
    };
    const seriesIdentifier2 = {
      specId: getSpecId(''),
      yAccessor: 'y1',
      splitAccessors: new Map(),
      seriesKeys: ['a', 'b'],
      key: '',
    };

    // null removed, seriesIdentifier has to be at least an empty array
    let label = getSeriesLabel(seriesIdentifier1, true);
    expect(label).toBeUndefined();
    label = getSeriesLabel(seriesIdentifier1, true, spec1);
    expect(label).toBe('Spec 1 title');
    label = getSeriesLabel(seriesIdentifier1, true, spec2);
    expect(label).toBe('spec2');
    label = getSeriesLabel(seriesIdentifier2, true, spec1);
    expect(label).toBe('Spec 1 title');
    label = getSeriesLabel(seriesIdentifier2, true, spec2);
    expect(label).toBe('spec2');

    label = getSeriesLabel(seriesIdentifier1, false, spec1);
    expect(label).toBe('Spec 1 title');
    label = getSeriesLabel(seriesIdentifier1, false, spec2);
    expect(label).toBe('spec2');
    label = getSeriesLabel(seriesIdentifier2, false, spec1);
    expect(label).toBe('a - b');
    label = getSeriesLabel(seriesIdentifier2, false, spec2);
    expect(label).toBe('a - b');

    label = getSeriesLabel(seriesIdentifier1, true, spec1);
    expect(label).toBe('Spec 1 title');
    label = getSeriesLabel(seriesIdentifier1, true, spec2);
    expect(label).toBe('spec2');
    label = getSeriesLabel(seriesIdentifier1, true);
    expect(label).toBeUndefined();
    label = getSeriesLabel(seriesIdentifier1, true, spec1);
    expect(label).toBe('Spec 1 title');
    label = getSeriesLabel(seriesIdentifier1, true, spec2);
    expect(label).toBe('spec2');
  });
  it('use the splitted value as label if has a single series and splitSeries is used', () => {
    const specWithSplit: BasicSeriesSpec = {
      ...spec1,
      splitSeriesAccessors: ['g'],
    };
    let label = getSeriesColorLabel([], true, specWithSplit);
    expect(label).toBe('Spec 1 title');

    label = getSeriesColorLabel(['a'], true, specWithSplit);
    expect(label).toBe('a');

    // happens when we have multiple values in splitSeriesAccessor
    // or we have also multiple yAccessors
    label = getSeriesColorLabel(['a', 'b'], true, specWithSplit);
    expect(label).toBe('a - b');

    // happens when the value of a splitSeriesAccessor is null
    label = getSeriesColorLabel([null], true, specWithSplit);
    expect(label).toBe('Spec 1 title');

    label = getSeriesColorLabel([], false, specWithSplit);
    expect(label).toBe('Spec 1 title');
  });
});
