import { SpecList, ChartType } from './chart_store';
import { Spec } from '../specs';

export function getSpecsFromStore<U extends Spec>(specs: SpecList, chartType: ChartType, specType?: string): U[] {
  return Object.keys(specs)
    .filter((specId) => {
      const currentSpec = specs[specId];
      if (specType) {
        return currentSpec.specType === specType && currentSpec.chartType === chartType;
      } else {
        return currentSpec.chartType === chartType;
      }
    })
    .map((specId) => {
      return specs[specId] as U;
    });
}
