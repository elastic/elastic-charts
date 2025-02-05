/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendItemExtraValues, LegendValue } from '../../common/legend';
import { SeriesIdentifier } from '../../common/series_id';
import { LegendItemListener, BasicListener, LegendColorPicker, LegendAction, LegendPositionConfig } from '../../specs';
import {
  clearTemporaryColors as clearTemporaryColorsAction,
  setTemporaryColor as setTemporaryColorAction,
  setPersistedColor as setPersistedColorAction,
} from '../../state/actions/colors';
import { LegendPath, onToggleDeselectSeriesAction } from '../../state/actions/legend';
import { LegendLabelOptions } from '../../utils/themes/theme';

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
