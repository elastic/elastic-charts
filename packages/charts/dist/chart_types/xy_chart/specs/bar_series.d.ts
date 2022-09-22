import { ComponentProps } from 'react';
import { SFProps } from '../../../state/spec_factory';
import { BarSeriesSpec, BaseDatum } from '../utils/specs';
declare const buildProps: import("../../../state/spec_factory").BuildProps<BarSeriesSpec<any>, "chartType" | "specType" | "seriesType", "groupId" | "xScaleType" | "yScaleType" | "hideInLegend" | "enableHistogramMode", "sortIndex" | "timeZone" | "name" | "color" | "barSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "stackAccessors" | "markSizeAccessor" | "stackMode" | "styleAccessor" | "minBarHeight", "data" | "id" | "xAccessor" | "yAccessors">;
/**
 * Adds bar series to chart specs
 * @public
 */
export declare const BarSeries: <D extends BaseDatum = any>(props: SFProps<BarSeriesSpec<D>, "chartType" | "specType" | "seriesType", "groupId" | "xScaleType" | "yScaleType" | "hideInLegend" | "enableHistogramMode", "sortIndex" | "timeZone" | "name" | "color" | "barSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "stackAccessors" | "markSizeAccessor" | "stackMode" | "styleAccessor" | "minBarHeight", "data" | "id" | "xAccessor" | "yAccessors">) => null;
/** @public */
export declare type BarSeriesProps = ComponentProps<typeof BarSeries>;
export {};
//# sourceMappingURL=bar_series.d.ts.map