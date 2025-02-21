/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ColorOverrides } from './color_overrides';
import { InteractionsState } from './interactions_state';
import { ChartType } from '../chart_types';
import { PointerEvent } from '../specs';
import { SpecList } from '../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { Dimensions } from '../utils/dimensions';

/** @internal */
export interface ExternalEventsState {
  pointer: PointerEvent | null;
}

/** @internal */
export type ChartId = string;

/** @internal */
export interface ChartSliceState {
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
