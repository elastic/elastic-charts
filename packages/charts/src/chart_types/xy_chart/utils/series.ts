/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { applyFitFunctionToDataSeries } from './fit_function_utils';
import { groupBy } from './group_data_series';
import { BaseDatum, BasicSeriesSpec, SeriesNameConfigOptions, SeriesSpecs, SeriesType, StackMode } from './specs';
import { datumXSortPredicate, formatStackedDataSeriesValues } from './stacked_series_utils';
import { Color, Colors } from '../../../common/colors';
import { SmallMultiplesDatum, SmallMultiplesGroupBy } from '../../../common/panel_utils';
import { SeriesIdentifier, SeriesKey } from '../../../common/series_id';
import { ScaleType } from '../../../scales/constants';
import { BinAgg, Direction, XScaleType } from '../../../specs';
import { OrderBy } from '../../../specs/settings';
import { ColorOverrides } from '../../../state/chart_state';
import { Accessor, AccessorFn, getAccessorValue } from '../../../utils/accessor';
import { Datum, isNil, stripUndefined } from '../../../utils/common';
import { GroupId } from '../../../utils/ids';
import { Logger } from '../../../utils/logger';
import { SeriesCompareFn } from '../../../utils/series_sort';
import { ColorConfig } from '../../../utils/themes/theme';
import { groupSeriesByYGroup, isStackedSpec } from '../domains/y_domain';
import { X_SCALE_DEFAULT } from '../scales/scale_defaults';

/** @internal */
export const SERIES_DELIMITER = ' - ';

/** @public */
export interface FilledValues {
  /** the x value */
  x?: number | string;
  /** the max y value */
  y1?: number;
  /** the minimum y value */
  y0?: number;
}

/** @public */
export interface DataSeriesDatum<T = any> {
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
  /** the optional mark metric, used for lines and area series */
  mark: number | null;
  /** initial datum */
  datum: T;
  /** the list of filled values because missing or nulls */
  filled?: FilledValues;
}

/** @public */
export interface XYChartSeriesIdentifier<D extends BaseDatum = Datum> extends SeriesIdentifier, SmallMultiplesDatum {
  xAccessor: Accessor<D>;
  yAccessor: Accessor<D>;
  splitAccessors: Map<string | number, string | number>; // does the map have a size vs making it optional
  seriesKeys: (string | number)[];
}

/** @internal */
export type DataSeries<D extends BaseDatum = Datum> = XYChartSeriesIdentifier<D> & {
  groupId: GroupId;
  seriesType: SeriesType;
  data: DataSeriesDatum[];
  isStacked: boolean;
  stackMode: StackMode | undefined;
  spec: Exclude<BasicSeriesSpec, 'data'>;
  sortOrder: number;
  isFiltered: boolean;
};

/** @internal */
export type DataSeriesCounts = { [key in SeriesType]: number };

/** @internal */
export function getSeriesIndex(series: SeriesIdentifier[], target: SeriesIdentifier): number {
  if (!series) {
    return -1;
  }

  return series.findIndex(({ key }) => target.key === key);
}

/**
 * Returns string form of accessor. Uses index when accessor is a function.
 * @internal
 */
export function getAccessorFieldName<D extends BaseDatum>(
  accessor: Accessor<D> | AccessorFn<D>,
  index: number,
): Accessor<D> | string {
  return typeof accessor === 'function' ? accessor.fieldName ?? `(index:${index})` : accessor;
}

/**
 * Split a dataset into multiple series depending on the accessors.
 * Each series is then associated with a key that belongs to its configuration.
 * This method removes every data with an invalid x: a string or number value is required
 * `y` values and `mark` values are casted to number or null.
 * @internal
 */
export function splitSeriesDataByAccessors(
  spec: BasicSeriesSpec,
  xValueSums: Map<string | number, number>,
  isStacked = false,
  isBanded = false,
  stackMode?: StackMode,
  groupBySpec?: SmallMultiplesGroupBy,
): {
  dataSeries: Map<SeriesKey, DataSeries>;
  xValues: Array<string | number>;
} {
  const {
    seriesType,
    id: specId,
    groupId,
    data,
    xAccessor,
    yAccessors,
    y0Accessors,
    markSizeAccessor,
    splitSeriesAccessors = [],
  } = spec;
  const dataSeries = new Map<SeriesKey, DataSeries>();
  const xValues: Array<string | number> = [];
  const nonNumericValues: Map<unknown, number> = new Map();

  if (isStacked && Boolean(y0Accessors?.length)) {
    Logger.warn(
      `y0Accessors are not allowed with stackAccessors. y0Accessors will be ignored but available under initialY0.`,
    );
  }

  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    const splitAccessors = getSplitAccessors(datum, splitSeriesAccessors);
    // if splitSeriesAccessors are defined we should have at least one split value to include datum
    if (splitSeriesAccessors.length > 0 && splitAccessors.size < 1) {
      continue;
    }

    // skip if the datum is not an object or null
    if (typeof datum !== 'object' || datum === null) {
      continue;
    }
    const x = getAccessorValue(datum, xAccessor);
    // skip if the x value is not a string or a number
    if (typeof x !== 'string' && typeof x !== 'number') {
      continue;
    }

    xValues.push(x);
    let sum = xValueSums.get(x) ?? 0;

    // extract small multiples aggregation values
    const smH = groupBySpec?.horizontal?.by?.(spec, datum);
    const smV = groupBySpec?.vertical?.by?.(spec, datum);

    const xAccessorStr = getAccessorFieldName(xAccessor, 0);
    yAccessors.forEach((accessor, index) => {
      const cleanedDatum = extractYAndMarkFromDatum(
        datum,
        accessor,
        nonNumericValues,
        isBanded,
        y0Accessors && y0Accessors[index],
        markSizeAccessor,
      );

      const yAccessorStr = getAccessorFieldName(accessor, index);
      const splitAccessorStrs = [...splitAccessors.values()].map((a, si) => getAccessorFieldName(a, si));
      const seriesKeys = [...splitAccessorStrs, yAccessorStr];
      const seriesIdentifier: Omit<XYChartSeriesIdentifier, 'key'> = stripUndefined({
        specId,
        seriesKeys,
        xAccessor: xAccessorStr,
        yAccessor: yAccessorStr,
        splitAccessors,
        smVerticalAccessorValue: smV,
        smHorizontalAccessorValue: smH,
      });
      const seriesKey = getSeriesKey(seriesIdentifier, groupId);
      sum += cleanedDatum.y1 ?? 0;
      const newDatum = { x, ...cleanedDatum, smH, smV };
      const series = dataSeries.get(seriesKey);
      if (series) {
        series.data.push(newDatum);
      } else {
        dataSeries.set(seriesKey, {
          ...seriesIdentifier,
          groupId,
          seriesType,
          stackMode,
          isStacked,
          seriesKeys,
          key: seriesKey,
          data: [newDatum],
          spec,
          sortOrder: 0,
          isFiltered: false,
        });
      }

      xValueSums.set(x, sum);
    });
  }

  if (nonNumericValues.size > 0) {
    const values = [...nonNumericValues.entries()];
    const total = values.reduce((sum, [, v]) => sum + v, 0);
    Logger.warn(
      `Found ${total} non-numeric y value${total > 1 ? 's' : ''} in dataset for spec "${specId}"`,
      `(${values.map(([k, v]) => `${v}: ${JSON.stringify(k)}`).join(', ')})`,
    );
  }
  return {
    dataSeries,
    xValues,
  };
}

/**
 * Gets global series key to id any series as a string
 * @internal
 */
export function getSeriesKey(
  {
    specId,
    yAccessor,
    splitAccessors,
    smVerticalAccessorValue,
    smHorizontalAccessorValue,
  }: Pick<
    XYChartSeriesIdentifier,
    'specId' | 'yAccessor' | 'splitAccessors' | 'smVerticalAccessorValue' | 'smHorizontalAccessorValue'
  >,
  groupId: GroupId,
): string {
  const joinedAccessors = [...splitAccessors.entries()]
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([key, value]) => `${key}-${value}`)
    .join('|');
  const smV = smVerticalAccessorValue ? `smV{${smVerticalAccessorValue}}` : '';
  const smH = smHorizontalAccessorValue ? `smH{${smHorizontalAccessorValue}}` : '';
  return `groupId{${groupId}}spec{${specId}}yAccessor{${yAccessor}}splitAccessors{${joinedAccessors}}${smV}${smH}`;
}

/**
 * Get the array of values that forms a series key
 * @internal
 */
function getSplitAccessors<D extends BaseDatum>(
  datum: D,
  accessors: (Accessor<D> | AccessorFn<D>)[] = [],
): Map<string | number, string | number> {
  const splitAccessors = new Map<string | number, string | number>();
  if (typeof datum === 'object' && datum !== null) {
    accessors.forEach((accessor, index) => {
      const value = getAccessorValue(datum, accessor);
      if (typeof value === 'string' || typeof value === 'number') {
        const accessorStr = getAccessorFieldName(accessor, index);
        splitAccessors.set(accessorStr, value);
      }
    });
  }
  return splitAccessors;
}

/**
 * Extract y1 and y0 and mark properties from Datum. Casting them to numbers or null
 * @internal
 */
export function extractYAndMarkFromDatum<D extends BaseDatum>(
  datum: D,
  yAccessor: Accessor<D> | AccessorFn<D>,
  nonNumericValues: Map<unknown, number>,
  bandedSpec: boolean,
  y0Accessor?: Accessor<D> | AccessorFn<D>,
  markSizeAccessor?: Accessor<D> | AccessorFn<D>,
): Pick<DataSeriesDatum, 'y0' | 'y1' | 'mark' | 'datum' | 'initialY0' | 'initialY1'> {
  const mark =
    markSizeAccessor === undefined ? null : finiteOrNull(getAccessorValue(datum, markSizeAccessor), nonNumericValues);
  const y1Value = getAccessorValue(datum, yAccessor);
  const y1 = finiteOrNull(y1Value, nonNumericValues);
  const y0 = y0Accessor ? finiteOrNull(getAccessorValue(datum, y0Accessor), nonNumericValues) : null;
  return { y1, datum, y0: bandedSpec ? y0 : null, mark, initialY0: y0, initialY1: y1 };
}

function finiteOrNull(value: unknown, nonNumericValues: Map<unknown, number>): number | null {
  const candidateNumber = Number(value ?? undefined);
  const finite = Number.isFinite(candidateNumber);
  if (!finite) {
    const val = nonNumericValues.get(value) ?? 0;
    nonNumericValues.set(value, val + 1);
  }
  return finite ? candidateNumber : null;
}

/** Sorts data based on order of xValues */
const getSortedDataSeries = (
  dataSeries: DataSeries[],
  xValues: Set<string | number>,
  xScaleType: ScaleType,
): DataSeries[] =>
  dataSeries.map(({ data, ...rest }) => ({
    ...rest,
    data: data.toSorted(datumXSortPredicate(xScaleType, [...xValues.values()])),
  }));

/** @internal */
export function getFormattedDataSeries(
  seriesSpecs: SeriesSpecs,
  availableDataSeries: DataSeries[],
  xValues: Set<string | number>,
  xScaleType: ScaleType,
): DataSeries[] {
  // apply fit function to every data series
  const fittedDataSeries = applyFitFunctionToDataSeries(
    getSortedDataSeries(availableDataSeries, xValues, xScaleType),
    seriesSpecs,
    xScaleType,
  );

  // apply fitting for stacked DataSeries by YGroup, Panel
  const stackedDataSeries = fittedDataSeries.filter(({ spec }) => isStackedSpec(spec));
  const stackedGroups = groupBy<DataSeries>(
    stackedDataSeries,
    ['smHorizontalAccessorValue', 'smVerticalAccessorValue', 'groupId'],
    true,
  );

  const fittedAndStackedDataSeries = stackedGroups.reduce<DataSeries[]>((acc, dataSeries) => {
    if (!dataSeries[0]) return acc;
    const [{ stackMode, seriesType }] = dataSeries;
    const formatted = formatStackedDataSeriesValues(dataSeries, xValues, seriesType, stackMode);
    return [...acc, ...formatted];
  }, []);
  // get already fitted non stacked dataSeries
  const nonStackedDataSeries = fittedDataSeries.filter(({ spec }) => !isStackedSpec(spec));

  return [...fittedAndStackedDataSeries, ...nonStackedDataSeries].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** @internal */
export function getDataSeriesFromSpecs(
  seriesSpecs: BasicSeriesSpec[],
  deselectedDataSeries: SeriesIdentifier[] = [],
  orderOrdinalBinsBy?: OrderBy,
  seriesSort?: SeriesCompareFn,
  groupBySpec?: SmallMultiplesGroupBy,
): {
  dataSeries: DataSeries[];
  xValues: Set<string | number>;
  smVValues: Set<string | number>;
  smHValues: Set<string | number>;
  fallbackScale?: XScaleType;
} {
  let globalDataSeries: DataSeries[] = [];
  const mutatedXValueSums = new Map<string | number, number>();

  // the unique set of values along the x axis
  const globalXValues: Set<string | number> = new Set();

  let isNumberArray = true;
  let isOrdinalScale = false;

  const specsByYGroup = groupSeriesByYGroup(seriesSpecs);

  // eslint-disable-next-line no-restricted-syntax
  for (const spec of seriesSpecs) {
    // check scale type and cast to Ordinal if we found at least one series
    // with Ordinal Scale
    if (spec.xScaleType === ScaleType.Ordinal) {
      isOrdinalScale = true;
    }

    const specGroup = specsByYGroup.get(spec.groupId);
    const isStacked = Boolean(specGroup?.stacked.find(({ id }) => id === spec.id));
    const isBanded = isBandedSpec(spec);

    const { dataSeries, xValues } = splitSeriesDataByAccessors(
      spec,
      mutatedXValueSums,
      isStacked,
      isBanded,
      specGroup?.stackMode,
      groupBySpec,
    );

    // filter deselected DataSeries
    let filteredDataSeries: DataSeries[] = [...dataSeries.values()];
    if (deselectedDataSeries.length > 0) {
      filteredDataSeries = filteredDataSeries.map((series) => ({
        ...series,
        isFiltered: deselectedDataSeries.some(({ key: deselectedKey }) => series.key === deselectedKey),
      }));
    }

    globalDataSeries = [...globalDataSeries, ...filteredDataSeries];

    // check the nature of the x values. If all of them are numbers
    // we can use a continuous scale, if not we should use an ordinal scale.
    // The xValue is already casted to be a valid number or a string
    // eslint-disable-next-line no-restricted-syntax
    for (const xValue of xValues) {
      if (isNumberArray && typeof xValue !== 'number') {
        isNumberArray = false;
      }
      globalXValues.add(xValue);
    }
  }

  const xValues =
    isOrdinalScale || !isNumberArray
      ? getSortedOrdinalXValues(globalXValues, mutatedXValueSums, orderOrdinalBinsBy)
      : new Set(
          [...globalXValues].sort((a, b) => {
            if (typeof a === 'string' || typeof b === 'string') {
              return 0;
            }
            return a - b;
          }),
        );

  const dataSeries = globalDataSeries.toSorted(seriesSort).map((d, i) => ({
    ...d,
    sortOrder: i,
  }));

  const smallMultipleUniqueValues = dataSeries.reduce<{
    smVValues: Set<string | number>;
    smHValues: Set<string | number>;
  }>(
    (acc, curr) => {
      if (curr.isFiltered) {
        return acc;
      }
      if (!isNil(curr.smHorizontalAccessorValue)) {
        acc.smHValues.add(curr.smHorizontalAccessorValue);
      }
      if (!isNil(curr.smVerticalAccessorValue)) {
        acc.smVValues.add(curr.smVerticalAccessorValue);
      }
      return acc;
    },
    { smVValues: new Set(), smHValues: new Set() },
  );

  return {
    dataSeries,
    // keep the user order for ordinal scales
    xValues,
    ...smallMultipleUniqueValues,
    fallbackScale: !isOrdinalScale && !isNumberArray ? X_SCALE_DEFAULT.type : undefined,
  };
}

/**
 * TODO: Add check for chart type other than area and bar.
 * @internal
 */
export function isBandedSpec(spec: BasicSeriesSpec): boolean {
  return Boolean(spec.y0Accessors && spec.y0Accessors.length > 0 && !isStackedSpec(spec));
}

function getSortedOrdinalXValues(
  xValues: Set<string | number>,
  xValueSums: Map<string | number, number>,
  orderOrdinalBinsBy?: OrderBy,
) {
  if (!orderOrdinalBinsBy) {
    return xValues; // keep the user order for ordinal scales
  }

  switch (orderOrdinalBinsBy?.binAgg) {
    case BinAgg.None:
      return xValues; // keep the user order for ordinal scales
    case BinAgg.Sum:
    default:
      return new Set(
        [...xValues].sort(
          (v1, v2) =>
            (orderOrdinalBinsBy.direction === Direction.Ascending ? 1 : -1) *
            ((xValueSums.get(v1) ?? 0) - (xValueSums.get(v2) ?? 0)),
        ),
      );
  }
}

const BIG_NUMBER = Number.MAX_SAFE_INTEGER; // the sort comparator must yield finite results, can't use infinities

function getSeriesNameFromOptions(
  options: SeriesNameConfigOptions,
  { yAccessor, splitAccessors }: XYChartSeriesIdentifier,
  delimiter: string,
): string | null {
  if (!options.names) {
    return null;
  }

  return (
    [...options.names]
      .sort(({ sortIndex: a = BIG_NUMBER }, { sortIndex: b = BIG_NUMBER }) => a - b)
      .map(({ accessor, value, name }) => {
        const accessorValue = splitAccessors.get(accessor) ?? null;
        if (accessorValue === value) {
          return name ?? value;
        }

        if (yAccessor === accessor) {
          return name ?? accessor;
        }
        return null;
      })
      .filter((d) => Boolean(d) || d === 0)
      .join(delimiter) || null
  );
}

/**
 * Get series name based on `SeriesIdentifier`
 * @internal
 */
export function getSeriesName(
  seriesIdentifier: XYChartSeriesIdentifier,
  hasSingleSeries: boolean,
  isTooltip: boolean,
  spec?: BasicSeriesSpec,
): string {
  const customLabel =
    typeof spec?.name === 'function'
      ? spec.name(seriesIdentifier, isTooltip)
      : typeof spec?.name === 'object' // extract booleans once https://github.com/microsoft/TypeScript/issues/12184 is fixed
        ? getSeriesNameFromOptions(spec.name, seriesIdentifier, spec.name.delimiter ?? SERIES_DELIMITER)
        : null;

  if (customLabel !== null) {
    return customLabel.toString();
  }

  const multipleYAccessors = spec && spec.yAccessors.length > 1;
  const nameKeys = multipleYAccessors ? seriesIdentifier.seriesKeys : seriesIdentifier.seriesKeys.slice(0, -1);
  const nonZeroLength = nameKeys.length > 0;

  return nonZeroLength && (spec?.splitSeriesAccessors || !hasSingleSeries)
    ? nameKeys.join(typeof spec?.name === 'object' ? spec.name.delimiter ?? SERIES_DELIMITER : SERIES_DELIMITER)
    : spec === undefined
      ? ''
      : typeof spec.name === 'string'
        ? spec.name
        : spec.id;
}

/**
 * Helper function to get highest override color.
 * From highest to lowest: `temporary`, `seriesSpec.color` then, unless `temporary` is set to `null`, `persisted`
 */
function getHighestOverride(
  key: string,
  customColors: Map<SeriesKey, Color>,
  overrides: ColorOverrides,
): Color | undefined {
  const tempColor: Color | undefined | null = overrides.temporary[key];
  // Unexpected empty `tempColor` string is falsy and falls through, see comment in `export type Color = ...`
  // Use default color when temporary and custom colors are null
  return tempColor || customColors.get(key) || (tempColor === null ? undefined : overrides.persisted[key]);
}

/**
 * Returns color for a series given all color hierarchies
 * @internal
 */
export function getSeriesColors(
  dataSeries: DataSeries[],
  chartColors: ColorConfig,
  customColors: Map<SeriesKey, Color>,
  overrides: ColorOverrides,
): Map<SeriesKey, Color> {
  const seriesColorMap = new Map<SeriesKey, Color>();
  let counter = 0;
  groupBy(
    dataSeries,
    (ds) => {
      return [ds.specId, ds.groupId, ds.yAccessor, ...ds.splitAccessors.values()].join('__');
    },
    true,
  ).forEach(([ds]) => {
    if (!ds) return;
    const seriesKey = getSeriesKey(
      {
        specId: ds.specId,
        yAccessor: ds.yAccessor,
        splitAccessors: ds.splitAccessors,
      },
      ds.groupId,
    );
    const colorOverride = getHighestOverride(seriesKey, customColors, overrides);
    const color =
      colorOverride || chartColors.vizColors[counter % chartColors.vizColors.length] || Colors.White.keyword;

    seriesColorMap.set(seriesKey, color);
    counter++;
  });
  return seriesColorMap;
}

/**
 * Return xy charts series identifier from data series.
 * @internal
 */
export function getSeriesIdentifierFromDataSeries(dataSeries: DataSeries): XYChartSeriesIdentifier {
  const {
    key,
    specId,
    seriesKeys,
    xAccessor,
    yAccessor,
    splitAccessors,
    smVerticalAccessorValue,
    smHorizontalAccessorValue,
  } = dataSeries;

  return stripUndefined({
    key,
    specId,
    seriesKeys,
    xAccessor,
    yAccessor,
    splitAccessors,
    smVerticalAccessorValue,
    smHorizontalAccessorValue,
  });
}
