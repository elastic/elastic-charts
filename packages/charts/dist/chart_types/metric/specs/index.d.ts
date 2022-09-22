import { ComponentProps, ComponentType, ReactElement } from 'react';
import { $Values } from 'utility-types';
import { ChartType } from '../..';
import { Color } from '../../../common/colors';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { LayoutDirection } from '../../../utils/common';
/** @alpha */
export declare type MetricBase = {
    value: number;
    valueFormatter: (d: number) => string;
    color: Color;
    title?: string;
    subtitle?: string;
    extra?: ReactElement;
    icon?: ComponentType<{
        width: number;
        height: number;
        color: Color;
    }>;
};
/** @alpha */
export declare type MetricWProgress = MetricBase & {
    domainMax: number;
    progressBarDirection?: LayoutDirection;
};
/** @alpha */
export declare const MetricTrendShape: Readonly<{
    Bars: "bars";
    Area: "area";
}>;
/** @alpha */
export declare type MetricTrendShape = $Values<typeof MetricTrendShape>;
/** @alpha */
export declare type MetricWTrend = MetricBase & {
    trend: {
        x: number;
        y: number;
    }[];
    trendShape?: MetricTrendShape;
    trendA11yTitle?: string;
    trendA11yDescription?: string;
};
/** @alpha */
export interface MetricSpec extends Spec {
    specType: typeof SpecType.Series;
    chartType: typeof ChartType.Metric;
    data: (MetricBase | MetricWProgress | MetricWTrend | undefined)[][];
}
/** @alpha */
export declare const Metric: import("react").FC<import("../../../state/spec_factory").SFProps<MetricSpec, "chartType" | "specType", "data", never, "id">>;
/** @alpha */
export declare type MetricSpecProps = ComponentProps<typeof Metric>;
//# sourceMappingURL=index.d.ts.map