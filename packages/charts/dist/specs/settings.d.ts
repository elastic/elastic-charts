import { ComponentProps, ComponentType, ReactChild } from 'react';
import { CustomXDomain, GroupByAccessor, Spec } from '.';
import { Cell } from '../chart_types/heatmap/layout/types/viewmodel_types';
import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { LegendStrategy } from '../chart_types/partition_chart/layout/utils/highlighted_geoms';
import { LineAnnotationDatum, RectAnnotationDatum } from '../chart_types/specs';
import { WordModel } from '../chart_types/wordcloud/layout/types/viewmodel_types';
import { XYChartSeriesIdentifier } from '../chart_types/xy_chart/utils/series';
import { Color } from '../common/colors';
import { SeriesIdentifier } from '../common/series_id';
import { TooltipPortalSettings } from '../components';
import { ScaleContinuousType, ScaleOrdinalType } from '../scales';
import { LegendPath } from '../state/actions/legend';
import { SFProps } from '../state/spec_factory';
import { HorizontalAlignment, LayoutDirection, Position, Rendering, Rotation, VerticalAlignment } from '../utils/common';
import { Dimensions } from '../utils/dimensions';
import { GeometryValue } from '../utils/geometry';
import { GroupId, SpecId } from '../utils/ids';
import { SeriesCompareFn } from '../utils/series_sort';
import { PartialTheme, Theme } from '../utils/themes/theme';
import { BinAgg, BrushAxis, Direction, PointerEventType, PointerUpdateTrigger, settingsBuildProps } from './constants';
import { TooltipSettings } from './tooltip';
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
export declare type XYChartElementEvent = [GeometryValue, XYChartSeriesIdentifier];
/** @public */
export declare type PartitionElementEvent = [Array<LayerValue>, SeriesIdentifier];
/** @public */
export declare type FlameElementEvent = FlameLayerValue;
/** @public */
export declare type HeatmapElementEvent = [Cell, SeriesIdentifier];
/** @public */
export declare type WordCloudElementEvent = [WordModel, SeriesIdentifier];
/**
 * Describes a Metric element that is the subject of an interaction.
 * In particular, it reports the index of the metric within the two-dimensional data array
 * @public
 */
export declare type MetricElementEvent = {
    type: 'metricElementEvent';
    rowIndex: number;
    columnIndex: number;
};
/**
 * A type-guard for MetricElementEvents
 * @public
 */
export declare function isMetricElementEvent(e: Parameters<ElementClickListener>[0][0]): e is MetricElementEvent;
/**
 * An object that contains the scaled mouse position based on
 * the current chart configuration.
 * @public
 */
export declare type ProjectedValues = {
    /**
     * The independent variable of the chart
     */
    x: PrimitiveValue;
    /**
     * The set of dependent variable, each one with its own groupId
     */
    y: Array<{
        value: PrimitiveValue;
        groupId: string;
    }>;
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
export declare type ProjectionClickListener = (values: ProjectedValues) => void;
/** @public */
export declare type ElementClickListener = (elements: Array<XYChartElementEvent | PartitionElementEvent | FlameElementEvent | HeatmapElementEvent | WordCloudElementEvent | MetricElementEvent>) => void;
/** @public */
export declare type ElementOverListener = (elements: Array<XYChartElementEvent | PartitionElementEvent | FlameElementEvent | HeatmapElementEvent | WordCloudElementEvent | MetricElementEvent>) => void;
/** @public */
export declare type BrushEvent = XYBrushEvent | HeatmapBrushEvent;
/** @public */
export declare type BrushEndListener = (brushAreaEvent: BrushEvent) => void;
/** @public */
export declare type ProjectionAreaChangeListener = (areas: {
    projection: Dimensions;
    parent: Dimensions;
}) => void;
/** @public */
export declare type HeatmapBrushEvent = {
    cells: Cell[];
    x: (string | number)[];
    y: (string | number)[];
};
/** @public */
export declare type LegendItemListener = (series: SeriesIdentifier[]) => void;
/**
 * The listener type for generic mouse move
 *
 * @public
 */
export declare type PointerUpdateListener = (event: PointerEvent) => void;
/**
 * Listener to be called when chart render state changes
 *
 * `isRendered` value is `true` when rendering is complete and `false` otherwise
 * @public
 */
export declare type RenderChangeListener = (isRendered: boolean) => void;
/** @public */
export declare type BasicListener = () => undefined | void;
/** @public */
export declare type RectAnnotationEvent = {
    id: SpecId;
    datum: RectAnnotationDatum;
};
/** @public */
export declare type LineAnnotationEvent = {
    id: SpecId;
    datum: LineAnnotationDatum<any>;
};
/** @public */
export declare type AnnotationClickListener = (annotations: {
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
export declare type PointerEvent = PointerOverEvent | PointerOutEvent;
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
export declare type LegendAction = ComponentType<LegendActionProps>;
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
export declare type LegendColorPicker = ComponentType<LegendColorPickerProps>;
/**
 * Buffer between cursor and point to trigger interaction
 * @public
 */
export declare type MarkBuffer = number | ((radius: number) => number);
/**
 * The legend position configuration.
 * @public
 */
export declare type LegendPositionConfig = {
    /**
     * The vertical alignment of the legend
     */
    vAlign: typeof VerticalAlignment.Top | typeof VerticalAlignment.Bottom;
    /**
     * The horizontal alignment of the legend
     */
    hAlign: typeof HorizontalAlignment.Left | typeof HorizontalAlignment.Right;
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
     * @deprecated please use the new Tooltip spec inside your Chart
     */
    tooltip?: TooltipSettings;
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
export declare const Settings: (props: SFProps<SettingsSpec, keyof (typeof settingsBuildProps)['overrides'], keyof (typeof settingsBuildProps)['defaults'], keyof (typeof settingsBuildProps)['optionals'], keyof (typeof settingsBuildProps)['requires']>) => null;
/** @public */
export declare type SettingsProps = ComponentProps<typeof Settings>;
//# sourceMappingURL=settings.d.ts.map