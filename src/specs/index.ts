import { ChartType } from '../store/chart_store';

export interface Spec {
  /** Spec identifier */
  id: string;
  /** Chart type */
  chartType: ChartType;
  /** The type of spec*/
  specType: string;
}
export * from './settings';

export * from '../chart_types/specs';
