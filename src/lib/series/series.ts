import { ColorConfig } from '../themes/theme';
import { Accessor, getAccessorValues } from '../utils/accessor';
import { GroupId, SpecId } from '../utils/ids';
import { splitSpecsByGroupId, YBasicSeriesSpec } from './domains/y_domain';
import { formatNonStackedDataSeriesValues } from './nonstacked_series_utils';
import { isArrayEqual } from './series_utils';
import { BasicSeriesSpec, Datum, SeriesAccessors } from './specs';
import { formatStackedDataSeriesValues } from './stacked_series_utils';
import { Merge } from '../utils/commons';

export interface RawDataSeriesDatum {
  /** the x value */
  x: number | string;
  /** the main y metric */
  y1: number | null;
  /** the optional y0 metric, used for bars or area with a lower bound */
  y0?: number | null;
  /** main(x) accessor value */
  xAccessor: Accessor;
  /** secondary(y) accessor value */
  yAccessor: Accessor;
  /** the datum */
  datum?: any;
}

export type DataSeriesDatum = Merge<
  RawDataSeriesDatum,
  {
    /** the minimum y value */
    y0: number | null;
    initialY1: number | null;
    /** initial y0 value, non stacked */
    initialY0: number | null;
    /** the datum */
    datum?: any;
  }
>;

export interface RawDataSeries {
  specId: SpecId;
  keys: any[];
  seriesKey: string;
  data: Map<string, RawDataSeriesDatum[]>;
}

export type DataSeries = Merge<
  RawDataSeries,
  {
    data: Map<string, DataSeriesDatum[]>;
  }
>;

export interface FormattedDataSeries {
  groupId: GroupId;
  dataSeries: DataSeries[];
  counts: DataSeriesCounts;
}

export interface DataSeriesCounts {
  barSeries: number;
  lineSeries: number;
  areaSeries: number;
}

export interface DataSeriesValues {
  specId?: SpecId;
  group?: string;
  accessors?: any[];
  lastValue?: any;
  specSortIndex?: number;
}

export const BASE_GROUP_KEY = '__base__';

export function getSeriesIndex(series: DataSeriesValues[] | null, value: DataSeriesValues): number {
  if (!series) {
    return -1;
  }

  return series.findIndex((item: DataSeriesValues) => {
    return isArrayEqual(item!.accessors, value!.accessors) && item.specId === value.specId;
  });
}

/**
 * Split a dataset into multiple series, each having a key with the relative
 * series configuration
 */
export function splitSeries(
  data: Datum[],
  accessors: SeriesAccessors,
  specId: SpecId,
): {
  rawDataSeries: RawDataSeries[];
  xValues: Set<any>;
  splitSeriesLastValues: Map<string, any>;
} {
  const { xAccessor, yAccessors, y0Accessors, splitSeriesAccessors = [], groupAccessors } = accessors;
  const isMultipleY = yAccessors && yAccessors.length > 1;
  const series = new Map<string, RawDataSeries>();
  const xValues = new Set<any>();
  const splitSeriesLastValues = new Map<string, any>();

  data.forEach((datum) => {
    const splitSeriesKeys = getAccessorValues(datum, splitSeriesAccessors);

    if (isMultipleY) {
      yAccessors.forEach((accessor, index) => {
        const seriesKeys = [...splitSeriesKeys, accessor];
        const seriesKey = getSeriesKey(specId, seriesKeys);
        const cleanedDatum = cleanDatum(datum, xAccessor, accessor, y0Accessors && y0Accessors[index]);
        const [groupKey] = getAccessorValues(cleanedDatum, groupAccessors);
        splitSeriesLastValues.set(seriesKey, cleanedDatum.y1);
        xValues.add(cleanedDatum.x);
        updateSeriesMap(series, seriesKeys, seriesKey, cleanedDatum, specId, groupKey);
      });
    } else {
      const seriesKey = getSeriesKey(specId, splitSeriesKeys);
      const cleanedDatum = cleanDatum(datum, xAccessor, yAccessors[0], y0Accessors && y0Accessors[0]);
      const [groupKey] = getAccessorValues(cleanedDatum, groupAccessors);
      splitSeriesLastValues.set(seriesKey, cleanedDatum.y1);
      xValues.add(cleanedDatum.x);
      updateSeriesMap(series, splitSeriesKeys, seriesKey, cleanedDatum, specId, groupKey);
    }
  });

  return {
    rawDataSeries: [...series.values()],
    xValues,
    splitSeriesLastValues,
  };
}

/**
 * Mutate the passed map adding or updating the DataSeries stored
 * along with the series key
 */
function updateSeriesMap(
  seriesMap: Map<string, RawDataSeries>,
  keys: any[],
  seriesKey: string,
  datum: RawDataSeriesDatum,
  specId: SpecId,
  groupKey: string = BASE_GROUP_KEY,
): Map<string, RawDataSeries> {
  const series = seriesMap.get(seriesKey);
  if (series) {
    if (series.data.has(groupKey)) {
      series.data.get(groupKey)!.push(datum);
    } else {
      series.data.set(groupKey, [datum]);
    }
  } else {
    const data = new Map<string, RawDataSeriesDatum[]>();
    data.set(groupKey, [datum]);
    seriesMap.set(seriesKey, {
      specId,
      keys,
      seriesKey,
      data,
    });
  }
  return seriesMap;
}

/**
 * Get series key as string
 */
export function getSeriesKey(specId?: SpecId, accessors: any[] = []): string {
  return `specId:{${specId}},accessors:{${accessors}}`;
}

/**
 * Reformat the datum having only the required x and y property.
 */
function cleanDatum(datum: Datum, xAccessor: Accessor, yAccessor: Accessor, y0Accessor?: Accessor): RawDataSeriesDatum {
  const x = datum[xAccessor];
  const y1 = datum[yAccessor];
  const cleanedDatum: RawDataSeriesDatum = {
    x,
    y1,
    datum,
    xAccessor,
    yAccessor,
    y0: null,
  };
  if (y0Accessor) {
    cleanedDatum.y0 = datum[y0Accessor];
  }
  return cleanedDatum;
}

export function getFormattedDataseries(
  specs: YBasicSeriesSpec[],
  dataSeries: Map<SpecId, RawDataSeries[]>,
): {
  stacked: FormattedDataSeries[];
  nonStacked: FormattedDataSeries[];
} {
  const specsByGroupIds = splitSpecsByGroupId(specs);
  const specsByGroupIdsEntries = [...specsByGroupIds.entries()];

  const stackedFormattedDataSeries: {
    groupId: GroupId;
    dataSeries: DataSeries[];
    counts: DataSeriesCounts;
  }[] = [];
  const nonStackedFormattedDataSeries: {
    groupId: GroupId;
    dataSeries: DataSeries[];
    counts: DataSeriesCounts;
  }[] = [];

  specsByGroupIdsEntries.forEach(([groupId, groupSpecs]) => {
    // format stacked data series
    const stackedDataSeries = getRawDataSeries(groupSpecs.stacked, dataSeries);
    stackedFormattedDataSeries.push({
      groupId,
      counts: stackedDataSeries.counts,
      dataSeries: formatStackedDataSeriesValues(stackedDataSeries.rawDataSeries, false),
    });

    // format non stacked data series
    const nonStackedDataSeries = getRawDataSeries(groupSpecs.nonStacked, dataSeries);
    nonStackedFormattedDataSeries.push({
      groupId,
      counts: nonStackedDataSeries.counts,
      dataSeries: formatNonStackedDataSeriesValues(nonStackedDataSeries.rawDataSeries, false),
    });
  });
  return {
    stacked: stackedFormattedDataSeries.filter((ds) => ds.dataSeries.length > 0),
    nonStacked: nonStackedFormattedDataSeries.filter((ds) => ds.dataSeries.length > 0),
  };
}

export function getRawDataSeries(
  seriesSpecs: YBasicSeriesSpec[],
  dataSeries: Map<SpecId, RawDataSeries[]>,
): {
  rawDataSeries: RawDataSeries[];
  counts: DataSeriesCounts;
} {
  const rawDataSeries: RawDataSeries[] = [];
  const counts = {
    barSeries: 0,
    lineSeries: 0,
    areaSeries: 0,
  };
  const seriesSpecsCount = seriesSpecs.length;
  let i;
  for (i = 0; i < seriesSpecsCount; i++) {
    const spec = seriesSpecs[i];
    const { id, seriesType } = spec;
    const ds = dataSeries.get(id);
    switch (seriesType) {
      case 'bar':
        counts.barSeries += ds ? ds.length : 0;
        break;
      case 'line':
        counts.lineSeries += ds ? ds.length : 0;
        break;
      case 'area':
        counts.areaSeries += ds ? ds.length : 0;
        break;
    }

    if (ds) {
      rawDataSeries.push(...ds);
    }
  }
  return {
    rawDataSeries,
    counts,
  };
}

export function getSplittedSeries(
  seriesSpecs: Map<SpecId, BasicSeriesSpec>,
  deselectedDataSeries?: DataSeriesValues[] | null,
): {
  splittedSeries: Map<SpecId, RawDataSeries[]>;
  xValues: Set<any>;
} {
  const splittedSeries = new Map<SpecId, RawDataSeries[]>();
  const xValues: Set<any> = new Set();
  for (const [specId, spec] of seriesSpecs) {
    const dataSeries = splitSeries(spec.data, spec, specId);
    let currentRawDataSeries = dataSeries.rawDataSeries;
    if (deselectedDataSeries) {
      currentRawDataSeries = dataSeries.rawDataSeries.filter(
        (series): boolean => getSeriesIndex(deselectedDataSeries, series) < 0,
      );
    }

    splittedSeries.set(specId, currentRawDataSeries);

    // dataSeries.colorsValues.forEach((colorValues, key) => {
    //   const lastValue = dataSeries.splitSeriesLastValues.get(key);

    //   seriesColors.set(key, {
    //     specId,
    //     specSortIndex: spec.sortIndex,
    //     colorValues,
    //     lastValue,
    //   });
    // });

    for (const xValue of dataSeries.xValues) {
      xValues.add(xValue);
    }
  }
  return {
    splittedSeries,
    xValues,
  };
}

export function getSortedDataSeriesColorsValuesMap(
  colorValuesMap: Map<string, DataSeriesValues>,
): Map<string, DataSeriesValues> {
  const seriesColorsArray = [...colorValuesMap];
  seriesColorsArray.sort(([, colorValuesA], [, colorValuesB]) => {
    const specAIndex = colorValuesA.specSortIndex != null ? colorValuesA.specSortIndex : colorValuesMap.size;
    const specBIndex = colorValuesB.specSortIndex != null ? colorValuesB.specSortIndex : colorValuesMap.size;

    return specAIndex - specBIndex;
  });

  return new Map([...seriesColorsArray]);
}

export function getSeriesColorMap(
  seriesColors: Map<string, DataSeriesValues>,
  chartColors: ColorConfig,
  customColors: Map<string, string>,
): Map<string, string> {
  const seriesColorMap = new Map<string, string>();
  let counter = 0;

  seriesColors.forEach((_, seriesColorKey: string) => {
    const customSeriesColor: string | undefined = customColors.get(seriesColorKey);
    const color = customSeriesColor || chartColors.vizColors[counter % chartColors.vizColors.length];

    seriesColorMap.set(seriesColorKey, color);
    counter++;
  });
  return seriesColorMap;
}
