import { ComponentProps } from 'react';
import { SFProps } from '../../../state/spec_factory';
import { HistogramBarSeriesSpec, BaseDatum } from '../utils/specs';
declare const buildProps: import("../../../state/spec_factory").BuildProps<HistogramBarSeriesSpec<any>, "chartType" | "specType" | "seriesType", "groupId" | "xScaleType" | "yScaleType" | "hideInLegend" | "enableHistogramMode", "sortIndex" | "timeZone" | "name" | "color" | "barSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "markSizeAccessor" | "stackMode" | "styleAccessor" | "minBarHeight", "data" | "id" | "xAccessor" | "yAccessors">;
/**
 * Adds bar series to chart specs
 * @public
 */
export declare const HistogramBarSeries: <D extends BaseDatum = any>(props: SFProps<HistogramBarSeriesSpec<D>, "chartType" | "specType" | "seriesType", "groupId" | "xScaleType" | "yScaleType" | "hideInLegend" | "enableHistogramMode", "sortIndex" | "timeZone" | "name" | "color" | "barSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "markSizeAccessor" | "stackMode" | "styleAccessor" | "minBarHeight", "data" | "id" | "xAccessor" | "yAccessors">) => null;
/** @public */
export declare type HistogramBarSeriesProps = ComponentProps<typeof HistogramBarSeries>;
export {};
//# sourceMappingURL=histogram_bar_series.d.ts.map