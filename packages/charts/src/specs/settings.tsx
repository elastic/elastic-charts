/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps, ComponentType, ReactChild } from 'react';

import { CustomXDomain, GroupByAccessor, Spec, TooltipStickTo } from '.';
import { Cell } from '../chart_types/heatmap/layout/types/viewmodel_types';
import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { LegendStrategy } from '../chart_types/partition_chart/layout/utils/highlighted_geoms';
import { BaseDatum, LineAnnotationDatum, RectAnnotationDatum } from '../chart_types/specs';
import { WordModel } from '../chart_types/wordcloud/layout/types/viewmodel_types';
import { XYChartSeriesIdentifier } from '../chart_types/xy_chart/utils/series';
import { Color } from '../common/colors';
import { SeriesIdentifier } from '../common/series_id';
import { TooltipPortalSettings } from '../components';
import { CustomTooltip } from '../components/tooltip/types';
import { ScaleContinuousType, ScaleOrdinalType } from '../scales';
import { LegendPath } from '../state/actions/legend';
import { SFProps, useSpecFactory } from '../state/spec_factory';
import { Accessor } from '../utils/accessor';
import {
  Datum,
  HorizontalAlignment,
  LayoutDirection,
  Position,
  Rendering,
  Rotation,
  VerticalAlignment,
  stripUndefined,
} from '../utils/common';
import { Dimensions } from '../utils/dimensions';
import { GeometryValue } from '../utils/geometry';
import { GroupId, SpecId } from '../utils/ids';
import { SeriesCompareFn } from '../utils/series_sort';
import { PartialTheme, Theme } from '../utils/themes/theme';
import {
  BinAgg,
  BrushAxis,
  DEFAULT_TOOLTIP_CONFIG,
  Direction,
  PointerEventType,
  PointerUpdateTrigger,
  TooltipType,
  settingsBuildProps,
} from './constants';

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
export interface GroupBrushExtent {
  groupId: GroupId;
  extent: [number, number];
}

/** @public */
export interface XYBrushEvent {
  x?: [number, number];
  y?: Array<GroupBrushExtent>;
}

/** @public */
export type XYChartElementEvent = [GeometryValue, XYChartSeriesIdentifier];
/** @public */
export type PartitionElementEvent = [Array<LayerValue>, SeriesIdentifier];
/** @public */
export type HeatmapElementEvent = [Cell, SeriesIdentifier];
/** @public */
export type WordCloudElementEvent = [WordModel, SeriesIdentifier];

/**
 * An object that contains the scaled mouse position based on
 * the current chart configuration.
 * @public
 */
export type ProjectedValues = {
  /**
   * The independent variable of the chart
   */
  x: PrimitiveValue;
  /**
   * The set of dependent variable, each one with its own groupId
   */
  y: Array<{ value: PrimitiveValue; groupId: string }>;
  /**
   * The categorical value used for the vertical placement of the chart
   * in a small multiple layout
   */
  smVerticalValue: PrimitiveValue;
  /**
   * The categorical value used for the horizontal placement of the chart
   * in a small multiple layout
   */
  smHorizontalValue: PrimitiveValue;
};

/**
 * @public
 * The listener type for click on the projection area.
 */
export type ProjectionClickListener = (values: ProjectedValues) => void;

/** @public */
export type ElementClickListener = (
  elements: Array<XYChartElementEvent | PartitionElementEvent | HeatmapElementEvent | WordCloudElementEvent>,
) => void;
/** @public */
export type ElementOverListener = (
  elements: Array<XYChartElementEvent | PartitionElementEvent | HeatmapElementEvent | WordCloudElementEvent>,
) => void;

/** @public */
export type BrushEvent = XYBrushEvent | HeatmapBrushEvent;

/** @public */
export type BrushEndListener = (brushAreaEvent: BrushEvent) => void;

/** @public */
export type ProjectionAreaChangeListener = (areas: { projection: Dimensions; parent: Dimensions }) => void;

/** @public */
export type HeatmapBrushEvent = {
  cells: Cell[];
  x: (string | number)[];
  y: (string | number)[];
};

/** @public */
export type LegendItemListener = (series: SeriesIdentifier[]) => void;
/**
 * The listener type for generic mouse move
 *
 * @public
 */
export type PointerUpdateListener = (event: PointerEvent) => void;
/**
 * Listener to be called when chart render state changes
 *
 * `isRendered` value is `true` when rendering is complete and `false` otherwise
 * @public
 */
export type RenderChangeListener = (isRendered: boolean) => void;
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

/** @public */
export interface BasePointerEvent {
  chartId: string;
  type: PointerEventType;
}

/**
 * Event used to synchronize pointers/mouse positions between Charts.
 *
 * fired as callback argument for `PointerUpdateListener`
 * @public
 */
export interface PointerOverEvent extends BasePointerEvent, ProjectedValues {
  type: typeof PointerEventType.Over;
  scale: ScaleContinuousType | ScaleOrdinalType;
  /**
   * Unit for event (i.e. `time`, `feet`, `count`, etc.) Not currently used/implemented
   * @alpha
   */
  unit?: string;
}

/** @public */
export interface PointerOutEvent extends BasePointerEvent {
  type: typeof PointerEventType.Out;
}

/** @public */
export type PointerEvent = PointerOverEvent | PointerOutEvent;

/**
 * This interface describe the properties of single value shown in the tooltip
 * @public
 */
export interface TooltipValue<D extends BaseDatum = Datum> {
  /**
   * The label of the tooltip value
   */
  label: string;
  /**
   * The value
   */
  value: any;
  /**
   * The formatted value to display
   */
  formattedValue: string;
  /**
   * The mark value
   */
  markValue?: number | null;
  /**
   * The mark value to display
   */
  formattedMarkValue?: string | null;
  /**
   * The color of the graphic mark (by default the color of the series)
   */
  color: Color;
  /**
   * True if the mouse is over the graphic mark connected to the tooltip
   */
  isHighlighted: boolean;
  /**
   * True if the tooltip is visible, false otherwise
   */
  isVisible: boolean;
  /**
   * The identifier of the related series
   */
  seriesIdentifier: SeriesIdentifier;
  /**
   * The accessor linked to the current tooltip value
   */
  valueAccessor?: Accessor<D>;

  /**
   * The datum associated with the current tooltip value
   * Maybe not available
   */
  datum?: D;
}

/**
 * A value formatter of a {@link TooltipValue}
 * @public
 */
export type TooltipValueFormatter = (data: TooltipValue) => JSX.Element | string;

/**
 * The advanced configuration for the tooltip
 * @public
 */
export type TooltipProps = TooltipPortalSettings<'chart'> & {
  /**
   * The {@link (TooltipType:type) | TooltipType} of the tooltip
   */
  type?: TooltipType;
  /**
   * Whenever the tooltip needs to snap to the x/band position or not
   */
  snap?: boolean;
  /**
   * A {@link TooltipValueFormatter} to format the header value
   */
  headerFormatter?: TooltipValueFormatter;
  /**
   * Unit for event (i.e. `time`, `feet`, `count`, etc.).
   * Not currently used/implemented
   *
   * @alpha
   */
  unit?: string;
  /**
   * Render custom tooltip given header and values
   */
  customTooltip?: CustomTooltip;
  /**
   * Stick the tooltip to a specific position within the current cursor
   * @defaultValue mousePosition
   */
  stickTo?: TooltipStickTo;

  /**
   * Show null values on the tooltip
   * @defaultValue false
   */
  showNullValues?: boolean;
};

/**
 * Either a {@link (TooltipType:type)} or an {@link (TooltipProps:type)} configuration
 * @public
 */
export type TooltipSettings = TooltipType | TooltipProps;

/**
 * The settings for handling external events.
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
   * Show an extra parameter on each legend item defined by the chart type
   * @defaultValue `false`
   */
  showLegendExtra: boolean;
  /**
   * Limit the legend to the specified maximal depth when showing a hierarchical legend
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
   * Display the legend as a flat list. If true, legendStrategy is always `LegendStrategy.Key`.
   */
  flatLegend?: boolean;
  /**
   * Choose a partition highlighting strategy for hovering over legend items. It's obligate `LegendStrategy.Key` if `flatLegend` is true.
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
   * The tooltip configuration {@link TooltipSettings}
   */
  tooltip: TooltipSettings;
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
  pointBuffer?: MarkBuffer;
  onBrushEnd?: BrushEndListener;
  onPointerUpdate?: PointerUpdateListener;
  onRenderChange?: RenderChangeListener;
  onProjectionAreaChange?: ProjectionAreaChangeListener;
  xDomain?: CustomXDomain;
  /**
   * allows user to set a click handler to the annotations
   */
  onAnnotationClick?: AnnotationClickListener;

  /**
   * debounce delay used for resizing chart
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
   * Block the brush tool on a specific axis: x, y or both.
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
   * Render component for no results UI
   */
  noResults?: ComponentType | ReactChild;
  /**
   * User can specify the heading level for the label
   * @defaultValue 'h2'
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
}

/**
 * An object of compare functions to sort
 * series in different part of the chart like tooltip, legend and rendering order.
 * @public
 */
export interface SortSeriesByConfig {
  /**
   * A SeriesSortFn to sort the legend values (top-bottom)
   * It has precedence over the general one
   */
  legend?: SeriesCompareFn;
  /**
   * A SeriesSortFn to sort tooltip values (top-bottom)
   * It has precedence over the general one
   */
  tooltip?: SeriesCompareFn;
  /**
   * A SeriesSortFn to sort the rendering order of series.
   * Left/right for cluster, bottom-up for stacked.
   * It has precedence over the general one
   * Currently available only on XY charts
   */
  rendering?: SeriesCompareFn;
  /**
   * The default SeriesSortFn in case no other specific sorting fn are used.
   * The rendering sorting is applied only to XY charts at the moment
   */
  default?: SeriesCompareFn;
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
    keyof typeof settingsBuildProps['overrides'],
    keyof typeof settingsBuildProps['defaults'],
    keyof typeof settingsBuildProps['optionals'],
    keyof typeof settingsBuildProps['requires']
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

/** @internal */
export function isTooltipProps(config: TooltipType | TooltipProps): config is TooltipProps {
  return typeof config === 'object';
}

/** @internal */
export function isTooltipType(config: TooltipType | TooltipProps): config is TooltipType {
  return typeof config !== 'object'; // TooltipType is 'vertical'|'cross'|'follow'|'none' while TooltipProps is object
}

/** @internal */
export function isCrosshairTooltipType(type: TooltipType) {
  return type === TooltipType.VerticalCursor || type === TooltipType.Crosshairs;
}

/** @internal */
export function isFollowTooltipType(type: TooltipType) {
  return type === TooltipType.Follow;
}

/** @internal */
export function getTooltipType(settings: SettingsSpec, externalTooltip = false): TooltipType {
  const defaultType = TooltipType.VerticalCursor;
  if (externalTooltip) return getExternalTooltipType(settings);

  const { tooltip } = settings;
  if (tooltip === undefined || tooltip === null) return defaultType;
  if (isTooltipType(tooltip)) return tooltip;
  if (isTooltipProps(tooltip)) return tooltip.type || defaultType;
  return defaultType;
}

/**
 * Return snowNullValues or the default
 * @internal
 */
export function getShowNullValues(settings: SettingsSpec): TooltipProps['showNullValues'] {
  const { tooltip } = settings;
  if (tooltip === undefined || tooltip === null) return DEFAULT_TOOLTIP_CONFIG.showNullValues;
  if (isTooltipType(tooltip)) return DEFAULT_TOOLTIP_CONFIG.showNullValues;
  if (isTooltipProps(tooltip)) return tooltip.showNullValues ?? DEFAULT_TOOLTIP_CONFIG.showNullValues;
}

/**
 * Always return a Vertical Cursor for external pointer events or None if hidden
 * @internal
 * @param settings - the SettingsSpec
 */
export function getExternalTooltipType({
  externalPointerEvents: {
    tooltip: { visible },
  },
}: SettingsSpec): TooltipType {
  return visible ? TooltipType.VerticalCursor : TooltipType.None;
}
