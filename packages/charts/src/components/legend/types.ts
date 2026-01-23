/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { LegendItem, LegendItemExtraValues, LegendValue } from '../../common/legend';
import type { SeriesIdentifier } from '../../common/series_id';
import type {
  LegendItemListener,
  BasicListener,
  LegendColorPicker,
  LegendAction,
  LegendPositionConfig,
} from '../../specs/settings';
import type {
  clearTemporaryColors as clearTemporaryColorsAction,
  setTemporaryColor as setTemporaryColorAction,
  setPersistedColor as setPersistedColorAction,
} from '../../state/actions/colors';
import type { LegendPath, onToggleDeselectSeriesAction } from '../../state/actions/legend';
import type { LegendLabelOptions } from '../../utils/themes/theme';

/** @internal */
export interface SharedLegendItemProps {
  flatLegend: boolean;
  totalItems: number;
  positionConfig: LegendPositionConfig;
  extraValues: Map<string, LegendItemExtraValues>;
  legendValues: Array<LegendValue>;
  isMostlyRTL: boolean;
  labelOptions: LegendLabelOptions;
  colorPicker?: LegendColorPicker;
  action?: LegendAction;
  onClick?: LegendItemListener;
  onLegendItemMouseOver: (seriesIdentifiers: SeriesIdentifier[], path: LegendPath) => void;
  onLegendItemMouseOut: BasicListener;
  clearTemporaryColorsAction: typeof clearTemporaryColorsAction;
  setTemporaryColorAction: typeof setTemporaryColorAction;
  setPersistedColorAction: typeof setPersistedColorAction;
  toggleDeselectSeriesAction: typeof onToggleDeselectSeriesAction;
  legendTitle?: string;
  hiddenItems: number;
}

/** @internal */
export interface LegendItemProps extends SharedLegendItemProps {
  item: LegendItem;
}
