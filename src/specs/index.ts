import { ChartType } from '../state/chart_state';

export interface Spec {
  /** unique Spec identifier */
  id: string;
  /** Chart type define the type of chart that use this spec */
  chartType: ChartType;
  /** The type of spec, can be series, axis, annotation, settings etc*/
  specType: string;
}
export * from './settings';

export * from '../chart_types/specs';
