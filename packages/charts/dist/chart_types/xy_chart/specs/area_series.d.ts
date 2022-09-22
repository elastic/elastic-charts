import { ComponentProps } from 'react';
import { SFProps } from '../../../state/spec_factory';
import { AreaSeriesSpec, BaseDatum } from '../utils/specs';
declare const buildProps: import("../../../state/spec_factory").BuildProps<AreaSeriesSpec<any>, "chartType" | "specType" | "seriesType", "groupId" | "xScaleType" | "yScaleType" | "hideInLegend" | "histogramModeAlignment", "sortIndex" | "fit" | "timeZone" | "name" | "color" | "curve" | "areaSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "stackAccessors" | "markSizeAccessor" | "markFormat" | "stackMode" | "pointStyleAccessor", "data" | "id" | "xAccessor" | "yAccessors">;
/**
 * Adds bar series to chart specs
 * @public
 */
export declare const AreaSeries: <D extends BaseDatum = any>(props: SFProps<AreaSeriesSpec<D>, "chartType" | "specType" | "seriesType", "groupId" | "xScaleType" | "yScaleType" | "hideInLegend" | "histogramModeAlignment", "sortIndex" | "fit" | "timeZone" | "name" | "color" | "curve" | "areaSeriesStyle" | "xNice" | "yNice" | "useDefaultGroupDomain" | "displayValueSettings" | "y0AccessorFormat" | "y1AccessorFormat" | "filterSeriesInTooltip" | "tickFormat" | "y0Accessors" | "splitSeriesAccessors" | "stackAccessors" | "markSizeAccessor" | "markFormat" | "stackMode" | "pointStyleAccessor", "data" | "id" | "xAccessor" | "yAccessors">) => null;
/** @public */
export declare type AreaSeriesProps = ComponentProps<typeof AreaSeries>;
export {};
//# sourceMappingURL=area_series.d.ts.map