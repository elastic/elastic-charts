import { ComponentProps } from 'react';
import { SFProps } from '../../../state/spec_factory';
import { BaseDatum, BubbleSeriesSpec } from '../utils/specs';
declare const buildProps: import("../../../state/spec_factory").BuildProps<BubbleSeriesSpec<any>, "chartType" | "specType" | "seriesType", "groupId" | "xScaleType" | "yScaleType" | "hideInLegend", "sortIndex" | "timeZone" | "name" | "color" | "bubbleSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "stackAccessors" | "markSizeAccessor" | "markFormat" | "pointStyleAccessor", "data" | "id" | "xAccessor" | "yAccessors">;
/**
 * Adds bar series to chart specs
 * @public
 */
export declare const BubbleSeries: <D extends BaseDatum = any>(props: SFProps<BubbleSeriesSpec<D>, "chartType" | "specType" | "seriesType", "groupId" | "xScaleType" | "yScaleType" | "hideInLegend", "sortIndex" | "timeZone" | "name" | "color" | "bubbleSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "stackAccessors" | "markSizeAccessor" | "markFormat" | "pointStyleAccessor", "data" | "id" | "xAccessor" | "yAccessors">) => null;
/** @public */
export declare type BubbleSeriesProps = ComponentProps<typeof BubbleSeries>;
export {};
//# sourceMappingURL=bubble_series.d.ts.map