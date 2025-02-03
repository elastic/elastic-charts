/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CSSProperties, RefObject } from 'react';

import { GlobalChartState } from './global_chart_state';
import { InitStatus } from './selectors/get_internal_is_intialized';
import { LegendItemLabel } from './selectors/get_legend_items_labels';
import { DebugState } from './types';
import { ChartType } from '../chart_types/chart_type';
import { LegendItem, LegendItemExtraValues } from '../common/legend';
import { SmallMultiplesSeriesDomains } from '../common/panel_utils';
import { SeriesKey } from '../common/series_id';
import { AnchorPosition } from '../components/portal/types';
import { TooltipInfo } from '../components/tooltip/types';
import { Dimensions } from '../utils/dimensions';

/** @internal */
export interface TooltipVisibility {
  visible: boolean;
  isExternal: boolean;
  isPinnable: boolean;
  displayOnly: boolean;
}

/** @internal */
export type BackwardRef = () => RefObject<HTMLDivElement>;

/**
 * A set of chart-type-dependant functions that required by all chart type
 * @internal
 */
export interface InternalChartState {
  /**
   * The chart type
   */
  chartType: ChartType;
  isInitialized(globalState: GlobalChartState): InitStatus;
  /**
   * Returns a JSX element with the chart rendered (lenged excluded)
   * @param containerRef
   * @param forwardStageRef
   */
  chartRenderer(containerRef: BackwardRef, forwardStageRef: RefObject<HTMLCanvasElement>): JSX.Element | null;
  /**
   * `true` if the brush is available for this chart type
   * @param globalState
   */
  isBrushAvailable(globalState: GlobalChartState): boolean;
  /**
   * `true` if the brush is available for this chart type
   * @param globalState
   */
  isBrushing(globalState: GlobalChartState): boolean;
  /**
   * `true` if the chart is empty (no data displayed)
   * @param globalState
   */
  isChartEmpty(globalState: GlobalChartState): boolean;

  /**
   * Returns the list of legend items labels. Mainly used to compute the legend size
   * based on labels and their hierarchy depth.
   * @param globalState
   */
  getLegendItemsLabels(globalState: GlobalChartState): LegendItemLabel[];

  /**
   * Returns the list of legend items.
   * @param globalState
   */
  getLegendItems(globalState: GlobalChartState): LegendItem[];
  /**
   * Returns the list of extra values for each legend item
   * @param globalState
   */
  getLegendExtraValues(globalState: GlobalChartState): Map<SeriesKey, LegendItemExtraValues>;
  /**
   * Returns the CSS pointer cursor depending on the internal chart state
   * @param globalState
   */
  getPointerCursor(globalState: GlobalChartState): CSSProperties['cursor'];
  /**
   * Describe if the tooltip is visible and comes from an external source
   * @param globalState
   */
  isTooltipVisible(globalState: GlobalChartState): TooltipVisibility;
  /**
   * Get the tooltip information to display
   * @param globalState the GlobalChartState
   */
  getTooltipInfo(globalState: GlobalChartState): TooltipInfo | undefined;

  /**
   * Get the tooltip anchor position
   * @param globalState
   */
  getTooltipAnchor(globalState: GlobalChartState): AnchorPosition | null;

  /**
   * Called on every state change to activate any event callback
   * @param globalState
   */
  eventCallbacks(globalState: GlobalChartState): void;

  /**
   * Get the chart main projection area: exclude legends, axis and other external marks
   * @param globalState
   */
  getMainProjectionArea(globalState: GlobalChartState): Dimensions;

  /**
   * Get the chart container projection area
   * @param globalState
   */
  getProjectionContainerArea(globalState: GlobalChartState): Dimensions;

  /**
   * Get the brushed area if available
   * @param globalState
   */
  getBrushArea(globalState: GlobalChartState): Dimensions | null;

  /**
   * Get debug state of chart
   * @param globalState
   */
  getDebugState(globalState: GlobalChartState): DebugState;

  /**
   * Get the series types for the screen reader summary component
   */
  getChartTypeDescription(globalState: GlobalChartState): string;

  /**
   * Get the domain of the vertical and horizontal small multiple grids
   */
  getSmallMultiplesDomains(globalState: GlobalChartState): SmallMultiplesSeriesDomains;

  /**
   * Determines if chart titles are displayed when provided
   */
  canDisplayChartTitles(globalState: GlobalChartState): boolean;
}
