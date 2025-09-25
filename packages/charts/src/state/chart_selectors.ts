/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { CSSProperties } from 'react';

import type { GlobalChartState } from './chart_state';
import { getA11ySettingsSelector } from './selectors/get_accessibility_config';
import { InitStatus } from './selectors/get_internal_is_intialized';
import type { TooltipVisibility } from './tooltip_visibility';
import type { DebugState } from './types';
import { DEFAULT_CSS_CURSOR } from '../common/constants';
import type { LegendItem, LegendItemExtraValues } from '../common/legend';
import { EMPTY_LEGEND_LIST, EMPTY_LEGEND_ITEM_EXTRA_VALUES } from '../common/legend';
import type { SmallMultiplesSeriesDomains } from '../common/panel_utils';
import type { SeriesKey } from '../common/series_id';
import type { AnchorPosition } from '../components/portal/types';
import type { TooltipInfo } from '../components/tooltip/types';
import type { Dimensions } from '../utils/dimensions';

/** @internal */
export interface ScreenReaderItem {
  /** The label for this part of the summary */
  label: string;
  /** Optional ID for referencing this part */
  id?: string;
  /** The value for this part of the summary */
  value: string;
}

/** @internal */
export interface ChartSpecificScreenReaderData {
  /** Custom summary parts to include in the consolidated summary */
  screenReaderItems?: ScreenReaderItem[];
}

/** @internal */
export interface LegendItemLabel {
  label: string;
  depth: number;
}

/** @internal */
export const EMPTY_LEGEND_ITEM_LIST: LegendItemLabel[] = [];

/**
 * A set of chart-type-dependant functions that are required by all chart types
 * @internal
 */
export interface ChartSelectors {
  /**
   * Returns the initialization status of the chart
   * @param globalState
   */
  isInitialized(globalState: GlobalChartState): InitStatus;

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
   * Get chart-specific data for screen reader accessibility
   */
  getScreenReaderData?(globalState: GlobalChartState): ChartSpecificScreenReaderData;

  /**
   * Get the domain of the vertical and horizontal small multiple grids
   */
  getSmallMultiplesDomains(globalState: GlobalChartState): SmallMultiplesSeriesDomains;

  /**
   * Determines if chart titles are displayed when provided
   */
  canDisplayChartTitles(globalState: GlobalChartState): boolean;
}

/** @internal */
export type ChartSelectorsFactory = () => ChartSelectors;

const EMPTY_TOOLTIP = Object.freeze({ header: null, values: [] });

type CallbackCreator = () => (state: GlobalChartState) => void;

/** @internal */
export const createChartSelectorsFactory =
  (
    overrides: Partial<Omit<ChartSelectors, 'eventCallbacks'>> = {},
    callbacksCreators: Array<CallbackCreator> = [],
  ): ChartSelectorsFactory =>
  () => {
    const callbacks = callbacksCreators.map((cb) => cb());

    const chartSelectors = {
      isInitialized: () => InitStatus.SpecNotInitialized,
      isBrushAvailable: () => false,
      isBrushing: () => false,
      isChartEmpty: () => true,
      getLegendItems: () => EMPTY_LEGEND_LIST,
      getLegendItemsLabels: () => EMPTY_LEGEND_ITEM_LIST,
      getLegendExtraValues: () => EMPTY_LEGEND_ITEM_EXTRA_VALUES,
      getPointerCursor: () => DEFAULT_CSS_CURSOR,
      isTooltipVisible: () => ({
        visible: false,
        isExternal: false,
        displayOnly: false,
        isPinnable: false,
      }),
      getTooltipInfo: () => EMPTY_TOOLTIP,
      getTooltipAnchor: () => null,
      getProjectionContainerArea: () => ({ top: 0, left: 0, width: 0, height: 0 }),
      getMainProjectionArea: () => ({ top: 0, left: 0, width: 0, height: 0 }),
      getBrushArea: () => null,
      getDebugState: () => ({}),
      getChartTypeDescription: () => '',
      // The default screen reader data returns just the chart type description.
      getScreenReaderData: (state: GlobalChartState): ChartSpecificScreenReaderData => {
        const a11ySettings = getA11ySettingsSelector(state);
        const chartTypeDescription = chartSelectors.getChartTypeDescription(state);
        return {
          screenReaderItems: chartTypeDescription
            ? [{ label: 'Chart type', id: a11ySettings.defaultSummaryId, value: chartTypeDescription }]
            : [],
        };
      },
      getSmallMultiplesDomains: () => ({ smVDomain: [], smHDomain: [] }),
      canDisplayChartTitles: () => true,
      ...overrides,
      eventCallbacks: (state: GlobalChartState) => {
        callbacks.forEach((cb) => cb(state));
      },
    };

    return chartSelectors;
  };

/** @internal */
export interface ChartSelectorRegistry {
  [chartType: string]: ChartSelectors;
}
