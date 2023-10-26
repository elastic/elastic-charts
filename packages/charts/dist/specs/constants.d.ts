import { $Values } from 'utility-types';
import { SettingsSpec } from './settings';
/** @public */
export declare const SpecType: Readonly<{
    Series: "series";
    Axis: "axis";
    Annotation: "annotation";
    Settings: "settings";
    Tooltip: "tooltip";
    IndexOrder: "index_order";
    SmallMultiples: "small_multiples";
}>;
/** @public */
export type SpecType = $Values<typeof SpecType>;
/**
 * Type of bin aggregations
 * @public
 */
export declare const BinAgg: Readonly<{
    /**
     * Order by sum of values in bin
     */
    Sum: "sum";
    /**
     * Order of values are used as is
     */
    None: "none";
}>;
/** @public */
export type BinAgg = $Values<typeof BinAgg>;
/**
 * Direction of sorting
 * @public
 */
export declare const Direction: Readonly<{
    /**
     * Least to greatest
     */
    Ascending: "ascending";
    /**
     * Greatest to least
     */
    Descending: "descending";
}>;
/** @public */
export type Direction = $Values<typeof Direction>;
/** @public */
export declare const PointerEventType: Readonly<{
    Over: "Over";
    Out: "Out";
}>;
/** @public */
export type PointerEventType = $Values<typeof PointerEventType>;
/**
 * This enums provides the available tooltip types
 * @public
 */
export declare const TooltipType: Readonly<{
    /** Vertical cursor parallel to x axis */
    VerticalCursor: "vertical";
    /** Vertical and horizontal cursors */
    Crosshairs: "cross";
    /** Follow the mouse coordinates */
    Follow: "follow";
    /** Hide every tooltip */
    None: "none";
}>;
/**
 * The TooltipType
 * @public
 */
export type TooltipType = $Values<typeof TooltipType>;
/** @public */
export declare const BrushAxis: Readonly<{
    X: "x";
    Y: "y";
    Both: "both";
}>;
/** @public */
export type BrushAxis = $Values<typeof BrushAxis>;
/**
 * pointer update trigger
 * @public
 */
export declare const PointerUpdateTrigger: Readonly<{
    X: "x";
    Y: "y";
    Both: "both";
}>;
/** @public */
export type PointerUpdateTrigger = $Values<typeof PointerUpdateTrigger>;
/**
 * The position to stick the tooltip to
 * @public
 */
export declare const TooltipStickTo: Readonly<{
    Top: "top";
    Bottom: "bottom";
    Middle: "middle";
    Left: "left";
    Right: "right";
    Center: "center";
    MousePosition: "MousePosition";
}>;
/** @public */
export type TooltipStickTo = $Values<typeof TooltipStickTo>;
/** @public */
export declare const settingsBuildProps: import("../state/spec_factory").BuildProps<SettingsSpec, "id" | "chartType" | "specType", "debug" | "locale" | "rotation" | "ariaLabelHeadingLevel" | "ariaUseDefaultSummary" | "legendPosition" | "flatLegend" | "legendMaxDepth" | "legendSize" | "showLegend" | "showLegendExtra" | "baseTheme" | "rendering" | "animateData" | "externalPointerEvents" | "pointBuffer" | "resizeDebounce" | "pointerUpdateTrigger" | "brushAxis" | "minBrushDelta" | "allowBrushingLastHistogramBin", "ariaLabel" | "xDomain" | "ariaDescription" | "ariaDescribedBy" | "ariaLabelledBy" | "ariaTableCaption" | "theme" | "legendAction" | "legendColorPicker" | "legendStrategy" | "onLegendItemClick" | "customLegend" | "onLegendItemMinusClick" | "onLegendItemOut" | "onLegendItemOver" | "onLegendItemPlusClick" | "orderOrdinalBinsBy" | "debugState" | "onProjectionClick" | "onElementClick" | "onElementOver" | "onElementOut" | "onBrushEnd" | "onPointerUpdate" | "onRenderChange" | "onProjectionAreaChange" | "onAnnotationClick" | "pointerUpdateDebounce" | "roundHistogramBrushValues" | "noResults" | "legendSort", never>;
/** @public */
export declare const DEFAULT_SETTINGS_SPEC: SettingsSpec;
//# sourceMappingURL=constants.d.ts.map