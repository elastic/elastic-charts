import { ReactNode } from 'react';
import { BaseDatum, Spec } from '.';
import { Color } from '../common/colors';
import { SeriesIdentifier } from '../common/series_id';
import { TooltipPortalSettings } from '../components/portal';
import { CustomTooltip } from '../components/tooltip';
import { SFProps } from '../state/spec_factory';
import { Accessor } from '../utils/accessor';
import { Datum } from '../utils/common';
import { TooltipStickTo, TooltipType } from './constants';
/**
 * This interface describe the properties of single value shown in the tooltip
 * @public
 */
export interface TooltipValue<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> {
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
    seriesIdentifier: SI;
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
export declare type TooltipValueFormatter<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = (data: TooltipValue<D, SI>) => JSX.Element | string;
/**
 * Either a {@link (TooltipProps:type)} or an {@link (TooltipProps:type)} configuration
 * @public
 * @deprecated use new Tooltip spec to set tooltip type and other options
 */
export declare type TooltipSettings = TooltipType | TooltipProps;
/**
 * Spec used to configure tooltip for chart
 * @public
 */
export interface TooltipSpec<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> extends Spec, TooltipPortalSettings<'chart'> {
    /**
     * The {@link (TooltipType:type) | TooltipType} of the tooltip
     * @defaultValue vertical
     */
    type: TooltipType;
    /**
     * Whenever the tooltip needs to snap to the x/band position or not
     * @defaultValue true
     */
    snap: boolean;
    /**
     * A {@link TooltipValueFormatter} to format the header value. Ignored when header is defined.
     */
    headerFormatter?: TooltipValueFormatter<D, SI>;
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
    customTooltip?: CustomTooltip<D, SI>;
    /**
     * Stick the tooltip to a specific position within the current cursor
     * @defaultValue mousePosition
     */
    stickTo?: TooltipStickTo;
    /**
     * Show null values on the tooltip
     * @defaultValue false
     */
    showNullValues: boolean;
    /**
     * Custom header for tooltip. Ignored when used with `customTooltip`.
     * \> Note: This is not the table headers but spans the entire tooltip.
     */
    header?: string | ((items: TooltipValue<D, SI>[]) => ReactNode);
    /**
     * Custom footer for tooltip. Ignored when used with `customTooltip`.
     * \> Note: This is not the table footers but spans the entire tooltip.
     */
    footer?: string | ((items: TooltipValue<D, SI>[]) => ReactNode);
    /**
     * Actions to enable tooltip selection
     */
    actions: TooltipAction<D, SI>[];
    /**
     * Prompt to display to indicate user can right-click for contextual menu
     */
    actionPrompt: string;
    /**
     * Prompt to display when tooltip is pinned but all actions are hidden
     */
    selectionPrompt: string;
}
/**
 * Default value for the tooltip type
 * @defaultValue `vertical` {@link (TooltipType:type) | TooltipType.VerticalCursor}
 * @public
 * @deprecated unused type will soon be removed
 */
export declare const DEFAULT_TOOLTIP_TYPE: "vertical";
/**
 * Default value for the tooltip snap
 * @defaultValue `true`
 * @public
 * @deprecated unused type will soon be removed
 */
export declare const DEFAULT_TOOLTIP_SNAP = true;
/**
 * Configure tooltip for chart
 * @public
 */
export declare const tooltipBuildProps: import("../state/spec_factory").BuildProps<TooltipSpec<any, SeriesIdentifier>, "id" | "chartType" | "specType", "type" | "actions" | "actionPrompt" | "selectionPrompt" | "snap" | "showNullValues", "footer" | "header" | "offset" | "fallbackPlacements" | "placement" | "boundary" | "boundaryPadding" | "headerFormatter" | "unit" | "customTooltip" | "stickTo", never>;
/** @public */
export declare const DEFAULT_TOOLTIP_SPEC: TooltipSpec;
/**
 * Adds settings spec to chart specs
 * @public
 */
export declare const Tooltip: <D extends BaseDatum = any, SI extends SeriesIdentifier = SeriesIdentifier>(props: SFProps<TooltipSpec<D, SI>, "id" | "chartType" | "specType", "type" | "actions" | "actionPrompt" | "selectionPrompt" | "snap" | "showNullValues", "footer" | "header" | "offset" | "fallbackPlacements" | "placement" | "boundary" | "boundaryPadding" | "headerFormatter" | "unit" | "customTooltip" | "stickTo", never>) => null;
/**
 * This interface describe the properties of single value shown in the tooltip
 * @public
 */
export declare type TooltipProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = SFProps<TooltipSpec<D, SI>, keyof typeof tooltipBuildProps['overrides'], keyof typeof tooltipBuildProps['defaults'], keyof typeof tooltipBuildProps['optionals'], keyof typeof tooltipBuildProps['requires']>;
//# sourceMappingURL=tooltip.d.ts.map