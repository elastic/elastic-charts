/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ComponentProps, ComponentType, ReactNode } from 'react';

import type { CustomXDomain, GroupByAccessor } from '.';
import type { BrushAxis } from './brush_axis';
import type { BinAgg, Direction } from './constants';
import { settingsBuildProps } from './default_settings_spec';
import type { PointerUpdateTrigger } from './pointer_update_trigger';
import type { ProjectedValues, PointerOutEvent, PointerOverEvent, PointerEvent } from './settings_types';
import { PointerEventType } from './settings_types';
import type { Spec } from './spec_type';
import type { Cell } from '../chart_types/heatmap/layout/types/viewmodel_types';
import type { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import type { LegendStrategy } from '../chart_types/partition_chart/layout/utils/highlighted_geoms';
import type { LineAnnotationDatum, RectAnnotationDatum, SeriesType } from '../chart_types/specs';
import type { WordModel } from '../chart_types/wordcloud/layout/types/viewmodel_types';
import type { XYChartSeriesIdentifier } from '../chart_types/xy_chart/utils/series';
import type { CategoryLabel } from '../common/category';
import type { Color } from '../common/colors';
import type { LegendItemValue, LegendValue } from '../common/legend';
import type { SmallMultiplesDatum } from '../common/panel_utils';
import type { SeriesIdentifier } from '../common/series_id';
import type { TooltipPortalSettings } from '../components';
import type { LegendPath } from '../state/actions/legend';
import type { SFProps } from '../state/spec_factory';
import { useSpecFactory } from '../state/spec_factory';
import type { PointerValue } from '../state/types';
import type {
  HorizontalAlignment,
  LayoutDirection,
  Position,
  Rendering,
  Rotation,
  VerticalAlignment,
} from '../utils/common';
import { stripUndefined } from '../utils/common';
import type { Dimensions } from '../utils/dimensions';
import type { GeometryValue } from '../utils/geometry';
import type { GroupId, SpecId } from '../utils/ids';
import type { KeyPressed } from '../utils/keys';
import type { SeriesCompareFn } from '../utils/series_sort';
import type { PartialTheme, PointStyle, Theme } from '../utils/themes/theme';

/** @public */
export interface LayerValue {
  /**
   * The category value as retrieved by the `groupByRollup` callback
   */
  groupByRollup: PrimitiveValue;
  /**
   * The small multiples `<GroupBy>` `by` accessor value, to specify which small multiples panel is interacted with
   */
  smAccessorValue: ReturnType<GroupByAccessor>;
  /**
   * Numerical value of the partition
   */
  value: number;
  /**
   * The position index of the sub-partition within its containing partition
   */
  sortIndex: number;
  /**
   * The depth of the partition in terms of the layered partition tree, where
   * 0 is root (single, not visualized root of the partitioning tree),
   * 1 is pie chart slices and innermost layer of sunburst, or 1st level treemap/flame/icicle breakdown
   * 2 and above are increasingly outer layers
   * maximum value is on the deepest leaf node
   */
  depth: number;
  /**
   * It contains the full path of the partition node, which is an array of `{index, value}` tuples
   * where `index` corresponds to `sortIndex` and `value` corresponds `groupByRollup`
   */
  path: LegendPath;
}

/** @public */
export interface FlameLayerValue {
  /**
   * The zero-based index of the data point
   */
  vmIndex: number;
}

/**
 * Represents the extent of a brush interaction for a specific group in an XY chart.
 *
 * @public
 */
export interface GroupBrushExtent {
  groupId: GroupId;
  extent: [number, number];
}

/**
 * Represents the details of a brush interaction in an XY chart.
 *
 * @public
 */
export interface XYBrushEvent {
  x?: [number, number];
  y?: Array<GroupBrushExtent>;
}

/**
 * Represents an interaction event with an element in an XY chart.
 *
 * @public
 */
export type XYChartElementEvent = [geometry: GeometryValue, seriesIdentifier: XYChartSeriesIdentifier];

/**
 * Represents an interaction event with an element in a partition chart.
 *
 * @public
 */
export type PartitionElementEvent = [layers: Array<LayerValue>, seriesIdentifier: SeriesIdentifier];

/**
 * Represents an interaction event with an element in a flame chart.
 *
 * @public
 */
export type FlameElementEvent = FlameLayerValue;

/**
 * Represents an interaction event with a cell in a heatmap chart.
 *
 * @public
 */
export type HeatmapElementEvent = [cell: Cell, seriesIdentifier: SeriesIdentifier];

/**
 * Represents an interaction event with an element in a word cloud chart.
 *
 * @public
 */
export type WordCloudElementEvent = [model: WordModel, seriesIdentifier: SeriesIdentifier];

/**
 * Describes a Metric element that is the subject of an interaction.
 * In particular, it reports the index of the metric within the two-dimensional data array
 * @public
 */
export type MetricElementEvent = {
  type: 'metricElementEvent';
  /* the row index of the metric in the data array: data[rowIndex][columIndex] */
  rowIndex: number;
  /* the column index of the metric in the data array: data[rowIndex][columIndex] */
  columnIndex: number;
};

/**
 * A type-guard for MetricElementEvents
 * @public
 */
export function isMetricElementEvent(e: Parameters<ElementClickListener>[0][0]): e is MetricElementEvent {
  return 'type' in e && e.type === 'metricElementEvent';
}

/**
 * @public
 * The listener type for click on the projection area.
 */
export type ProjectionClickListener = (values: ProjectedValues) => void;

/**
 * The listener type for the `onElementClick` event.
 *
 * This listener is triggered when an element in the chart is clicked, providing details about the clicked elements
 * and any modifier keys that were pressed during the interaction.
 *
 * @param elements - An array of clicked elements.
 * @param options - Additional options, including the state of modifier keys (`keyPressed`).
 *
 * @public
 */
export type ElementClickListener = (
  elements: Array<
    | XYChartElementEvent
    | PartitionElementEvent
    | FlameElementEvent
    | HeatmapElementEvent
    | WordCloudElementEvent
    | MetricElementEvent
  >,
  options?: { keyPressed: KeyPressed },
) => void;

/** @public */
export type ElementOverListener = (
  elements: Array<
    | XYChartElementEvent
    | PartitionElementEvent
    | FlameElementEvent
    | HeatmapElementEvent
    | WordCloudElementEvent
    | MetricElementEvent
  >,
) => void;

/**
 * Represents the details of a brush interaction event.
 *
 * A `BrushEvent` can be one of the following:
 * - `XYBrushEvent`: Represents a brush interaction in an XY chart.
 * - `HeatmapBrushEvent`: Represents a brush interaction in a Heatmap chart.
 *
 * This type is used in listeners like `onBrushEnd` to provide information about the brushed area.
 *
 * @public
 */
export type BrushEvent = XYBrushEvent | HeatmapBrushEvent;

/**
 * The listener type for the `onBrushEnd` event.
 *
 * This listener is triggered when a brush interaction ends, providing details about the brushed area
 * and any modifier keys that were pressed during the interaction.
 *
 * @param brushAreaEvent - The details of the brushed area, which can be an `XYBrushEvent` or `HeatmapBrushEvent`.
 * @param options - Additional options, including the state of modifier keys (`keyPressed`).
 *
 * @public
 */
export type BrushEndListener = (brushAreaEvent: BrushEvent, options?: { keyPressed: KeyPressed }) => void;

/** @public */
export type ProjectionAreaChangeListener = (areas: { projection: Dimensions; parent: Dimensions }) => void;

/**
 * Represents the details of a brush interaction in a Heatmap chart.
 *
 * This interface provides information about the brushed cells and the corresponding X and Y values.
 *
 * @public
 */
export interface HeatmapBrushEvent extends SmallMultiplesDatum {
  cells: Cell[];
  x: (string | number)[];
  y: (string | number)[];
}

/** @public */
export type LegendItemListener = (series: SeriesIdentifier[]) => void;
/**
 * The listener type for generic mouse move
 *
 * @public
 */
export type PointerUpdateListener = (event: PointerEvent) => void;
/**
 * Listener to be called when chart resizes
 * @alpha
 */
export type ResizeListener = () => void;
/**
 * Listener to be called when chart render state changes
 *
 * `isRendered` value is `true` when rendering is complete and `false` otherwise
 * @public
 */
export type RenderChangeListener = (isRendered: boolean) => void;
/**
 * Listener to be called *before* chart renders
 * @public
 */
export type WillRenderListener = () => void;
/** @public */
export type BasicListener = () => undefined | void;
/** @public */
export type RectAnnotationEvent = { id: SpecId; datum: RectAnnotationDatum };
/** @public */
export type LineAnnotationEvent = { id: SpecId; datum: LineAnnotationDatum<any> };
/** @public */
export type AnnotationClickListener = (annotations: {
  rects: RectAnnotationEvent[];
  lines: LineAnnotationEvent[];
}) => void;

/**
 * The settings for handling external events.
 * TODO consider moving this to Tooltip spec
 * @alpha
 */
export interface ExternalPointerEventsSettings {
  /**
   * Tooltip settings used for external events
   */
  tooltip: TooltipPortalSettings<'chart'> & {
    /**
     * `true` to show the tooltip when the chart receive an
     * external pointer event, 'false' to hide the tooltip.
     * @defaultValue `false`
     */
    visible?: boolean;
  };
}

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
 * Buffer between cursor and point to trigger interaction
 * @public
 */
export type MarkBuffer = number | ((radius: number) => number);

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
    extraValue?: LegendItemValue;
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
   * Add one or more computed statistics to each legend item.
   * The available statistics depends by chart type.
   */
  legendValues: Array<LegendValue>;
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
  /**
   * a title for the table legend
   */
  legendTitle?: string;
}

/**
 * The Spec used for Chart settings
 * @public
 */
export interface SettingsSpec extends Spec, LegendSpec {
  /**
   * Partial theme to be merged with base
   *
   * or
   *
   * Array of partial themes to be merged with base
   * index `0` being the highest priority
   *
   * i.e. `[primary, secondary, tertiary]`
   */
  theme?: PartialTheme | PartialTheme[];
  /**
   * Full default theme to use as base
   *
   * @defaultValue `LIGHT_THEME`
   */
  baseTheme?: Theme;
  rendering: Rendering;
  rotation: Rotation;
  animateData: boolean;

  /**
   * {@inheritDoc ExternalPointerEventsSettings}
   * @alpha
   */
  externalPointerEvents: ExternalPointerEventsSettings;
  /**
   * Show debug shadow elements on chart
   */
  debug: boolean;
  /**
   * Show debug render state on `ChartStatus` component
   * @alpha
   */
  debugState?: boolean;
  /**
   * Attach a listener for click on the projection area.
   * The listener will be called with the current x value snapped to the closest
   * X axis point, and an array of Y values for every groupId used in the chart.
   */
  onProjectionClick?: ProjectionClickListener;
  onElementClick?: ElementClickListener;
  onElementOver?: ElementOverListener;
  onElementOut?: BasicListener;
  onBrushEnd?: BrushEndListener;
  onPointerUpdate?: PointerUpdateListener;
  /**
   * @alpha subject to be removed in the future
   */
  onResize?: ResizeListener;
  onRenderChange?: RenderChangeListener;
  onWillRender?: WillRenderListener;
  onProjectionAreaChange?: ProjectionAreaChangeListener;

  /**
   * The min distance from the rendered point circumference to highlight a cartesian data point in line/area/bubble charts.
   */
  pointBuffer: MarkBuffer;
  xDomain?: CustomXDomain;
  /**
   * allows user to set a click handler to the annotations
   */
  onAnnotationClick?: AnnotationClickListener;

  /**
   * debounce delay used for resizing chart
   * @deprecated currently unused
   */
  resizeDebounce?: number;

  /**
   * debounce delay used for onPointerUpdate listener
   */
  pointerUpdateDebounce?: number;

  /**
   * trigger for onPointerUpdate listener.
   *
   *  - `'x'` - only triggers lister when x value changes
   *  - `'y'` - only triggers lister when y values change
   *  - `'both'` - triggers lister when x or y values change
   *
   * @defaultValue 'x'
   */
  pointerUpdateTrigger: PointerUpdateTrigger;

  /**
   * Defines which axes are able to be brushed.
   * @defaultValue `x` {@link (BrushAxis:type) | BrushAxis.X}
   */
  brushAxis?: BrushAxis;
  /**
   * The minimum number of pixel to consider for a valid brush event (in both axis if brushAxis prop is BrushAxis.Both).
   * E.g. a min value of 2 means that the brush area needs to be at least 2 pixel wide and 2 pixel tall.
   * @defaultValue 2
   */
  minBrushDelta?: number;
  /**
   * Boolean to round brushed values to nearest step bounds.
   *
   * e.g.
   * A brush selection range of [1.23, 3.6] with a domain of [1, 2, 3, 4].
   *
   * - when true returns [1, 3]
   * - when false returns [1.23, 3.6]
   *
   * @defaultValue false
   */
  roundHistogramBrushValues?: boolean;
  /**
   * Boolean to allow brushing on last bucket even when outside domain or limit to end of domain.
   * Should apply only for histogram charts
   * e.g.
   * A brush selection range of [1.23, 3.6] with a domain of [1, 2, 3]
   *
   * - when true returns [1.23, 3.6]
   * - when false returns [1.23, 3]
   *
   * @defaultValue true
   */
  allowBrushingLastHistogramBin: boolean;
  /**
   * Orders ordinal x values
   */
  orderOrdinalBinsBy?: OrderBy;
  /**
   * A SeriesSortFn to sort the rendering order of series.
   * Left/right for cluster, bottom-up for stacked.
   * Currently available only on XY charts
   */
  renderingSort?: SeriesCompareFn;
  /**
   * Render component for no results UI
   */
  noResults?: ComponentType | ReactNode;
  /**
   * User can specify the heading level for the label
   * @defaultValue 'p'
   */
  ariaLabelHeadingLevel: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  /**
   * A text to label the chart
   */
  ariaLabel?: string;
  /**
   * An DOM element ID for the chart label. If provided, it will override the ariaLabel prop.
   */
  ariaLabelledBy?: string;
  /**
   * A description about the chart.
   */
  ariaDescription?: string;
  /**
   * * An DOM element ID for the chart description. If provided, it will override the ariaDescription prop.
   */
  ariaDescribedBy?: string;
  /**
   * Renders an autogenerated summary of the chart
   * @defaultValue true
   */
  ariaUseDefaultSummary: boolean;
  /**
   * User can provide a table description of the data
   */
  ariaTableCaption?: string;

  /**
   * Unicode Locale Identifier, default `en-US`
   */
  locale: string;

  /**
   * Refers to the first day of the week as an index.
   * Expressed according to [**ISO 8601**](https://en.wikipedia.org/wiki/ISO_week_date)
   * where `1` is Monday, `2` is Tuesday, ..., `6` is Saturday and `7` is Sunday
   *
   * @defaultValue 1 (i.e. Monday)
   */
  dow: number;
}

/**
 * Order by options
 * @public
 */
export interface OrderBy {
  binAgg?: BinAgg;
  direction?: Direction;
}

/**
 * Adds settings spec to chart specs
 * @public
 */
export const Settings = function (
  props: SFProps<
    SettingsSpec,
    keyof (typeof settingsBuildProps)['overrides'],
    keyof (typeof settingsBuildProps)['defaults'],
    keyof (typeof settingsBuildProps)['optionals'],
    keyof (typeof settingsBuildProps)['requires']
  >,
) {
  const { defaults, overrides } = settingsBuildProps;
  useSpecFactory<SettingsSpec>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};

/** @public */
export type SettingsProps = ComponentProps<typeof Settings>;

/** @internal */
export function isPointerOutEvent(event: PointerEvent | null | undefined): event is PointerOutEvent {
  return event?.type === PointerEventType.Out;
}

/** @internal */
export function isPointerOverEvent(event: PointerEvent | null | undefined): event is PointerOverEvent {
  return event?.type === PointerEventType.Over;
}

export type { KeyPressed, ModifierKeys } from '../utils/keys';
