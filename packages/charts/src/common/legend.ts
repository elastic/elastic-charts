/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { $Values } from 'utility-types';

import type { CategoryKey, CategoryLabel } from './category';
import type { Color } from './colors';
import type { SeriesKey, SeriesIdentifier } from './series_id';
import type { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import type { LegendPositionConfig, SeriesType } from '../specs';
import type { LegendPath } from '../state/actions/legend';
import type { Layout, Position } from '../utils/common';
import { LayoutDirection, Position as PositionObj } from '../utils/common';
import type { PointStyle } from '../utils/themes/theme';

/**
 * @internal
 */
export function isPosition(value: Position | LegendPositionConfig): value is Position {
  return Object.values(PositionObj).includes(value as Position);
}

/** @internal */
export type LegendItemChildId = CategoryKey;

/** @public */
export type LegendItemValue = { value: PrimitiveValue; label: string; maxLabel?: string; type: LegendValue };

/** @public */
export const LegendValue = Object.freeze({
  /** Value of the bucket being hovered or last bucket value when not hovering. */
  CurrentAndLastValue: 'currentAndLastValue' as const,
  /** Last value considering all data points in the chart */
  LastValue: 'lastValue' as const,
  /** Last non-null value */
  LastNonNullValue: 'lastNonNullValue' as const,
  /** Average value considering all data points in the chart */
  Average: 'average' as const,
  /** Median value considering all data points in the chart */
  Median: 'median' as const,
  /** Maximum value considering all data points in the chart */
  Max: 'max' as const,
  /** Minimum value considering all data points in the chart */
  Min: 'min' as const,
  /** First value considering all data points in the chart */
  FirstValue: 'firstValue' as const,
  /** First non-null value */
  FirstNonNullValue: 'firstNonNullValue' as const,
  /** Sum of al values plotted in the chart */
  Total: 'total' as const,
  /** number of data points plotted in the chart */
  Count: 'count' as const,
  /** number of data points with different values plotted in the chart */
  DistinctCount: 'distinctCount' as const,
  /** Variance of all data points plotted in the chart */
  Variance: 'variance' as const,
  /** Standard deviation of all data points plotted in the chart */
  StdDeviation: 'stdDeviation' as const,
  /**  Difference between min and max values */
  Range: 'range' as const,
  /** Difference between first and last values */
  Difference: 'difference' as const,
  /** % difference between first and last values */
  DifferencePercent: 'differencePercent' as const,
  /** Partition section value */
  Value: 'value' as const,
  /** Partition section value in percent */
  Percent: 'percent' as const,
});
/** @public */
export type LegendValue = $Values<typeof LegendValue>;

/** @internal */
export type LegendItem = {
  seriesIdentifiers: SeriesIdentifier[];
  childId?: LegendItemChildId;
  // zero indexed
  depth: number;
  /**
   * Path to iterm in hierarchical legend
   */
  path: LegendPath;
  color: Color;
  label: CategoryLabel;
  isSeriesHidden?: boolean;
  isItemHidden?: boolean;
  values: LegendItemValue[];
  // TODO: Remove when partition layers are toggleable
  isToggleable?: boolean;
  keys: Array<string | number>;
  pointStyle?: PointStyle;
  seriesType?: SeriesType;
};

/** @internal */
export type LegendItemExtraValues = Map<LegendItemChildId, LegendItemValue>;

/** @internal */
export const shouldDisplayTable = (legendValues: LegendValue[], legendLayout?: Layout) => {
  if (legendLayout === undefined) {
    return legendValues.some((v) => v !== LegendValue.CurrentAndLastValue && v !== LegendValue.Value);
  }
  return legendLayout === 'table';
};

/** @internal */
export const shouldDisplayGridList = (
  isTableView: boolean,
  legendPosition: Position | LegendPositionConfig,
  legendLayout?: Layout,
) => {
  if (isTableView) {
    return false;
  }
  // For backward compatibility, if legendLayout is undefined, show the gridList
  if (legendLayout === undefined) {
    return true;
  }
  if (isPosition(legendPosition)) {
    return legendPosition === PositionObj.Left || legendPosition === PositionObj.Right;
  }

  return legendPosition.direction === LayoutDirection.Vertical;
};

/**
 * todo: i18n
 * @internal
 */
export const legendValueTitlesMap = {
  [LegendValue.CurrentAndLastValue]: 'Value',
  [LegendValue.Value]: 'Value',
  [LegendValue.Percent]: 'Percent',
  [LegendValue.LastValue]: 'Last',
  [LegendValue.LastNonNullValue]: 'Last non-null',
  [LegendValue.FirstValue]: 'First',
  [LegendValue.FirstNonNullValue]: 'First non-null',
  [LegendValue.Average]: 'Avg',
  [LegendValue.Median]: 'Median',
  [LegendValue.Min]: 'Min',
  [LegendValue.Max]: 'Max',
  [LegendValue.Total]: 'Total',
  [LegendValue.Count]: 'Count',
  [LegendValue.DistinctCount]: 'Dist Count',
  [LegendValue.Variance]: 'Variance',
  [LegendValue.StdDeviation]: 'Std dev',
  [LegendValue.Range]: 'Range',
  [LegendValue.Difference]: 'Diff',
  [LegendValue.DifferencePercent]: 'Diff %',
};

/** @internal */
export const EMPTY_LEGEND_ITEM_EXTRA_VALUES = new Map<SeriesKey, LegendItemExtraValues>();
/** @internal */
export const EMPTY_LEGEND_LIST: LegendItem[] = [];
