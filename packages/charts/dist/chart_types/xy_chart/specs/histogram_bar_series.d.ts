import { ComponentProps } from 'react';
import { SFProps } from '../../../state/spec_factory';
import { HistogramBarSeriesSpec, BaseDatum } from '../utils/specs';
declare const buildProps: import("../../../state/spec_factory").BuildProps<HistogramBarSeriesSpec, "chartType" | "specType" | "seriesType", "groupId" | "enableHistogramMode" | "xScaleType" | "yScaleType" | "hideInLegend", "name" | "color" | "timeZone" | "barSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "markSizeAccessor" | "stackMode" | "styleAccessor" | "minBarHeight", "id" | "data" | "xAccessor" | "yAccessors">;
/**
 * Adds bar series to chart specs
 * @public
 */
export declare const HistogramBarSeries: <D extends BaseDatum = any>(props: SFProps<HistogramBarSeriesSpec<D>, "chartType" | "specType" | "seriesType", "groupId" | "enableHistogramMode" | "xScaleType" | "yScaleType" | "hideInLegend", "name" | "color" | "timeZone" | "barSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "markSizeAccessor" | "stackMode" | "styleAccessor" | "minBarHeight", "id" | "data" | "xAccessor" | "yAccessors">) => null;
/** @public */
export type HistogramBarSeriesProps = ComponentProps<typeof HistogramBarSeries>;
export {};
//# sourceMappingURL=histogram_bar_series.d.ts.map