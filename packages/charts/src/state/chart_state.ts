/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { CSSProperties, RefObject } from 'react';

import { StateActions } from './actions';
import { CHART_RENDERED } from './actions/chart';
import { UPDATE_CHART_TITLES, UPDATE_PARENT_DIMENSION } from './actions/chart_settings';
import { CLEAR_TEMPORARY_COLORS, SET_PERSISTED_COLOR, SET_TEMPORARY_COLOR } from './actions/colors';
import { DOMElement } from './actions/dom_element';
import { EXTERNAL_POINTER_EVENT } from './actions/events';
import { LegendPath } from './actions/legend';
import { REMOVE_SPEC, SPEC_PARSED, SPEC_UNMOUNTED, UPSERT_SPEC } from './actions/specs';
import { Z_INDEX_EVENT } from './actions/z_index';
import { interactionsReducer } from './reducers/interactions';
import { getInternalIsInitializedSelector, InitStatus } from './selectors/get_internal_is_intialized';
import { getLegendItemsSelector } from './selectors/get_legend_items';
import { LegendItemLabel } from './selectors/get_legend_items_labels';
import { DebugState } from './types';
import { getInitialPointerState, getInitialTooltipState } from './utils';
import { ChartType } from '../chart_types';
import { FlameState } from '../chart_types/flame_chart/internal_chart_state';
import { GoalState } from '../chart_types/goal_chart/state/chart_state';
import { HeatmapState } from '../chart_types/heatmap/state/chart_state';
import { MetricState } from '../chart_types/metric/state/chart_state';
import { PartitionState } from '../chart_types/partition_chart/state/chart_state';
import { TimeslipState } from '../chart_types/timeslip/internal_chart_state';
import { WordcloudState } from '../chart_types/wordcloud/state/chart_state';
import { XYAxisChartState } from '../chart_types/xy_chart/state/chart_state';
import { CategoryKey } from '../common/category';
import { Color } from '../common/colors';
import { LegendItem, LegendItemExtraValues } from '../common/legend';
import { SmallMultiplesSeriesDomains } from '../common/panel_utils';
import { SeriesIdentifier, SeriesKey } from '../common/series_id';
import { AnchorPosition } from '../components/portal/types';
import { TooltipInfo } from '../components/tooltip/types';
import { DEFAULT_SETTINGS_SPEC, PointerEvent, Spec, TooltipValue } from '../specs';
import { keepDistinct } from '../utils/common';
import { Dimensions } from '../utils/dimensions';
import { Logger } from '../utils/logger';
import { Point } from '../utils/point';

/** @internal */
export type BackwardRef = () => React.RefObject<HTMLDivElement>;

/** @internal */
export interface TooltipVisibility {
  visible: boolean;
  isExternal: boolean;
  isPinnable: boolean;
  displayOnly: boolean;
}

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

/** @internal */
export interface SpecList {
  [specId: string]: Spec;
}

/** @internal */
export interface PointerState {
  position: Point;
  time: number;
}

/** @internal */
export interface DragState {
  start: PointerState;
  end: PointerState;
}

/** @internal */
export interface PointerStates {
  dragging: boolean;
  current: PointerState;
  down: PointerState | null;
  pinned: PointerState | null;
  up: PointerState | null;
  lastDrag: DragState | null;
  lastClick: PointerState | null;
}

/** @internal */
export interface InteractionsState {
  pointer: PointerStates;
  highlightedLegendPath: LegendPath;
  deselectedDataSeries: SeriesIdentifier[];
  hoveredDOMElement: DOMElement | null;
  drilldown: CategoryKey[];
  prevDrilldown: CategoryKey[];
  tooltip: TooltipInteractionState;
}

/** @internal */
export interface TooltipInteractionState {
  pinned: boolean;
  selected: TooltipValue[];
}

/** @internal */
export interface ExternalEventsState {
  pointer: PointerEvent | null;
}

/** @internal */
export interface ColorOverrides {
  temporary: Record<SeriesKey, Color | null>; // null (vs. undefined) means that `overrides.persisted[key]` in `series.ts` not be used
  persisted: Record<SeriesKey, Color>;
}

/** @internal */
export type ChartId = string;

/** @internal */
export interface GlobalChartState {
  /**
   * a unique ID for each chart used by re-reselect to memoize selector per chart
   */
  chartId: ChartId;
  /**
   * Chart title
   */
  title?: string;
  /**
   * Chart description
   */
  description?: string;
  /**
   * The Z-Index of the chart component
   */
  zIndex: number;
  /**
   * true when all all the specs are parsed ad stored into the specs object
   */
  specsInitialized: boolean;
  specParsing: boolean;
  /**
   * true if the chart is rendered on dom
   */
  chartRendered: boolean;
  /**
   * incremental count of the chart rendering
   */
  chartRenderedCount: number;
  /**
   * the map of parsed specs
   */
  specs: SpecList;
  /**
   * the chart type depending on the used specs
   */
  chartType: ChartType | null;
  /**
   * a chart-type-dependant class that is used to render and share chart-type dependant functions
   */
  internalChartState: InternalChartState | null;
  /**
   * the dimensions of the parent container, including the legend
   */
  parentDimensions: Dimensions;
  /**
   * the state of the interactions
   */
  interactions: InteractionsState;
  /**
   * external event state
   */
  externalEvents: ExternalEventsState;
  /**
   * Color map used to persist color picker changes
   */
  colors: ColorOverrides;
}

/** @internal */
export const getInitialState = (chartId: string): GlobalChartState => ({
  chartId,
  zIndex: 0,
  specsInitialized: false,
  specParsing: false,
  chartRendered: false,
  chartRenderedCount: 0,
  specs: {
    [DEFAULT_SETTINGS_SPEC.id]: DEFAULT_SETTINGS_SPEC,
  },
  colors: {
    temporary: {},
    persisted: {},
  },
  chartType: null,
  internalChartState: null,
  interactions: {
    pointer: getInitialPointerState(),
    highlightedLegendPath: [],
    deselectedDataSeries: [],
    hoveredDOMElement: null,
    drilldown: [],
    prevDrilldown: [],
    tooltip: getInitialTooltipState(),
  },
  externalEvents: {
    pointer: null,
  },
  parentDimensions: {
    height: 0,
    width: 0,
    left: 0,
    top: 0,
  },
});

/** @internal */
export const chartStoreReducer = (chartId: string) => {
  // redux types controls state as first parameter
  // eslint-disable-next-line @typescript-eslint/default-param-last
  return (state = getInitialState(chartId), action: StateActions): GlobalChartState => {
    switch (action.type) {
      case Z_INDEX_EVENT:
        return {
          ...state,
          zIndex: action.zIndex,
        };
      case SPEC_PARSED:
        const chartType = chartTypeFromSpecs(state.specs);
        return {
          ...state,
          specsInitialized: true,
          specParsing: false,
          chartType,
          internalChartState: state.chartType === chartType ? state.internalChartState : newInternalState(chartType),
        };
      case SPEC_UNMOUNTED:
        return {
          ...state,
          specsInitialized: false,
          chartRendered: false,
        };
      case UPSERT_SPEC:
        return {
          ...state,
          specsInitialized: false,
          chartRendered: false,
          specParsing: true,
          specs: state.specParsing
            ? { ...state.specs, [action.spec.id]: action.spec }
            : { [DEFAULT_SETTINGS_SPEC.id]: DEFAULT_SETTINGS_SPEC, [action.spec.id]: action.spec },
        };
      case REMOVE_SPEC:
        const { [action.id]: specToRemove, ...rest } = state.specs;
        return {
          ...state,
          specsInitialized: false,
          chartRendered: false,
          specParsing: false,
          specs: {
            ...rest,
          },
        };
      case CHART_RENDERED:
        const count = state.chartRendered ? state.chartRenderedCount : state.chartRenderedCount + 1;
        return {
          ...state,
          chartRendered: true,
          chartRenderedCount: count,
        };
      case UPDATE_PARENT_DIMENSION:
        return {
          ...state,
          interactions: {
            ...state.interactions,
            prevDrilldown: state.interactions.drilldown,
            tooltip: getInitialTooltipState(),
            pointer: {
              ...state.interactions.pointer,
              pinned: null,
            },
          },
          parentDimensions: {
            ...action.dimensions,
          },
        };
      case UPDATE_CHART_TITLES:
        return {
          ...state,
          title: action.title,
          description: action.description,
        };
      case EXTERNAL_POINTER_EVENT:
        // discard events from self if any
        return {
          ...state,
          externalEvents: {
            ...state.externalEvents,
            pointer: action.event.chartId === chartId ? null : action.event,
          },
          // clear pinned states when syncing external cursors
          ...(action.event.chartId !== chartId && {
            interactions: {
              ...state.interactions,
              pointer: getInitialPointerState(),
              tooltip: getInitialTooltipState(),
            },
          }),
        };
      case CLEAR_TEMPORARY_COLORS:
        return {
          ...state,
          colors: {
            ...state.colors,
            temporary: {},
          },
        };
      case SET_TEMPORARY_COLOR:
        return {
          ...state,
          colors: {
            ...state.colors,
            temporary: {
              ...state.colors.temporary,
              ...action.keys.reduce<Record<string, Color | null>>((acc, curr) => {
                acc[curr] = action.color;
                return acc;
              }, {}),
            },
          },
        };
      case SET_PERSISTED_COLOR:
        const persisted = action.keys.reduce<Record<string, Color>>((acc, curr) => {
          if (action.color) {
            acc[curr] = action.color;
          } else {
            delete acc[curr];
          }
          return acc;
        }, state.colors.persisted);

        return {
          ...state,
          colors: {
            ...state.colors,
            persisted,
          },
        };
      default:
        return getInternalIsInitializedSelector(state) === InitStatus.Initialized
          ? {
              ...state,
              interactions: interactionsReducer(state, action, getLegendItemsSelector(state)),
            }
          : state;
    }
  };
};

function chartTypeFromSpecs(specs: SpecList): ChartType | null {
  const nonGlobalTypes = Object.values(specs)
    .map((s) => s.chartType)
    .filter((type) => type !== ChartType.Global)
    .filter(keepDistinct);
  if (!nonGlobalTypes[0]) {
    Logger.warn(`${nonGlobalTypes.length === 0 ? 'Zero' : 'Multiple'} chart types in the same configuration`);
    return null;
  }
  return nonGlobalTypes[0];
}

const constructors: Record<ChartType, () => InternalChartState | null> = {
  [ChartType.Goal]: () => new GoalState(),
  [ChartType.Partition]: () => new PartitionState(),
  [ChartType.Flame]: () => new FlameState(),
  [ChartType.Timeslip]: () => new TimeslipState(),
  [ChartType.XYAxis]: () => new XYAxisChartState(),
  [ChartType.Heatmap]: () => new HeatmapState(),
  [ChartType.Wordcloud]: () => new WordcloudState(),
  [ChartType.Metric]: () => new MetricState(),
  [ChartType.Global]: () => null,
}; // with no default, TS signals if a new chart type isn't added here too

function newInternalState(chartType: ChartType | null): InternalChartState | null {
  return chartType ? constructors[chartType]() : null;
}
