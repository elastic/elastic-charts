/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '..';
import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import { LegendItemExtraValues } from '../../common/legend';
import { SeriesKey } from '../../common/series_id';
import { GlobalChartState, InternalChartState } from '../../state/chart_state';
import { InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getLastClickSelector } from '../../state/selectors/get_last_click';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';
import { Dimensions } from '../../utils/dimensions';
import { getFlameSpec } from './data_flow';
import { FlameWithTooltip } from './flame_chart';

const EMPTY_LIST: never[] = [];

/** @internal */
export class FlameState implements InternalChartState {
  chartType = ChartType.Flame;

  lastHoveredElement: number = NaN;
  lastClickedElement: number = NaN;
  lastClickedTime: number = -Infinity;

  isInitialized = (globalState: GlobalChartState) =>
    getFlameSpec(globalState) ? InitStatus.Initialized : InitStatus.SpecNotInitialized;

  eventCallbacks(globalState: GlobalChartState) {
    const settings = getSettingsSpecSelector(globalState);
    const next = globalState.interactions.hoveredGeomIndex;
    const lastClick = getLastClickSelector(globalState);

    if (settings.onElementOver && next >= 0 && !Object.is(this.lastHoveredElement, next)) {
      settings.onElementOver([{ vmIndex: next }]);
    }

    if (settings.onElementClick && next >= 0 && lastClick && this.lastClickedTime < lastClick.time) {
      this.lastClickedElement = next;
      this.lastClickedTime = lastClick.time;
      settings.onElementClick([{ vmIndex: next }]);
    }

    if (settings.onElementOut && Number.isNaN(next) && !Object.is(this.lastHoveredElement, next)) {
      settings.onElementOut();
    }

    this.lastHoveredElement = next;
  }

  chartRenderer = FlameWithTooltip;
  getChartTypeDescription = () => 'Flame chart';
  isBrushAvailable = () => false;
  isBrushing = () => false;
  isChartEmpty = () => false;
  getLegendItemsLabels = () => EMPTY_LIST;
  getLegendItems = () => EMPTY_LIST;
  getLegendExtraValues = () => new Map<SeriesKey, LegendItemExtraValues>();
  getPointerCursor = () => DEFAULT_CSS_CURSOR;
  getTooltipAnchor = () => ({ x: 0, y: 0, width: 0, height: 0 });
  isTooltipVisible = () => ({ visible: false, isExternal: false });
  getTooltipInfo = () => ({ header: null, values: [] });
  getProjectionContainerArea = (): Dimensions => ({ width: 0, height: 0, top: 0, left: 0 });
  getMainProjectionArea = (): Dimensions => ({ width: 0, height: 0, top: 0, left: 0 });
  getBrushArea = () => null;
  getDebugState = () => ({});
}
