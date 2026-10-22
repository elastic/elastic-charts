/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { applyFitFunctionToDataSeries } from './fit_function_utils';
import { groupBy } from './group_data_series';
import { m4 } from './m4';
import type { BaseDatum, BasicSeriesSpec, SeriesNameConfigOptions, SeriesType, StackMode } from './specs';
import { isAreaSeriesSpec, isLineSeriesSpec } from './specs';
import { datumXSortPredicate, formatStackedDataSeriesValues } from './stacked_series_utils';
import type { Color } from '../../../common/colors';
import { Colors } from '../../../common/colors';
import type { SmallMultiplesDatum, SmallMultiplesGroupBy } from '../../../common/panel_utils';
import type { SeriesIdentifier, SeriesKey } from '../../../common/series_id';
import { ScaleType } from '../../../scales/constants';
import type { XScaleType } from '../../../specs';
import { BinAgg, Direction } from '../../../specs';
import type { OrderBy } from '../../../specs/settings';
import type { ColorOverrides } from '../../../state/color_overrides';
import type { Accessor, AccessorFn } from '../../../utils/accessor';
import { getAccessorValue } from '../../../utils/accessor';
import type { Datum } from '../../../utils/common';
import { isNil, stripUndefined } from '../../../utils/common';
import { CurveType, DEFAULT_CURVE } from '../../../utils/curves';
import type { GroupId } from '../../../utils/ids';
import { Logger } from '../../../utils/logger';
import type { SeriesCompareFn } from '../../../utils/series_sort';
import type { ColorConfig } from '../../../utils/themes/theme';
import { groupSeriesByYGroup, isStackedSpec } from '../domains/y_domain';
import { X_SCALE_DEFAULT } from '../scales/scale_defaults';
import type { ScaleConfigs } from '../state/selectors/get_api_scale_configs';
import { getSpecDomainGroupId } from '../state/utils/spec';

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

/**
 * The x and y values of all the rows of a spec, y being NaN where missing
 * @internal
 */
export type RawValues = { xs: Float64Array; ys: Float64Array };

/** @internal */
export type DataSeries<D extends BaseDatum = Datum> = XYChartSeriesIdentifier<D> & {
  groupId: GroupId;
  seriesType: SeriesType;
  data: DataSeriesDatum[];
  isStacked: boolean;
  stackMode: StackMode | undefined;
  spec: Exclude<BasicSeriesSpec, 'data'>;
  insertOrder: number;
  sortOrder: number;
  isFiltered: boolean;
  /**
   * The x and y values of all the rows of `spec.data`, for a series whose `data` only summarizes it for layout: the
   * geometries are built from these, and some legend values from `spec.data`
   */
  rawValues?: RawValues;
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
 * `data` defaults to the spec's data; a downsampled spec passes the rows of its summary.
 * @internal
 */
export function splitSeriesDataByAccessors(
  spec: BasicSeriesSpec,
  xValueSums: Map<string | number, number>,
  insertOrder = 0,
  isStacked = false,
  isBanded = false,
  stackMode?: StackMode,
  groupBySpec?: SmallMultiplesGroupBy,
  deselectedDataSeries: SeriesIdentifier[] = [],
  data = spec.data,
): {
  dataSeries: Map<SeriesKey, DataSeries>;
  xValues: Array<string | number>;
} {
  const {
    seriesType,
    id: specId,
    groupId,
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
          insertOrder: insertOrder + dataSeries.size,
          sortOrder: 0,
          isFiltered: deselectedDataSeries.some(({ key: deselectedKey }) => seriesKey === deselectedKey),
        });
      }

      xValueSums.set(x, sum);
    });
  }

  // the summary rows of a downsampled spec are some of its rows, whose non-numeric values layoutRows reported
  if (data === spec.data) warnNonNumericValues(specId, nonNumericValues);
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

function warnNonNumericValues(specId: string, nonNumericValues: Map<unknown, number>) {
  if (nonNumericValues.size > 0) {
    const values = [...nonNumericValues.entries()];
    const total = values.reduce((sum, [, v]) => sum + v, 0);
    Logger.warn(
      `Found ${total} non-numeric y value${total > 1 ? 's' : ''} in dataset for spec "${specId}"`,
      `(${values.map(([k, v]) => `${v}: ${JSON.stringify(k)}`).join(', ')})`,
    );
  }
}

/**
 * The x and y values of the first y accessor, y being NaN where missing, unless an x is not finite or not sorted.
 */
function numericValues({ data, xAccessor, yAccessors }: BasicSeriesSpec) {
  const yAccessor = yAccessors[0]!;
  const xs = new Float64Array(data.length); // the x of each row
  const ys = new Float64Array(data.length); // the y of each row, NaN where missing or not numeric
  const nonNumericValues = new Map<unknown, number>(); // how often each non-numeric y occurs, for the warning
  let previousX = -Infinity; // the x of the previous row, to check that x is sorted
  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    const x = typeof datum === 'object' && datum !== null ? getAccessorValue(datum, xAccessor) : undefined;
    if (typeof x !== 'number' || !Number.isFinite(x) || x < previousX) return;
    xs[i] = previousX = x;
    const y = getAccessorValue(datum, yAccessor);
    ys[i] = typeof y === 'number' && Number.isFinite(y) ? y : finiteOrNull(y, nonNumericValues) ?? NaN;
  }
  return { xs, ys, nonNumericValues };
}

/**
 * Converts rows of a spec to series data, reading only the x and first y accessors: callers pass the specs of
 * series with `rawValues`, which have no y0, mark size or split accessors and no small multiples.
 * @internal
 */
export function toSeriesData(spec: BasicSeriesSpec, rows: Datum[]): DataSeriesDatum[] {
  const yAccessor = spec.yAccessors[0]!;
  // getDataSeriesFromSpecs already reported the non-numeric values of these specs
  const nonNumericValues = new Map<unknown, number>();
  return rows.map((datum) => ({
    x: getAccessorValue(datum, spec.xAccessor),
    ...extractYAndMarkFromDatum(datum, yAccessor, nonNumericValues, false),
  }));
}

/**
 * The rows of a spec that M4 keeps in the given pixel bins, as series data, for the spec of a series with `rawValues`
 * and those values.
 * @internal
 */
export function m4SeriesData(
  spec: BasicSeriesSpec,
  { xs, ys }: RawValues,
  { scale, origin, offset }: { scale: number; origin: number; offset: number },
): DataSeriesDatum[] {
  return toSeriesData(
    spec,
    m4(xs, ys, scale, origin, offset).map((i) => spec.data[i]),
  );
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
  xIndex: Map<string | number, number>,
  xScaleType: ScaleType,
): DataSeries[] => {
  const xSortPredicate = datumXSortPredicate(xScaleType, xIndex);
  return dataSeries.map(({ data, ...rest }) => ({
    ...rest,
    data: data.slice().sort(xSortPredicate),
  }));
};

/** @internal */
export function getFormattedDataSeries(
  availableDataSeries: DataSeries[],
  xIndex: Map<string | number, number>,
  xScaleType: ScaleType,
): DataSeries[] {
  // apply fit function to every data series
  const fittedDataSeries = applyFitFunctionToDataSeries(
    getSortedDataSeries(availableDataSeries, xIndex, xScaleType),
    xScaleType,
  );

  // apply fitting for stacked DataSeries by YGroup, Panel
  const stackedDataSeries = fittedDataSeries.filter(({ isStacked }) => isStacked);
  const stackedGroups = groupBy<DataSeries>(
    stackedDataSeries,
    ['smHorizontalAccessorValue', 'smVerticalAccessorValue', 'groupId'],
    true,
  );

  const fittedAndStackedDataSeries = stackedGroups.flatMap((dataSeries) => {
    if (!dataSeries[0]) return [];
    const [{ stackMode, seriesType }] = dataSeries;
    return formatStackedDataSeriesValues(dataSeries, xIndex, seriesType, stackMode);
  });
  // get already fitted non stacked dataSeries
  const nonStackedDataSeries = fittedDataSeries.filter(({ isStacked }) => !isStacked);

  return [...fittedAndStackedDataSeries, ...nonStackedDataSeries].sort((a, b) => a.sortOrder - b.sortOrder);
}

// curves that stay within the y range of each pair of consecutive points, so M4 keeps the painted pixels
const MONOTONIC_CURVES: ReadonlySet<CurveType> = new Set([
  CurveType.LINEAR,
  CurveType.CURVE_MONOTONE_X,
  CurveType.CURVE_STEP,
  CurveType.CURVE_STEP_AFTER,
  CurveType.CURVE_STEP_BEFORE,
]);

// nothing is downsampled without the scale configs; some of these restrictions could be lifted in the future
function canDownsample(
  spec: BasicSeriesSpec,
  isStacked: boolean,
  scaleConfigs?: ScaleConfigs,
  smallMultiples?: SmallMultiplesGroupBy,
) {
  return (
    scaleConfigs !== undefined &&
    (isLineSeriesSpec(spec) || isAreaSeriesSpec(spec)) &&
    MONOTONIC_CURVES.has(spec.curve ?? DEFAULT_CURVE) &&
    !isStacked &&
    spec.fit === undefined &&
    spec.yAccessors.length === 1 &&
    !spec.y0Accessors?.length &&
    !spec.splitSeriesAccessors?.length &&
    spec.markSizeAccessor === undefined &&
    spec.pointStyleAccessor === undefined &&
    (scaleConfigs.x.type === ScaleType.Linear || scaleConfigs.x.type === ScaleType.Time) &&
    scaleConfigs.y[getSpecDomainGroupId(spec)]?.type === ScaleType.Linear &&
    !smallMultiples?.horizontal &&
    !smallMultiples?.vertical
  );
}

/**
 * The rows the data series of a spec start with, for the domains and the legend: the summary of a series that is
 * downsampled, with the numeric values of all its rows in `rawValues`, otherwise all the rows of the spec.
 */
function layoutRows(
  spec: BasicSeriesSpec,
  isStacked: boolean,
  scaleConfigs?: ScaleConfigs,
  smallMultiples?: SmallMultiplesGroupBy,
): { data: Datum[]; rawValues?: RawValues } {
  const values = canDownsample(spec, isStacked, scaleConfigs, smallMultiples) ? numericValues(spec) : undefined;
  if (!values) return { data: spec.data };
  const { xs, ys, nonNumericValues } = values;
  // the summary: the first and last rows with a y, and the lowest and highest, as M4 keeps them for a single bin,
  // plus the first and last rows, whose missing y the first and last legend values report
  const extremes = m4(xs, ys, 0, 0, 0, false);
  if (extremes.length === 0) return { data: spec.data };
  const kept = [...new Set([0, ...extremes, spec.data.length - 1])];
  if (kept.length >= spec.data.length) return { data: spec.data };
  warnNonNumericValues(spec.id, nonNumericValues);
  return { data: kept.map((i) => spec.data[i]), rawValues: { xs, ys } };
}

/** @internal */
export function getDataSeriesFromSpecs(
  seriesSpecs: BasicSeriesSpec[],
  deselectedDataSeries: SeriesIdentifier[] = [],
  orderOrdinalBinsBy?: OrderBy,
  seriesSort?: SeriesCompareFn,
  groupBySpec?: SmallMultiplesGroupBy,
  scaleConfigs?: ScaleConfigs,
): {
  dataSeries: DataSeries[];
  /** the x values of the data rows of every series; a downsampled series may contribute only its summary rows */
  xValues: Set<string | number>;
  /** the x values of all the rows of such downsampled series, one sorted list per series */
  rawXValues: Float64Array[];
  /** whether `rawXValues` hold every x value of `xValues`, as every series that adds x values is downsampled */
  rawXValuesHoldAll: boolean;
  smVValues: Set<string | number>;
  smHValues: Set<string | number>;
  fallbackScale?: XScaleType;
} {
  const globalDataSeries: DataSeries[] = [];
  const mutatedXValueSums = new Map<string | number, number>();

  // the x values of the data rows of every series; a downsampled series may contribute only its summary rows
  const globalXValues: Set<string | number> = new Set();
  const rawXValues: Float64Array[] = [];

  let isNumberArray = true;
  let isOrdinalScale = false;
  // stacked and fitted series get gaps at the x values of every other series, so they need them all
  let needsEveryXValue = false;
  // whether a series that isn't downsampled adds x values, which only `xValues` holds
  let hasNonDownsampledXValues = false;

  const specsByYGroup = groupSeriesByYGroup(seriesSpecs);
  let insertOrder = 0;
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
    const { data, rawValues } = layoutRows(spec, isStacked, scaleConfigs, groupBySpec);
    if (rawValues) rawXValues.push(rawValues.xs);
    needsEveryXValue ||= isStacked || ((isLineSeriesSpec(spec) || isAreaSeriesSpec(spec)) && spec.fit !== undefined);

    const { dataSeries, xValues } = splitSeriesDataByAccessors(
      spec,
      mutatedXValueSums,
      insertOrder,
      isStacked,
      isBanded,
      specGroup?.stackMode,
      groupBySpec,
      deselectedDataSeries,
      data,
    );

    insertOrder += dataSeries.size;

    for (const [, ds] of dataSeries) {
      if (rawValues) ds.rawValues = rawValues;
      globalDataSeries.push(ds);
    }

    hasNonDownsampledXValues ||= !rawValues && xValues.length > 0;

    // check the nature of the x values. If all of them are numbers
    // we can use a continuous scale, if not we should use an ordinal scale.
    // The xValue is already casted to be a valid number or a string
    for (const xValue of xValues) {
      if (isNumberArray && typeof xValue !== 'number') {
        isNumberArray = false;
      }
      // a downsampled series adds the x values of its summary rows, which include its first and last
      globalXValues.add(xValue);
    }
  }

  if (rawXValues.length > 0 && !isNumberArray) {
    return getDataSeriesFromSpecs(seriesSpecs, deselectedDataSeries, orderOrdinalBinsBy, seriesSort, groupBySpec);
  }
  if (needsEveryXValue) {
    for (const xs of rawXValues) for (const x of xs) globalXValues.add(x);
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

  globalDataSeries.sort(seriesSort).map((d, i) => {
    d.sortOrder = i;
    return d;
  });

  const smallMultipleUniqueValues = globalDataSeries.reduce<{
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
    dataSeries: globalDataSeries,
    // keep the user order for ordinal scales
    xValues,
    rawXValues: needsEveryXValue ? [] : rawXValues,
    rawXValuesHoldAll: rawXValues.length > 0 && !needsEveryXValue && !hasNonDownsampledXValues,
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
