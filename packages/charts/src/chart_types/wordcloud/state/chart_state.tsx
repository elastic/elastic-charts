/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { getWordcloudSpecSelector } from './selectors/wordcloud_spec';
import { ChartType } from '../..';
import { DEFAULT_CSS_CURSOR } from '../../../common/constants';
import { EMPTY_LEGEND_ITEM_EXTRA_VALUES, EMPTY_LEGEND_LIST } from '../../../common/legend';
import type { InternalChartState, GlobalChartState } from '../../../state/chart_state';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { EMPTY_LEGEND_ITEM_LIST } from '../../../state/selectors/get_legend_items_labels';
import type { DebugState } from '../../../state/types';
import type { Dimensions } from '../../../utils/dimensions';
import { Wordcloud } from '../renderer/svg/connected_component';

const EMPTY_TOOLTIP = Object.freeze({ header: null, values: [] });

/** @internal */
export class WordcloudState implements InternalChartState {
  chartType = ChartType.Wordcloud;

  isInitialized(globalState: GlobalChartState) {
    return getWordcloudSpecSelector(globalState) !== null ? InitStatus.Initialized : InitStatus.ChartNotInitialized;
  }

  isBrushAvailable() {
    return false;
  }

  isBrushing() {
    return false;
  }

  isChartEmpty() {
    return false;
  }

  getLegendItems() {
    return EMPTY_LEGEND_LIST;
  }

  getLegendItemsLabels() {
    return EMPTY_LEGEND_ITEM_LIST;
  }

  getLegendExtraValues() {
    return EMPTY_LEGEND_ITEM_EXTRA_VALUES;
  }

  chartRenderer() {
    return <Wordcloud />;
  }

  getPointerCursor() {
    return DEFAULT_CSS_CURSOR;
  }

  isTooltipVisible() {
    return {
      visible: false,
      isExternal: false,
      displayOnly: false,
      isPinnable: false,
    };
  }

  getTooltipInfo() {
    return EMPTY_TOOLTIP;
  }

  getTooltipAnchor(state: GlobalChartState) {
    const { position } = state.interactions.pointer.current;
    return {
      isRotated: false,
      x: position.x,
      width: 0,
      y: position.y,
      height: 0,
    };
  }

  eventCallbacks() {}

  getChartTypeDescription() {
    return 'Word cloud chart';
  }

  // TODO
  getProjectionContainerArea(): Dimensions {
    return { width: 0, height: 0, top: 0, left: 0 };
  }

  // TODO
  getMainProjectionArea(): Dimensions {
    return { width: 0, height: 0, top: 0, left: 0 };
  }

  // TODO
  getBrushArea(): Dimensions | null {
    return null;
  }

  // TODO
  getDebugState(): DebugState {
    return {};
  }

  getSmallMultiplesDomains() {
    return {
      smHDomain: [],
      smVDomain: [],
    };
  }

  canDisplayChartTitles = () => true;
}
