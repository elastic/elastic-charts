import { ComponentProps } from 'react';
import { SFProps } from '../../../state/spec_factory';
import { BaseDatum, BubbleSeriesSpec } from '../utils/specs';
declare const buildProps: import("../../../state/spec_factory").BuildProps<BubbleSeriesSpec, "chartType" | "specType" | "seriesType", "groupId" | "xScaleType" | "yScaleType" | "hideInLegend", "name" | "color" | "timeZone" | "bubbleSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "stackAccessors" | "markSizeAccessor" | "markFormat" | "pointStyleAccessor", "id" | "data" | "xAccessor" | "yAccessors">;
/**
 * Adds bar series to chart specs
 * @public
 */
export declare const BubbleSeries: <D extends BaseDatum = any>(props: SFProps<BubbleSeriesSpec<D>, "chartType" | "specType" | "seriesType", "groupId" | "xScaleType" | "yScaleType" | "hideInLegend", "name" | "color" | "timeZone" | "bubbleSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "stackAccessors" | "markSizeAccessor" | "markFormat" | "pointStyleAccessor", "id" | "data" | "xAccessor" | "yAccessors">) => null;
/** @public */
export type BubbleSeriesProps = ComponentProps<typeof BubbleSeries>;
export {};
//# sourceMappingURL=bubble_series.d.ts.map