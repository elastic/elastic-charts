import { ChartType } from '../chart_types';
/** @public */
export interface Spec {
    /** unique Spec identifier */
    id: string;
    /** Chart type define the type of chart that use this spec */
    chartType: ChartType;
    /** The type of spec, can be series, axis, annotation, settings etc */
    specType: string;
}
export * from './group_by';
export * from './small_multiples';
export * from './settings';
export * from './constants';
export * from './tooltip';
export * from '../chart_types/specs';
//# sourceMappingURL=index.d.ts.map