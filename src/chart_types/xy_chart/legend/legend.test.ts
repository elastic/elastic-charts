import { AxisId, getAxisId, getGroupId, getSpecId, SpecId } from '../../../utils/ids';
import { ScaleType } from '../../../utils/scales/scales';
import { computeLegend, getSeriesColorLabel } from './legend';
import { DataSeriesColorsValues, getColorValuesAsString } from '../utils/series';
import { AxisSpec, BasicSeriesSpec, Position } from '../utils/specs';

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
  const seriesColor = new Map<string, DataSeriesColorsValues>();
  const seriesColorMap = new Map<string, string>();
  const seriesNameMap = new Map<string, string>();
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
    const legend = computeLegend(seriesColor, seriesColorMap, seriesNameMap, specs, 'violet', axesSpecs);
    const expected = [
      {
        color: 'red',
        label: 'Spec 1 title',
        value: { colorValues: [], specId: 'spec1' },
        isSeriesVisible: true,
        isLegendItemVisible: true,
        key: 'colorSeries1a',
        displayValue: {},
      },
    ];
    expect(Array.from(legend.values())).toEqual(expected);
  });
  it('compute legend for a single spec but with multiple series', () => {
    seriesColor.set('colorSeries1a', colorValues1a);
    seriesColor.set('colorSeries1b', colorValues1b);
    const legend = computeLegend(seriesColor, seriesColorMap, seriesNameMap, specs, 'violet', axesSpecs);
    const expected = [
      {
        color: 'red',
        label: 'Spec 1 title',
        value: { colorValues: [], specId: 'spec1' },
        isSeriesVisible: true,
        isLegendItemVisible: true,
        key: 'colorSeries1a',
        displayValue: {},
      },
      {
        color: 'blue',
        label: 'a - b',
        value: { colorValues: ['a', 'b'], specId: 'spec1' },
        isSeriesVisible: true,
        isLegendItemVisible: true,
        key: 'colorSeries1b',
        displayValue: {},
      },
    ];
    expect(Array.from(legend.values())).toEqual(expected);
  });
  it('compute legend for multiple specs', () => {
    seriesColor.set('colorSeries1a', colorValues1a);
    seriesColor.set('colorSeries2a', colorValues2a);
    const legend = computeLegend(seriesColor, seriesColorMap, seriesNameMap, specs, 'violet', axesSpecs);
    const expected = [
      {
        color: 'red',
        label: 'Spec 1 title',
        value: { colorValues: [], specId: 'spec1' },
        isSeriesVisible: true,
        isLegendItemVisible: true,
        key: 'colorSeries1a',
        displayValue: {},
      },
      {
        color: 'green',
        label: 'spec2',
        value: { colorValues: [], specId: 'spec2' },
        isSeriesVisible: true,
        isLegendItemVisible: true,
        key: 'colorSeries2a',
        displayValue: {},
      },
    ];
    expect(Array.from(legend.values())).toEqual(expected);
  });
  it('empty legend for missing spec', () => {
    seriesColor.set('colorSeries2b', colorValues2b);
    const legend = computeLegend(seriesColor, seriesColorMap, seriesNameMap, specs, 'violet', axesSpecs);
    expect(legend.size).toEqual(0);
  });
  it('compute legend with default color for missing series color', () => {
    seriesColor.set('colorSeries1a', colorValues1a);
    const emptyColorMap = new Map<string, string>();
    const legend = computeLegend(seriesColor, emptyColorMap, seriesNameMap, specs, 'violet', axesSpecs);
    const expected = [
      {
        color: 'violet',
        label: 'Spec 1 title',
        value: { colorValues: [], specId: 'spec1' },
        isSeriesVisible: true,
        isLegendItemVisible: true,
        key: 'colorSeries1a',
        displayValue: {},
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

    const legend = computeLegend(
      seriesColor,
      emptyColorMap,
      seriesNameMap,
      specs,
      'violet',
      axesSpecs,
      deselectedDataSeries,
    );

    const visibility = [...legend.values()].map((item) => item.isSeriesVisible);

    expect(visibility).toEqual([true, true, true]);
  });
  it('selectively sets series to visible when there are deselectedDataSeries items', () => {
    seriesColor.set('colorSeries1a', colorValues1a);
    seriesColor.set('colorSeries1b', colorValues1b);
    seriesColor.set('colorSeries2a', colorValues2a);
    seriesColor.set('colorSeries2b', colorValues2b);

    const emptyColorMap = new Map<string, string>();
    const deselectedDataSeries = [colorValues1a, colorValues1b];

    const legend = computeLegend(
      seriesColor,
      emptyColorMap,
      seriesNameMap,
      specs,
      'violet',
      axesSpecs,
      deselectedDataSeries,
    );

    const visibility = [...legend.values()].map((item) => item.isSeriesVisible);
    expect(visibility).toEqual([false, false, true]);
  });

  describe('getSeriesColorLabel', () => {
    it('should return undefined if there is no spec and hasSingleSeries is true', () => {
      const label = getSeriesColorLabel([], true, new Map(), '');
      expect(label).toBeUndefined();
    });

    it('should return undefined if there is no spec and hasSingleSeries is false', () => {
      const label = getSeriesColorLabel([], false, new Map(), '');
      expect(label).toBeUndefined();
    });

    it('should return spec name when hasSingleSeries is true', () => {
      const label = getSeriesColorLabel([], true, new Map(), '', spec1);
      expect(label).toBe(spec1.name);
    });

    it('should return spec name when hasSingleSeries is false', () => {
      const label = getSeriesColorLabel([], false, new Map(), '', spec1);
      expect(label).toBe(spec1.name);
    });

    it('should return spec id if no name when hasSingleSeries is true', () => {
      const label = getSeriesColorLabel([], true, new Map(), '', spec2);
      expect(label).toBe(spec2.id);
    });

    it('should return spec id if no name when hasSingleSeries is false', () => {
      const label = getSeriesColorLabel([], false, new Map(), '', spec2);
      expect(label).toBe('spec2');
    });

    it('should return spec name, not colorValues, when hasSingleSeries is true', () => {
      const label = getSeriesColorLabel(['a', 'b'], true, new Map(), '', spec1);
      expect(label).toBe('Spec 1 title');
    });

    it('should return colorValues, not spec name, when hasSingleSeries is false', () => {
      const label = getSeriesColorLabel(['a', 'b'], false, new Map(), '', spec1);
      expect(label).toBe('a - b');
    });

    it('should return spec id, not colorValues, when hasSingleSeries is true', () => {
      const label = getSeriesColorLabel(['a', 'b'], true, new Map(), '', spec2);
      expect(label).toBe(spec2.id);
    });

    it('should return colorValues, not spec id, when hasSingleSeries is false', () => {
      const label = getSeriesColorLabel(['a', 'b'], false, new Map(), '', spec2);
      expect(label).toBe('a - b');
    });

    it('should return custom name for given series', () => {
      const customName = 'Custom series name';
      const seriesKey = getColorValuesAsString(['a', 'b'], spec2.id);
      const names = new Map<string, string>([[seriesKey, customName]]);
      const label = getSeriesColorLabel(['a', 'b'], false, names, seriesKey, spec2);
      expect(label).toBe(customName);
    });
  });
});
