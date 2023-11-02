import { ComponentProps } from 'react';
import { SFProps } from '../../../state/spec_factory';
import { BarSeriesSpec, BaseDatum } from '../utils/specs';
declare const buildProps: import("../../../state/spec_factory").BuildProps<BarSeriesSpec, "chartType" | "specType" | "seriesType", "groupId" | "enableHistogramMode" | "xScaleType" | "yScaleType" | "hideInLegend", "name" | "color" | "timeZone" | "barSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "stackAccessors" | "markSizeAccessor" | "stackMode" | "styleAccessor" | "minBarHeight", "id" | "data" | "xAccessor" | "yAccessors">;
/**
 * Adds bar series to chart specs
 * @public
 */
export declare const BarSeries: <D extends BaseDatum = any>(props: SFProps<BarSeriesSpec<D>, "chartType" | "specType" | "seriesType", "groupId" | "enableHistogramMode" | "xScaleType" | "yScaleType" | "hideInLegend", "name" | "color" | "timeZone" | "barSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "stackAccessors" | "markSizeAccessor" | "stackMode" | "styleAccessor" | "minBarHeight", "id" | "data" | "xAccessor" | "yAccessors">) => null;
/** @public */
export type BarSeriesProps = ComponentProps<typeof BarSeries>;
export {};
//# sourceMappingURL=bar_series.d.ts.map