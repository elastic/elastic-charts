import { ReactNode } from 'react';
import { $Values } from 'utility-types';
import { ChartType } from '../../../chart_types';
import { Color } from '../../../common/colors';
import { TooltipPortalSettings } from '../../../components/portal/types';
import { LogScaleOptions, ScaleContinuousType } from '../../../scales';
import { ScaleType } from '../../../scales/constants';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { AccessorFormat, AccessorFn, Accessor } from '../../../utils/accessor';
import { RecursivePartial, Position, Datum } from '../../../utils/common';
import { CurveType } from '../../../utils/curves';
import { OrdinalDomain } from '../../../utils/domain';
import { AxisId, GroupId, SpecId } from '../../../utils/ids';
import { AreaSeriesStyle, BarSeriesStyle, GridLineStyle, LineAnnotationStyle, LineSeriesStyle, PointStyle, RectAnnotationStyle, BubbleSeriesStyle, AxisStyle } from '../../../utils/themes/theme';
import { PrimitiveValue } from '../../partition_chart/layout/utils/group_by_rollup';
import { AnnotationTooltipFormatter, ComponentWithAnnotationDatum, CustomAnnotationTooltip } from '../annotations/types';
import { AnimationOptions } from './../renderer/canvas/animations/animation';
import { XYChartSeriesIdentifier, DataSeriesDatum } from './series';
/** @public */
export declare type BarStyleOverride = RecursivePartial<BarSeriesStyle> | Color | null;
/** @public */
export declare type PointStyleOverride = RecursivePartial<PointStyle> | Color | null;
/** @public */
export declare const SeriesType: Readonly<{
    Area: "area";
    Bar: "bar";
    Line: "line";
    Bubble: "bubble";
}>;
/**
 * XY series type
 * @public
 */
export declare type SeriesType = $Values<typeof SeriesType>;
/**
 * The offset and mode applied when stacking values
 * @public
 */
export declare const StackMode: Readonly<{
    /** Applies a zero baseline and normalizes the values for each point such that the topline is always one. */
    Percentage: "percentage";
    /** Shifts the baseline so as to minimize the weighted wiggle of layers. */
    Wiggle: "wiggle";
    /** Shifts the baseline down such that the center of the streamgraph is always at zero. */
    Silhouette: "silhouette";
}>;
/**
 * The offset and mode applied when stacking values
 * @public
 */
export declare type StackMode = $Values<typeof StackMode>;
/**
 * Override for bar styles per datum
 *
 * Return types:
 * - `Color`: Color value as a `string` will set the bar `fill` to that color
 * - `RecursivePartial<BarSeriesStyle>`: Style values to be merged with base bar styles
 * - `null`: Keep existing bar style
 * @public
 */
export declare type BarStyleAccessor = (datum: DataSeriesDatum, seriesIdentifier: XYChartSeriesIdentifier) => BarStyleOverride;
/**
 * Override for bar styles per datum
 *
 * Return types:
 * - `Color`: Color value as a `string` will set the point `stroke` to that color
 * - `RecursivePartial<PointStyle>`: Style values to be merged with base point styles
 * - `null`: Keep existing point style
 * @public
 */
export declare type PointStyleAccessor = (datum: DataSeriesDatum, seriesIdentifier: XYChartSeriesIdentifier) => PointStyleOverride;
/**
 * The global id used by default to group together series
 * @public
 */
export declare const DEFAULT_GLOBAL_ID = "__global__";
/** @public */
export declare type FilterPredicate = (series: XYChartSeriesIdentifier) => boolean;
/** @public */
export declare type SeriesName = string | number | null;
/**
 * Function to create custom series name for a given series
 * @public
 */
export declare type SeriesNameFn = (series: XYChartSeriesIdentifier, isTooltip: boolean) => SeriesName;
/**
 * Accessor mapping to replace names
 * @public
 */
export interface SeriesNameConfig {
    /**
     * accessor key (i.e. `yAccessors` and `seriesSplitAccessors`)
     */
    accessor: string | number;
    /**
     * Accessor value (i.e. values from `seriesSplitAccessors`)
     */
    value?: string | number;
    /**
     * New name for Accessor value
     *
     * If not provided, the original value will be used
     */
    name?: string | number;
    /**
     * Sort order of name, overrides order listed in array.
     *
     * lower values - left-most
     * higher values - right-most
     */
    sortIndex?: number;
}
/** @public */
export interface SeriesNameConfigOptions {
    /**
     * Array of accessor naming configs to replace series names
     *
     * Only provided configs will be included
     * (i.e. if you only provide a single mapping for `yAccessor`, all other series accessor names will be ignored)
     *
     * The order of configs is the order in which the resulting names will
     * be joined, if no `sortIndex` is specified.
     *
     * If no values are found for a giving mapping in a series, the mapping will be ignored.
     */
    names?: SeriesNameConfig[];
    /**
     * Delimiter to join values/names
     *
     * @defaultValue an hyphen with spaces ` - `
     */
    delimiter?: string;
}
/** @public */
export declare type SeriesNameAccessor = string | SeriesNameFn | SeriesNameConfigOptions;
/**
 * The fit function type
 * @public
 */
export declare const Fit: Readonly<{
    /**
     * Don't draw value on the graph. Slices out area between `null` values.
     *
     * @example
     * ```js
     * [2, null, null, 8] => [2, null null, 8]
     * ```
     */
    None: "none";
    /**
     * Use the previous non-`null` value
     *
     * @remarks
     * This is the opposite of `Fit.Lookahead`
     *
     * @example
     * ```js
     * [2, null, null, 8] => [2, 2, 2, 8]
     * ```
     */
    Carry: "carry";
    /**
     * Use the next non-`null` value
     *
     * @remarks
     * This is the opposite of `Fit.Carry`
     *
     * @example
     * ```js
     * [2, null, null, 8] => [2, 8, 8, 8]
     * ```
     */
    Lookahead: "lookahead";
    /**
     * Use the closest non-`null` value (before or after)
     *
     * @example
     * ```js
     * [2, null, null, 8] => [2, 2, 8, 8]
     * ```
     */
    Nearest: "nearest";
    /**
     * Average between the closest non-`null` values
     *
     * @example
     * ```js
     * [2, null, null, 8] => [2, 5, 5, 8]
     * ```
     */
    Average: "average";
    /**
     * Linear interpolation between the closest non-`null` values
     *
     * @example
     * ```js
     * [2, null, null, 8] => [2, 4, 6, 8]
     * ```
     */
    Linear: "linear";
    /**
     * Sets all `null` values to `0`
     *
     * @example
     * ```js
     * [2, null, null, 8] => [2, 0, 0, 8]
     * ```
     */
    Zero: "zero";
    /**
     * Specify an explicit value `X`
     *
     * @example
     * ```js
     * [2, null, null, 8] => [2, X, X, 8]
     * ```
     */
    Explicit: "explicit";
}>;
/** @public */
export declare type Fit = $Values<typeof Fit>;
/** @public */
export interface DomainRange {
    /**
     * Custom minInterval for the domain which will affect data bin size.
     * `min: NaN` or `max: NaN` can be used for either or both extrema, when unbounded.
     * The minInterval cannot be greater than the computed minimum interval between any two adjacent data points.
     * Further, if you specify a custom numeric minInterval for a time-series, please note that due to the restriction
     * above, the specified numeric minInterval will be interpreted as a fixed interval.
     * This means that, for example, if you have yearly time-series data that ranges from 2016 to 2019 and you manually
     * compute the interval between 2016 and 2017, you'll have 366 days due to 2016 being a leap year.  This will not
     * be a valid interval because it is greater than the computed minInterval of 365 days between the other years.
     */
    min: number;
    max: number;
    minInterval?: number;
}
/**
 * Padding unit for domain
 * @public
 */
export declare const DomainPaddingUnit: Readonly<{
    /**
     * Raw value in the domain space.
     *
     * Example:
     *
     * If your domain is `[20, 40]` and your padding value is `10`.
     * The resulting domain would be `[10, 50]`
     */
    Domain: "domain";
    /**
     * Spatial pixel value (aka screenspace) not dependent on domain.
     *
     * @alpha
     */
    Pixel: "pixel";
    /**
     * Ratio of total domain relative to domain space
     *
     * Example:
     *
     * If your domain is `[20, 40]` and your padding value is `0.1`.
     * The resulting padding would be 2 (i.e. `0.1 * (40 - 20)`)
     * resulting in a domain of `[18, 42]`
     */
    DomainRatio: "domainRatio";
}>;
/**
 * Padding unit
 * @public
 */
export declare type DomainPaddingUnit = $Values<typeof DomainPaddingUnit>;
/**
 * Domain option that **only** apply to `yDomains`.
 * @public
 */
export interface YDomainBase {
    /**
     * Whether to fit the domain to the data.
     *
     * Setting `max` or `min` will override this functionality.
     * @defaultValue false
     */
    fit?: boolean;
    /**
     * Specify a series of specIds to include into the domain calculation.
     * Currently, it will work only for annotations, everything else is already included in the domain automatically.
     * Setting `domain.max` or `domain.min` will override this functionality.
     * @defaultValue []
     */
    includeDataFromIds?: SpecId[];
    /**
     * Padding for computed domain as positive number.
     * Applied to domain __before__ nicing
     *
     * Setting `max` or `min` will override this functionality.
     */
    padding?: number;
    /**
     * Unit of padding dimension
     *
     * @defaultValue 'domain'
     */
    paddingUnit?: DomainPaddingUnit;
    /**
     * Constrains padded domain to the zero baseline.
     *
     * e.g. If your domain is `[10, 100]` and `[-10, 120]` with padding.
     * The domain would be `[0, 120]` if **constrained** or `[-10, 120]` if **unconstrained**.
     *
     * @defaultValue true
     */
    constrainPadding?: boolean;
}
/** @public */
export declare type YDomainRange = YDomainBase & DomainRange & LogScaleOptions;
/** @public */
export declare type CustomXDomain = (DomainRange & Pick<LogScaleOptions, 'logBase'>) | OrdinalDomain;
/** @public */
export declare const LabelOverflowConstraint: Readonly<{
    BarGeometry: "barGeometry";
    ChartEdges: "chartEdges";
}>;
/** @public */
export declare type LabelOverflowConstraint = $Values<typeof LabelOverflowConstraint>;
/** @public */
export interface DisplayValueSpec {
    /**
     * Show value label in chart element
     * @defaultValue false
     */
    showValueLabel?: boolean;
    /**
     * If value labels are shown, skips every other label
     * @defaultValue false
     */
    isAlternatingValueLabel?: boolean;
    /**
     * Function for formatting values; will use axis tickFormatter if none specified
     * @defaultValue false
     */
    valueFormatter?: TickFormatter;
    /**
     * If true will contain value label within element, else dimensions are computed based on value
     * @deprecated This feature is deprecated and will be removed. Wrapping numbers into multiple lines
     * is not considered a good practice.
     * @defaultValue false
     */
    isValueContainedInElement?: boolean;
    /**
     * An option to hide the value label on certain conditions:
     * - `barGeometry` the label is not rendered if the width/height overflows the associated bar geometry,
     * - `chartEdges` the label is not rendered if it overflows the chart projection area.
     * @defaultValue ['barGeometry', 'chartEdges']
     */
    overflowConstraints?: Array<LabelOverflowConstraint>;
}
/** @public */
export interface SeriesSpec<D extends BaseDatum = Datum> extends Spec {
    specType: typeof SpecType.Series;
    chartType: typeof ChartType.XYAxis;
    /**
     * The name of the spec. Also a mechanism to provide custom series names.
     */
    name?: SeriesNameAccessor;
    /**
     * The ID of the spec group
     * @defaultValue {@link DEFAULT_GLOBAL_ID}
     */
    groupId: string;
    /**
     * When specify a groupId on this series, this option can be used to compute this series domain as it was part
     * of the default group (when using the boolean value true)
     * or as the series was part of the specified group (when issuing a string)
     */
    useDefaultGroupDomain?: boolean | string;
    /** An array of data */
    data: D[];
    /** The type of series you are looking to render */
    seriesType: SeriesType;
    /** Set colors for specific series */
    color?: SeriesColorAccessor;
    /**
     * If the series should appear in the legend
     * @defaultValue `false`
     */
    hideInLegend?: boolean;
    /**
     * Index per series to sort by
     * @deprecated This prop is not currently used and will
     * soon be removed.
     */
    sortIndex?: number;
    displayValueSettings?: DisplayValueSpec;
    /**
     * Postfix string or accessor function for y1 accessor when using `y0Accessors`
     *
     * @defaultValue ` - upper`
     */
    y0AccessorFormat?: AccessorFormat;
    /**
     * Postfix string or accessor function for y1 accessor when using `y0Accessors`
     *
     * @defaultValue ` - lower`
     */
    y1AccessorFormat?: AccessorFormat;
    /**
     * Hide series in tooltip
     */
    filterSeriesInTooltip?: FilterPredicate;
    /**
     * A function called to format every value label.
     * Uses axis `tickFormat` when not provided.
     */
    tickFormat?: TickFormatter;
}
/** @public */
export interface Postfixes {
    /**
     * Postfix for y1 accessor when using `y0Accessors`
     *
     * @defaultValue `upper`
     */
    y0AccessorFormat?: string;
    /**
     * Postfix for y1 accessor when using `y0Accessors`
     *
     * @defaultValue `lower`
     */
    y1AccessorFormat?: string;
}
/** @public */
export declare type SeriesColorsArray = string[];
/** @public */
export declare type SeriesColorAccessorFn = (seriesIdentifier: XYChartSeriesIdentifier) => string | null;
/** @public */
export declare type SeriesColorAccessor = string | SeriesColorsArray | SeriesColorAccessorFn;
/** @public */
export interface SeriesAccessors<D extends BaseDatum = any> {
    /** The field name of the x value on Datum object */
    xAccessor: Accessor<D> | AccessorFn<D>;
    /** An array of field names one per y metric value */
    yAccessors: (Accessor<D> | AccessorFn<D>)[];
    /** An optional accessor of the y0 value: base point for area/bar charts  */
    y0Accessors?: (Accessor<D> | AccessorFn<D>)[];
    /** An array of fields thats indicates the datum series membership */
    splitSeriesAccessors?: (Accessor<D> | AccessorFn<D>)[];
    /**
     * An array of fields thats indicates the stack membership.
     * Does not depend on datum at the moment.
     *
     * TODO pass datum to accessors when applicable
     */
    stackAccessors?: (Accessor<any> | AccessorFn<any>)[];
    /**
     * Field name of mark size metric on `Datum`
     *
     * Only used with line/area series
     */
    markSizeAccessor?: Accessor<D> | AccessorFn<D>;
}
/** @public */
export declare type XScaleType = typeof ScaleType.Ordinal | ScaleContinuousType;
/** @public */
export interface SeriesScales {
    /**
     * The x axis scale type
     * @defaultValue `ordinal` {@link (ScaleType:type) | ScaleType.Ordinal}
     */
    xScaleType: XScaleType;
    /**
     * Extends the x domain so that it starts and ends on nice round values.
     * @defaultValue `false`
     */
    xNice?: boolean;
    /**
     * If using a ScaleType.Time this timezone identifier is required to
     * compute a nice set of xScale ticks. Can be any IANA zone supported by
     * the host environment, or a fixed-offset name of the form 'utc+3',
     * or the strings 'local' or 'utc'.
     * @defaultValue `local`
     */
    timeZone?: string;
    /**
     * The y axis scale type
     * @defaultValue `linear` {@link (ScaleType:type) | ScaleType.Linear}
     */
    yScaleType: ScaleContinuousType;
    /**
     * Extends the y domain so that it starts and ends on nice round values.
     * @defaultValue `false`
     */
    yNice?: boolean;
}
declare type MarkFormatter<Type extends string = ''> = Type extends 'bar' ? {} : {
    /**
     * A function called to format every single mark value
     *
     * Only used with line/area series
     */
    markFormat?: TickFormatter<number>;
};
/** @public */
export declare type BasicSeriesSpec<D extends BaseDatum = Datum, Type extends string = ''> = SeriesSpec<D> & SeriesAccessors<D> & SeriesScales & MarkFormatter<Type>;
/** @public */
export declare type SeriesSpecs<D extends BaseDatum = Datum, S extends BasicSeriesSpec<D> = BasicSeriesSpec<D>> = Array<S>;
/**
 * Expected shape of unknown data row/datum
 * @public
 */
export declare type BaseDatum = Record<string, any> | any[];
/**
 * This spec describe the dataset configuration used to display a bar series.
 * @public
 */
export declare type BarSeriesSpec<D extends BaseDatum = Datum> = BasicSeriesSpec<D, 'bar'> & Postfixes & {
    /** @defaultValue `bar` {@link (SeriesType:type) | SeriesType.Bar} */
    seriesType: typeof SeriesType.Bar;
    /** If true, will stack all BarSeries and align bars to ticks (instead of centered on ticks) */
    enableHistogramMode?: boolean;
    barSeriesStyle?: RecursivePartial<BarSeriesStyle>;
    /**
     * Stack each series using a specific mode: Percentage, Wiggle, Silhouette.
     * The last two modes are generally used for stream graphs
     */
    stackMode?: StackMode;
    /**
     * Functional accessor to return custom color or style for bar datum
     */
    styleAccessor?: BarStyleAccessor;
    /**
     * Min height to render bars for highly variable data
     *
     * @remarks
     * i.e. ranges from 100,000 to 1.
     *
     * The unit is expressed in `pixel`
     */
    minBarHeight?: number;
};
/**
 * This spec describe the dataset configuration used to display a histogram bar series.
 * A histogram bar series is identical to a bar series except that stackAccessors are not allowed.
 * @public
 */
export declare type HistogramBarSeriesSpec<D extends BaseDatum = Datum> = Omit<BarSeriesSpec<D>, 'stackAccessors'> & {
    enableHistogramMode: true;
};
/** @public */
export declare type FitConfig = {
    /**
     * Fit type for data with null values
     */
    type: Fit;
    /**
     * Fit value used when `type` is set to `Fit.Explicit`
     */
    value?: number;
    /**
     * Value used for first and last point if fitting is not possible
     *
     * `'nearest'` will set indeterminate end values to the closes _visible_ point.
     *
     * Note: Computed fit values will always take precedence over `endValues`
     */
    endValue?: number | 'nearest';
};
/**
 * This spec describe the dataset configuration used to display a line series.
 * @public
 */
export declare type LineSeriesSpec<D extends BaseDatum = Datum> = BasicSeriesSpec<D, 'line'> & HistogramConfig & {
    /** @defaultValue `line` {@link (SeriesType:type) | SeriesType.Line} */
    seriesType: typeof SeriesType.Line;
    curve?: CurveType;
    lineSeriesStyle?: RecursivePartial<LineSeriesStyle>;
    /**
     * An optional functional accessor to return custom color or style for point datum
     */
    pointStyleAccessor?: PointStyleAccessor;
    /**
     * Fit config to fill `null` values in dataset
     */
    fit?: Exclude<Fit, 'explicit'> | FitConfig;
};
/**
 * This spec describe the dataset configuration used to display a line series.
 *
 * @alpha
 */
export declare type BubbleSeriesSpec<D extends BaseDatum = Datum> = BasicSeriesSpec<D, 'bubble'> & {
    /** @defaultValue `bubble` {@link (SeriesType:type) | SeriesType.Bubble} */
    seriesType: typeof SeriesType.Bubble;
    bubbleSeriesStyle?: RecursivePartial<BubbleSeriesStyle>;
    /**
     * An optional functional accessor to return custom color or style for point datum
     */
    pointStyleAccessor?: PointStyleAccessor;
};
/**
 * This spec describe the dataset configuration used to display an area series.
 * @public
 */
export declare type AreaSeriesSpec<D extends BaseDatum = Datum> = BasicSeriesSpec<D, 'area'> & HistogramConfig & Postfixes & {
    /** @defaultValue `area` {@link (SeriesType:type) | SeriesType.Area} */
    seriesType: typeof SeriesType.Area;
    /** The type of interpolator to be used to interpolate values between points */
    curve?: CurveType;
    areaSeriesStyle?: RecursivePartial<AreaSeriesStyle>;
    /**
     * Stack each series using a specific mode: Percentage, Wiggle, Silhouette.
     * The last two modes are generally used for stream graphs
     */
    stackMode?: StackMode;
    /**
     * An optional functional accessor to return custom color or style for point datum
     */
    pointStyleAccessor?: PointStyleAccessor;
    /**
     * Fit config to fill `null` values in dataset
     */
    fit?: Exclude<Fit, 'explicit'> | FitConfig;
};
/** @public */
export interface HistogramConfig {
    /**
     *  Determines how points in the series will align to bands in histogram mode
     * @defaultValue `start`
     */
    histogramModeAlignment?: HistogramModeAlignment;
}
/** @public */
export declare const HistogramModeAlignments: Readonly<{
    Start: HistogramModeAlignment;
    Center: HistogramModeAlignment;
    End: HistogramModeAlignment;
}>;
/** @public */
export declare type HistogramModeAlignment = 'start' | 'center' | 'end';
/**
 * This spec describe the configuration for a chart axis.
 * @public
 */
export interface AxisSpec extends Spec {
    specType: typeof SpecType.Axis;
    chartType: typeof ChartType.XYAxis;
    /** The ID of the spec */
    id: AxisId;
    /** Style options for grid line */
    gridLine?: Partial<GridLineStyle>;
    /**
     * The ID of the axis group
     * @defaultValue {@link DEFAULT_GLOBAL_ID}
     */
    groupId: GroupId;
    /** Hide this axis */
    hide: boolean;
    /** shows all ticks and gridlines, including those belonging to labels that got culled due to overlapping with other labels */
    showOverlappingTicks: boolean;
    /** Shows all labels, also the overlapping ones */
    showOverlappingLabels: boolean;
    /**
     * Shows grid lines for axis
     * @defaultValue `false`
     * @deprecated use `gridLine.visible`
     */
    showGridLines?: boolean;
    /** Where the axis appear on the chart */
    position: Position;
    /**
     * A function called to format every tick value label.
     * Uses first series spec `tickFormat` when not provided.
     *
     * used in tooltip when no `tickFormat` is provided from series spec
     */
    tickFormat?: TickFormatter;
    /**
     * A function called to format every label  (excludes tooltip)
     *
     * overrides tickFormat for axis labels
     */
    labelFormat?: TickFormatter;
    /** An approximate count of how many ticks will be generated */
    ticks?: number;
    /** The axis title */
    title?: string;
    /** Custom style overrides */
    style?: RecursivePartial<Omit<AxisStyle, 'gridLine'>>;
    /** If specified, it constrains the domain for these values */
    domain?: YDomainRange;
    /** Show only integar values * */
    integersOnly?: boolean;
    /**
     * Show duplicated ticks
     * @defaultValue `false`
     */
    showDuplicatedTicks?: boolean;
    /**
     * Render a multi-layer time axis. Use 2 or 3 as valid number of layers.
     * Use 0 to use the alternative, one row, time axis.
     * @alpha
     * @defaultValue 0
     */
    timeAxisLayerCount: number;
}
/** @public */
export declare type TickFormatterOptions = {
    timeZone?: string;
};
/** @public */
export declare type TickFormatter<V = any> = (value: V, options?: TickFormatterOptions) => string;
/** @public */
export declare const AnnotationType: Readonly<{
    Line: "line";
    Rectangle: "rectangle";
    Text: "text";
}>;
/** @public */
export declare type AnnotationType = $Values<typeof AnnotationType>;
/**
 * The domain type enum that can be associated with an annotation
 * @public
 */
export declare const AnnotationDomainType: Readonly<{
    XDomain: "xDomain";
    YDomain: "yDomain";
}>;
/**
 * The domain type that can be associated with an annotation
 * @public
 */
export declare type AnnotationDomainType = $Values<typeof AnnotationDomainType>;
/**
 * The descriptive object of a line annotation
 * @public
 */
export interface LineAnnotationDatum<D = any> {
    /**
     * The value on the x or y axis according to the domainType configured
     */
    dataValue: D;
    /**
     * A textual description of the annotation
     */
    details?: string;
    /**
     * An header of the annotation. If undefined, than the formatted dataValue will be used
     */
    header?: string;
}
/** @public */
export declare const AnnotationAnimationTrigger: Readonly<{
    FadeOnFocusingOthers: "FadeOnFocusingOthers";
}>;
/** @public */
export declare type AnnotationAnimationTrigger = $Values<typeof AnnotationAnimationTrigger>;
/** @public */
export interface AnimationConfig<T extends string> {
    trigger: T;
    options?: AnimationOptions;
}
/** @public */
export declare type AnnotationAnimationConfig = AnimationConfig<AnnotationAnimationTrigger>;
/** @public */
export declare type LineAnnotationSpec<D = any> = BaseAnnotationSpec<typeof AnnotationType.Line, LineAnnotationDatum<D>, LineAnnotationStyle, D> & {
    domainType: AnnotationDomainType;
    /** Optional Custom marker icon centered on data value */
    marker?: ReactNode | ComponentWithAnnotationDatum<D>;
    /** Optional marker body, always contained within chart area */
    markerBody?: ReactNode | ComponentWithAnnotationDatum<D>;
    /**
     * Custom marker dimensions; will be computed internally
     * Any user-supplied values will be overwritten
     */
    markerDimensions?: {
        width: number;
        height: number;
    };
    /**
     * An optional marker position.
     *
     * @remarks
     * The default position, if this property is not specified, falls back to the linked axis position (if available).
     * If no axis present on the chart, the marker position is positioned by default on the bottom on the X domain
     * and on the left of the chart for the Y domain. The specified position is an absolute position and reflect
     * the spatial position of the marker independently from the chart rotation.
     */
    markerPosition?: Position;
    /** Annotation lines are hidden */
    hideLines?: boolean;
    /**
     * Hide tooltip when hovering over the line
     * @defaultValue `true`
     */
    hideLinesTooltips?: boolean;
    /**
     * z-index of the annotation relative to other elements in the chart
     * @defaultValue 1
     */
    zIndex?: number;
};
/**
 * The descriptive object of a rectangular annotation
 * @public
 */
export interface RectAnnotationDatum {
    /**
     * The coordinates for the 4 rectangle points.
     */
    coordinates: {
        /**
         * The minuimum value on the x axis. If undefined, the minuimum value of the x domain will be used.
         */
        x0?: PrimitiveValue;
        /**
         * The maximum value on the x axis. If undefined, the maximum value of the x domain will be used.
         */
        x1?: PrimitiveValue;
        /**
         * The minimum value on the y axis. If undefined, the minimum value of the y domain will be used.
         */
        y0?: PrimitiveValue;
        /**
         * The maximum value on the y axis. If undefined, the maximum value of the y domain will be used.
         */
        y1?: PrimitiveValue;
    };
    /**
     * A textual description of the annotation
     */
    details?: string;
}
/** @public */
export declare type RectAnnotationSpec = BaseAnnotationSpec<typeof AnnotationType.Rectangle, RectAnnotationDatum, RectAnnotationStyle> & {
    /**
     * @deprecated use customTooltipDetails
     */
    renderTooltip?: AnnotationTooltipFormatter;
    /**
     * z-index of the annotation relative to other elements in the chart
     * @defaultValue -1
     */
    zIndex?: number;
    /**
     * Renders annotation outside of chart area within axis gutter
     *
     * @defaultValue false
     */
    outside?: boolean;
    /**
     * Dimension, either height or width, of outside annotation
     */
    outsideDimension?: number;
};
/**
 * Portal settings for annotation tooltips
 *
 * @public
 */
export declare type AnnotationPortalSettings = TooltipPortalSettings<'chart'> & {
    /**
     * The react component used to render a custom tooltip
     * @public
     */
    customTooltip?: CustomAnnotationTooltip;
    /**
     * The react component used to render a custom tooltip details
     * @public
     */
    customTooltipDetails?: AnnotationTooltipFormatter;
};
/** @public */
export interface BaseAnnotationSpec<T extends typeof AnnotationType.Rectangle | typeof AnnotationType.Line, AD extends RectAnnotationDatum | LineAnnotationDatum<D>, S extends RectAnnotationStyle | LineAnnotationStyle, D = never> extends Spec, AnnotationPortalSettings {
    chartType: typeof ChartType.XYAxis;
    specType: typeof SpecType.Annotation;
    /**
     * Annotation type: line, rectangle
     */
    annotationType: T;
    /**
     * The ID of the axis group, needed for yDomain position
     * @defaultValue {@link DEFAULT_GLOBAL_ID}
     */
    groupId: GroupId;
    /**
     * Data values defined with coordinates and details
     */
    dataValues: AD[];
    /**
     * Custom annotation style
     */
    style?: RecursivePartial<S>;
    /**
     * Toggles tooltip annotation visibility
     */
    hideTooltips?: boolean;
    /**
     * z-index of the annotation relative to other elements in the chart
     * Default specified per specific annotation spec.
     */
    zIndex?: number;
    /**
     * Animation configurations for annotations
     */
    animations?: AnnotationAnimationConfig[];
}
/** @public */
export declare type AnnotationSpec<D extends BaseDatum = any> = LineAnnotationSpec<D> | RectAnnotationSpec;
export {};
//# sourceMappingURL=specs.d.ts.map