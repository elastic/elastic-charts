import { ComponentProps, ComponentType, ReactElement } from 'react';
import { $Values } from 'utility-types';
import { ChartType } from '../..';
import { Color } from '../../../common/colors';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { LayoutDirection } from '../../../utils/common';
/** @alpha */
export type MetricBase = {
    color: Color;
    title?: string;
    valueColor?: Color;
    valueIcon?: ComponentType<{
        width: number;
        height: number;
        color: Color;
        verticalAlign: 'middle';
    }>;
    subtitle?: string;
    extra?: ReactElement;
    icon?: ComponentType<{
        width: number;
        height: number;
        color: Color;
    }>;
};
/** @alpha */
export type MetricWText = MetricBase & {
    value: string;
};
/** @alpha */
export type MetricWNumber = MetricBase & {
    value: number;
    valueFormatter: (d: number) => string;
};
/** @alpha */
export type MetricWProgress = MetricWNumber & {
    domainMax: number;
    progressBarDirection: LayoutDirection;
};
/** @alpha */
export declare const MetricTrendShape: Readonly<{
    Bars: "bars";
    Area: "area";
}>;
/** @alpha */
export type MetricTrendShape = $Values<typeof MetricTrendShape>;
/** @alpha */
export type MetricWTrend = (MetricWNumber | MetricWText) & {
    trend: {
        x: number;
        y: number;
    }[];
    trendShape: MetricTrendShape;
    trendA11yTitle?: string;
    trendA11yDescription?: string;
};
/** @alpha */
export type MetricDatum = MetricWNumber | MetricWText | MetricWProgress | MetricWTrend;
/** @alpha */
export interface MetricSpec extends Spec {
    specType: typeof SpecType.Series;
    chartType: typeof ChartType.Metric;
    data: (MetricDatum | undefined)[][];
}
/** @alpha */
export declare const Metric: import("react").FC<import("../../../state/spec_factory").SFProps<MetricSpec, "chartType" | "specType", "data", never, "id">>;
/** @alpha */
export type MetricSpecProps = ComponentProps<typeof Metric>;
//# sourceMappingURL=index.d.ts.map