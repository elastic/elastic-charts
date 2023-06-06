/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Values } from 'utility-types';

import { SettingsSpec } from './settings';
import { ChartType } from '../chart_types';
import { BOTTOM, CENTER, LEFT, MIDDLE, RIGHT, TOP } from '../common/constants';
import { buildSFProps } from '../state/spec_factory';
import { Position } from '../utils/common';
import { LIGHT_THEME } from '../utils/themes/light_theme';

/** @public */
export const SpecType = Object.freeze({
  Series: 'series' as const,
  Axis: 'axis' as const,
  Annotation: 'annotation' as const,
  Settings: 'settings' as const,
  Tooltip: 'tooltip' as const,
  IndexOrder: 'index_order' as const,
  SmallMultiples: 'small_multiples' as const,
});
/** @public */
export type SpecType = $Values<typeof SpecType>;

/**
 * Type of bin aggregations
 * @public
 */
export const BinAgg = Object.freeze({
  /**
   * Order by sum of values in bin
   */
  Sum: 'sum' as const,
  /**
   * Order of values are used as is
   */
  None: 'none' as const,
});
/** @public */
export type BinAgg = $Values<typeof BinAgg>;

/**
 * Direction of sorting
 * @public
 */
export const Direction = Object.freeze({
  /**
   * Least to greatest
   */
  Ascending: 'ascending' as const,
  /**
   * Greatest to least
   */
  Descending: 'descending' as const,
});
/** @public */
export type Direction = $Values<typeof Direction>;

/** @public */
export const PointerEventType = Object.freeze({
  Over: 'Over' as const,
  Out: 'Out' as const,
});
/** @public */
export type PointerEventType = $Values<typeof PointerEventType>;

/**
 * This enums provides the available tooltip types
 * @public
 */
export const TooltipType = Object.freeze({
  /** Vertical cursor parallel to x axis */
  VerticalCursor: 'vertical' as const,
  /** Vertical and horizontal cursors */
  Crosshairs: 'cross' as const,
  /** Follow the mouse coordinates */
  Follow: 'follow' as const,
  /** Hide every tooltip */
  None: 'none' as const,
});
/**
 * The TooltipType
 * @public
 */
export type TooltipType = $Values<typeof TooltipType>;

/** @public */
export const BrushAxis = Object.freeze({
  X: 'x' as const,
  Y: 'y' as const,
  Both: 'both' as const,
});
/** @public */
export type BrushAxis = $Values<typeof BrushAxis>;

/**
 * pointer update trigger
 * @public
 */
export const PointerUpdateTrigger = Object.freeze({
  X: 'x' as const,
  Y: 'y' as const,
  Both: 'both' as const,
});
/** @public */
export type PointerUpdateTrigger = $Values<typeof PointerUpdateTrigger>;

/**
 * The position to stick the tooltip to
 * @public
 */
export const TooltipStickTo = Object.freeze({
  Top: TOP,
  Bottom: BOTTOM,
  Middle: MIDDLE,
  Left: LEFT,
  Right: RIGHT,
  Center: CENTER,
  MousePosition: 'MousePosition' as const,
});
/** @public */
export type TooltipStickTo = $Values<typeof TooltipStickTo>;

/**
 * Default legend config
 * @internal
 */
export const DEFAULT_LEGEND_CONFIG = {
  showLegend: false,
  legendSize: NaN,
  legendValue: 'none' as const,
  legendMaxDepth: Infinity,
  legendPosition: Position.Right,
  flatLegend: false,
};

/** @public */
export const settingsBuildProps = buildSFProps<SettingsSpec>()(
  {
    id: '__global__settings___' as const,
    chartType: ChartType.Global,
    specType: SpecType.Settings,
  },
  {
    rendering: 'canvas' as const,
    rotation: 0 as const,
    animateData: true,
    resizeDebounce: 10,
    debug: false,
    pointerUpdateTrigger: PointerUpdateTrigger.X,
    externalPointerEvents: {
      tooltip: {
        visible: false,
      },
    },
    baseTheme: LIGHT_THEME,
    brushAxis: BrushAxis.X,
    minBrushDelta: 2,
    ariaUseDefaultSummary: true,
    ariaLabelHeadingLevel: 'p',
    allowBrushingLastHistogramBin: true,
    pointBuffer: 10,
    ...DEFAULT_LEGEND_CONFIG,
  },
);

/** @public */
export const DEFAULT_SETTINGS_SPEC: SettingsSpec = {
  ...settingsBuildProps.defaults,
  ...settingsBuildProps.overrides,
};
