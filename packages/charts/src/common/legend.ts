/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CategoryKey, CategoryLabel } from './category';
import { Color } from './colors';
import { SeriesIdentifier } from './series_id';
import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { SeriesType } from '../specs';
import { LegendPath } from '../state/actions/legend';
import { PointStyle } from '../utils/themes/theme';

/** @internal */
export type LegendItemChildId = CategoryKey;

/** @internal */
export type LegendItem = {
  seriesIdentifiers: SeriesIdentifier[];
  childId?: LegendItemChildId;
  depth?: number;
  /**
   * Path to iterm in hierarchical legend
   */
  path: LegendPath;
  color: Color;
  label: CategoryLabel;
  isSeriesHidden?: boolean;
  isItemHidden?: boolean;
  defaultExtra?: {
    raw: number | null;
    formatted: number | string | null;
    legendSizingLabel: number | string | null;
  };
  // TODO: Remove when partition layers are toggleable
  isToggleable?: boolean;
  keys: Array<string | number>;
  pointStyle?: PointStyle;
  seriesType?: SeriesType;
};

/** @internal */
export type LegendItemExtraValues = Map<LegendItemChildId, { raw: PrimitiveValue; formatted: string }>;
