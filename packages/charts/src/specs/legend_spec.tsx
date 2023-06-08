/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentType } from 'react';
import { $Values } from 'utility-types';

import { BasicListener } from './settings';
import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { LegendStrategy } from '../chart_types/partition_chart/layout/utils/highlighted_geoms';
import { SeriesType } from '../chart_types/specs';
import { CategoryLabel } from '../common/category';
import { Color } from '../common/colors';
import { SeriesIdentifier } from '../common/series_id';
import { LegendPath } from '../state/actions/legend';
import { PointerValue } from '../state/types';
import { HorizontalAlignment, LayoutDirection, Position, VerticalAlignment } from '../utils/common';
import { SeriesCompareFn } from '../utils/series_sort';
import { PointStyle } from '../utils/themes/theme';

/** @public */
export type LegendItemListener = (series: SeriesIdentifier[]) => void;

/**
 * Legend action component props
 *
 * @public
 */
export interface LegendActionProps {
  /**
   * Series identifiers for the given series
   */
  series: SeriesIdentifier[];
  /**
   * Resolved label/name of given series
   */
  label: string;
  /**
   * Resolved color of given series
   */
  color: string;
}

/**
 * Legend action component used to render actions next to legend items
 *
 * render slot is constrained to 20px x 16px
 *
 * @public
 */
export type LegendAction = ComponentType<LegendActionProps>;

/** @public */
export interface LegendColorPickerProps {
  /**
   * Anchor used to position picker
   */
  anchor: HTMLElement;
  /**
   * Current color of the given series
   */
  color: Color;
  /**
   * Callback to close color picker and set persistent color
   */
  onClose: () => void;
  /**
   * Callback to update temporary color state
   */
  onChange: (color: Color | null) => void;
  /**
   * Series ids for the active series
   */
  seriesIdentifiers: SeriesIdentifier[];
}

/** @public */
export type LegendColorPicker = ComponentType<LegendColorPickerProps>;

/**
 * The legend position configuration.
 * @public
 */
export type LegendPositionConfig = {
  /**
   * The vertical alignment of the legend
   */
  vAlign: typeof VerticalAlignment.Top | typeof VerticalAlignment.Bottom; // TODO typeof VerticalAlignment.Middle
  /**
   * The horizontal alignment of the legend
   */
  hAlign: typeof HorizontalAlignment.Left | typeof HorizontalAlignment.Right; // TODO typeof HorizontalAlignment.Center
  /**
   * The direction of the legend items.
   * `horizontal` shows all the items listed one a side the other horizontally, wrapping to new lines.
   * `vertical` shows the items in a vertical list
   */
  direction: LayoutDirection;
  /**
   * Remove the legend from the outside chart area, making it floating above the chart.
   * @defaultValue false
   */
  floating: boolean;
  /**
   * The number of columns in floating configuration
   * @defaultValue 1
   */
  floatingColumns?: number;
  // TODO add grow factor: fill, shrink, fixed column size
};

/**
 * The props for {@link CustomLegend}
 * @public
 */
export interface CustomLegendProps {
  pointerValue?: PointerValue;
  items: {
    seriesIdentifiers: SeriesIdentifier[];
    path: LegendPath;
    color: Color;
    label: CategoryLabel;
    seriesType?: SeriesType;
    pointStyle?: PointStyle;
    value?: PrimitiveValue;
    isSeriesHidden?: boolean;
    onItemOverActon: () => void;
    onItemOutAction: () => void;
    onItemClickAction: (negate: boolean) => void;
  }[];
}

/**
 * The react component used to render a custom legend
 * @public
 */
export type CustomLegend = ComponentType<CustomLegendProps>;

/** @public */
export const LegendValue = Object.freeze({
  None: 'none' as const,
  LastTimeBucket: 'lastTimeBucket' as const,
  LastNonNull: 'lastNonNull' as const,
  Average: 'avg' as const,
  Min: 'min' as const,
  Max: 'max' as const,
  Sum: 'sum' as const,
});
/** @public */
export type LegendValue = $Values<typeof LegendValue>;

/**
 * The legend configuration
 * @public
 */

export interface LegendSpec {
  /**
   * Show the legend
   * @defaultValue false
   */
  showLegend: boolean;
  /**
   * Set legend position
   * @defaultValue Position.Right
   */
  legendPosition: Position | LegendPositionConfig;
  /**
   * Show an calculated value for each legend item
   * @defaultValue `LegendValue.None`
   */
  legendValue: LegendValue;
  /**
   * Limit the legend to the specified maximal depth when showing a hierarchical legend
   *
   * @remarks
   * This is not the max depth, but the number of level shown: 0 none, 1 first, 2 up to the second etc.
   * See https://github.com/elastic/elastic-charts/issues/1981 for details
   */
  legendMaxDepth: number;
  /**
   * Sets the exact legend width (vertical) or height (horizontal)
   *
   * Limited to max of 70% of the chart container dimension
   * Vertical legends limited to min of 30% of computed width
   */
  legendSize: number;
  /**
   * Display the legend as a flat list.
   * @defaultValue `false`
   */
  flatLegend?: boolean;
  /**
   * Choose a partition highlighting strategy for hovering over legend items.
   * @defaultValue `LegendStrategy.Path`
   */
  legendStrategy?: LegendStrategy;
  onLegendItemOver?: LegendItemListener;
  onLegendItemOut?: BasicListener;
  onLegendItemClick?: LegendItemListener;
  onLegendItemPlusClick?: LegendItemListener;
  onLegendItemMinusClick?: LegendItemListener;
  /**
   * Render slot to render action for legend
   */
  legendAction?: LegendAction;
  legendColorPicker?: LegendColorPicker;
  /**
   * A SeriesSortFn to sort the legend values (top-bottom)
   */
  legendSort?: SeriesCompareFn;
  /**
   * Override the legend with a custom component.
   */
  customLegend?: CustomLegend;
}
