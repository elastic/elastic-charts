/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { FlameWithTooltip } from './flame_chart';
import { ChartType } from '..';
import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import { LegendItemExtraValues } from '../../common/legend';
import { SeriesKey } from '../../common/series_id';
import { InternalChartState } from '../../state/chart_state';
import { InitStatus } from '../../state/selectors/get_internal_is_intialized';

/** @internal */
export class FlameState implements InternalChartState {
  chartType = ChartType.Flame;
  getChartTypeDescription = () => 'Flame chart';
  chartRenderer = FlameWithTooltip;

  // default empty properties, unused in Flame
  eventCallbacks = () => {};
  isInitialized = () => InitStatus.Initialized;
  isBrushAvailable = () => false;
  isBrushing = () => false;
  isChartEmpty = () => false;
  getLegendItemsLabels = () => [];
  getLegendItems = () => [];
  getLegendExtraValues = () => new Map<SeriesKey, LegendItemExtraValues>();
  getPointerCursor = () => DEFAULT_CSS_CURSOR;
  getTooltipAnchor = () => ({ x: 0, y: 0, width: 0, height: 0 });
  isTooltipVisible = () => ({ visible: false, isExternal: false, displayOnly: false, isPinnable: false });
  getTooltipInfo = () => ({ header: null, values: [] });
  getProjectionContainerArea = () => ({ width: 0, height: 0, top: 0, left: 0 });
  getMainProjectionArea = () => ({ width: 0, height: 0, top: 0, left: 0 });
  getBrushArea = () => null;
  getDebugState = () => ({});
  getSmallMultiplesDomains() {
    return {
      smHDomain: [],
      smVDomain: [],
    };
  }
}
