import { IChartStore, IChartState } from 'store/chart_store';
import { computeGeometriesSelector } from './selectors/compute_geometries';
import { ChartTypes } from 'chart_types';

export class PieChartStore implements IChartStore {
  chartType = ChartTypes.Pie;
  render(state: IChartState) {
    return computeGeometriesSelector(state);
  }
  getChartDimensions(state: IChartState) {
    return state.settings.parentDimensions;
  }
  getCustomChartComponents() {
    return null;
  }
  isBrushAvailable() {
    return false;
  }
}
