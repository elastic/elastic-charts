import { ColorConfig } from '../../../utils/themes/theme';
import { Accessor } from '../../../utils/accessor';
import { GroupId, SpecId } from '../../../utils/ids';
import { splitSpecsByGroupId, YBasicSeriesSpec } from '../domains/y_domain';
import { formatNonStackedDataSeriesValues } from './nonstacked_series_utils';
import { isEqualSeriesKey } from './series_utils';
import { BasicSeriesSpec, Datum, SeriesAccessors } from './specs';
import { formatStackedDataSeriesValues } from './stacked_series_utils';
import { LastValues } from '../store/utils';
import { ScaleType } from '../../../utils/scales/scales';

export interface FilledValues {
  /** the x value */
  x: number | string;
  /** the max y value */
  y1: number | null;
  /** the minimum y value */
  y0: number | null;
}

export interface RawDataSeriesDatum {
  /** the x value */
  x: number | string;
  /** the main y metric */
  y1: number | null;
  /** the optional y0 metric, used for bars or area with a lower bound */
  y0?: number | null;
  /** the datum */
  datum?: any;
}

export interface DataSeriesDatum {
  /** the x value */
  x: number | string;
  /** the max y value */
  y1: number | null;
  /** the minimum y value */
  y0: number | null;
  /** initial y1 value, non stacked */
  initialY1: number | null;
  /** initial y0 value, non stacked */
  initialY0: number | null;
  /** the datum */
  datum?: any;
  /** the list of filled values because missing or nulls */
  filled?: Partial<FilledValues>;
}

export interface DataSeries {
  specId: SpecId;
  key: any[];
  seriesColorKey: string;
  data: DataSeriesDatum[];
}
export interface RawDataSeries {
  specId: SpecId;
  key: any[];
  seriesColorKey: string;
  data: RawDataSeriesDatum[];
}

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

export interface DataSeriesColorsValues {
  specId: SpecId;
  banded?: boolean;
  colorValues: any[];
  lastValue?: LastValues;
  specSortIndex?: number;
}

export function findDataSeriesByColorValues(
  series: DataSeriesColorsValues[] | null,
  value: DataSeriesColorsValues,
): number {
  if (!series) {
    return -1;
  }

  return series.findIndex((item: DataSeriesColorsValues) => {
    return isEqualSeriesKey(item.colorValues, value.colorValues) && item.specId === value.specId;
  });
}

/**
 * Split a dataset into multiple series depending on the accessors.
 * Each series is then associated with a key thats belong to its configuration.
 *
 */
export function splitSeries(
  data: Datum[],
  accessors: SeriesAccessors,
  specId: SpecId,
): {
  rawDataSeries: RawDataSeries[];
  colorsValues: Map<string, any[]>;
  xValues: Set<string | number>;
} {
  const { xAccessor, yAccessors, y0Accessors, splitSeriesAccessors = [] } = accessors;
  const isMultipleY = yAccessors && yAccessors.length > 1;
  const series = new Map<string, RawDataSeries>();
  const colorsValues = new Map<string, any[]>();
  const xValues = new Set<string | number>();

  data.forEach((datum) => {
    const seriesKey = getAccessorsValues(datum, splitSeriesAccessors);
    if (isMultipleY) {
      yAccessors.forEach((accessor, index) => {
        const colorValues = getColorValues(datum, splitSeriesAccessors, accessor);
        const colorValuesKey = getColorValuesAsString(colorValues, specId);
        colorsValues.set(colorValuesKey, colorValues);
        const cleanedDatum = cleanDatum(datum, xAccessor, accessor, y0Accessors && y0Accessors[index]);

        if (cleanedDatum.x !== null && cleanedDatum.x !== undefined) {
          xValues.add(cleanedDatum.x);
          updateSeriesMap(series, [...seriesKey, accessor], cleanedDatum, specId, colorValuesKey);
        }
      });
    } else {
      const colorValues = getColorValues(datum, splitSeriesAccessors);
      const colorValuesKey = getColorValuesAsString(colorValues, specId);
      colorsValues.set(colorValuesKey, colorValues);
      const cleanedDatum = cleanDatum(datum, xAccessor, yAccessors[0], y0Accessors && y0Accessors[0]);

      if (cleanedDatum.x !== null && cleanedDatum.x !== undefined) {
        xValues.add(cleanedDatum.x);
        updateSeriesMap(series, [...seriesKey], cleanedDatum, specId, colorValuesKey);
      }
    }
  });

  return {
    rawDataSeries: [...series.values()],
    colorsValues,
    xValues,
  };
}

/**
 * Mutate the passed map adding or updating the DataSeries stored
 * along with the series key
 */
function updateSeriesMap(
  seriesMap: Map<string, RawDataSeries>,
  seriesKey: any[],
  datum: RawDataSeriesDatum,
  specId: SpecId,
  seriesColorKey: string,
): Map<string, RawDataSeries> {
  const seriesKeyString = seriesKey.join('___');
  const series = seriesMap.get(seriesKeyString);
  if (series) {
    series.data.push(datum);
  } else {
    seriesMap.set(seriesKeyString, {
      specId,
      seriesColorKey,
      key: seriesKey,
      data: [datum],
    });
  }
  return seriesMap;
}

/**
 * Get the array of values that forms a series key
 */
function getAccessorsValues(datum: Datum, accessors: Accessor[] = []): any[] {
  return accessors
    .map((accessor) => {
      return datum[accessor];
    })
    .filter((value) => value !== undefined);
}

/**
 * Get the array of values that forms a series key
 */
function getColorValues(datum: Datum, accessors: Accessor[] = [], yAccessorValue?: any): any[] {
  const colorValues = getAccessorsValues(datum, accessors);
  if (yAccessorValue) {
    return [...colorValues, yAccessorValue];
  }
  return colorValues;
}
/**
 * Get the array of values that forms a series key
 */
export function getColorValuesAsString(colorValues: any[], specId: SpecId): string {
  return `specId:{${specId}},colors:{${colorValues}}`;
}

/**
 * Reformat the datum having only the required x and y property.
 */
function cleanDatum(datum: Datum, xAccessor: Accessor, yAccessor: Accessor, y0Accessor?: Accessor): RawDataSeriesDatum {
  const x = datum[xAccessor];
  const y1 = datum[yAccessor];
  const cleanedDatum: RawDataSeriesDatum = { x, y1, datum, y0: null };
  if (y0Accessor) {
    cleanedDatum.y0 = datum[y0Accessor];
  }
  return cleanedDatum;
}

export function getFormattedDataseries(
  specs: YBasicSeriesSpec[],
  dataSeries: Map<SpecId, RawDataSeries[]>,
  xValues: Set<string | number>,
  xScaleType: ScaleType,
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
    const { isPercentageStack } = groupSpecs;
    // format stacked data series
    const stackedDataSeries = getRawDataSeries(groupSpecs.stacked, dataSeries);
    const stackedDataSeriesValues = formatStackedDataSeriesValues(
      stackedDataSeries.rawDataSeries,
      false,
      isPercentageStack,
      xValues,
      xScaleType,
    );
    stackedFormattedDataSeries.push({
      groupId,
      counts: stackedDataSeries.counts,
      dataSeries: stackedDataSeriesValues,
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
/**
 *
 * @param seriesSpecs the map for all the series spec
 * @param deselectedDataSeries the array of deselected/hidden data series
 */
export function getSplittedSeries(
  seriesSpecs: Map<SpecId, BasicSeriesSpec>,
  deselectedDataSeries?: DataSeriesColorsValues[] | null,
): {
  splittedSeries: Map<SpecId, RawDataSeries[]>;
  seriesColors: Map<string, DataSeriesColorsValues>;
  xValues: Set<string | number>;
} {
  const splittedSeries = new Map<SpecId, RawDataSeries[]>();
  const seriesColors = new Map<string, DataSeriesColorsValues>();
  let xValues: Set<string | number> = new Set();
  let isOrdinalScale = false;
  for (const [specId, spec] of seriesSpecs) {
    if (spec.xScaleType === ScaleType.Ordinal) {
      isOrdinalScale = true;
    }
    const dataSeries = splitSeries(spec.data, spec, specId);
    let currentRawDataSeries = dataSeries.rawDataSeries;
    if (deselectedDataSeries) {
      currentRawDataSeries = dataSeries.rawDataSeries.filter(
        (series): boolean => {
          const seriesValues = {
            specId,
            colorValues: series.key,
          };

          return findDataSeriesByColorValues(deselectedDataSeries, seriesValues) < 0;
        },
      );
    }

    splittedSeries.set(specId, currentRawDataSeries);

    const banded = spec.y0Accessors && spec.y0Accessors.length > 0;

    dataSeries.colorsValues.forEach((colorValues, key) => {
      seriesColors.set(key, {
        specId,
        specSortIndex: spec.sortIndex,
        banded,
        colorValues,
      });
    });

    for (const xValue of dataSeries.xValues) {
      xValues.add(xValue);
    }
  }
  // keep the user order for ordinal scales
  if (!isOrdinalScale) {
    xValues = new Set([...xValues].sort());
  }
  return {
    splittedSeries,
    seriesColors,
    xValues,
  };
}

export function getSortIndex({ specSortIndex }: DataSeriesColorsValues, total: number): number {
  return specSortIndex != null ? specSortIndex : total;
}

export function getSortedDataSeriesColorsValuesMap(
  colorValuesMap: Map<string, DataSeriesColorsValues>,
): Map<string, DataSeriesColorsValues> {
  const seriesColorsArray = [...colorValuesMap];
  seriesColorsArray.sort(([, specA], [, specB]) => {
    return getSortIndex(specA, colorValuesMap.size) - getSortIndex(specB, colorValuesMap.size);
  });

  return new Map([...seriesColorsArray]);
}

export function getSeriesColorMap(
  seriesColors: Map<string, DataSeriesColorsValues>,
  chartColors: ColorConfig,
  customColors: Map<string, string>,
): Map<string, string> {
  const seriesColorMap = new Map<string, string>();
  let counter = 0;

  seriesColors.forEach((_, key) => {
    const customSeriesColor: string | undefined = customColors.get(key);
    const color = customSeriesColor || chartColors.vizColors[counter % chartColors.vizColors.length];

    seriesColorMap.set(key, color);
    counter++;
  });
  return seriesColorMap;
}
