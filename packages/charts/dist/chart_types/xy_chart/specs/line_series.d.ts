import { ComponentProps } from 'react';
import { SFProps } from '../../../state/spec_factory';
import { LineSeriesSpec, BaseDatum } from '../utils/specs';
declare const buildProps: import("../../../state/spec_factory").BuildProps<LineSeriesSpec, "chartType" | "specType" | "seriesType", "groupId" | "xScaleType" | "yScaleType" | "hideInLegend" | "histogramModeAlignment", "name" | "color" | "fit" | "curve" | "timeZone" | "lineSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "stackAccessors" | "markSizeAccessor" | "markFormat" | "pointStyleAccessor", "id" | "data" | "xAccessor" | "yAccessors">;
/**
 * Adds bar series to chart specs
 * @public
 */
export declare const LineSeries: <D extends BaseDatum = any>(props: SFProps<LineSeriesSpec<D>, "chartType" | "specType" | "seriesType", "groupId" | "xScaleType" | "yScaleType" | "hideInLegend" | "histogramModeAlignment", "name" | "color" | "fit" | "curve" | "timeZone" | "lineSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "stackAccessors" | "markSizeAccessor" | "markFormat" | "pointStyleAccessor", "id" | "data" | "xAccessor" | "yAccessors">) => null;
/** @public */
export type LineSeriesProps = ComponentProps<typeof LineSeries>;
export {};
//# sourceMappingURL=line_series.d.ts.map