import { GlobalChartState } from '../../../../state/chart_state';
import { getSpecsFromStore } from '../../../../state/utils';
import { PartitionSpec } from '../../specs';
import { ChartTypes } from '../../..';
import { SpecTypes } from '../../../../specs';

export function getPieSpecOrNull(state: GlobalChartState): PartitionSpec | null {
  const pieSpecs = getSpecsFromStore<PartitionSpec>(state.specs, ChartTypes.Partition, SpecTypes.Series);
  return pieSpecs.length > 0 ? pieSpecs[0] : null;
}
