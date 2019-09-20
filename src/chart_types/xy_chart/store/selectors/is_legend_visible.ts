import createCachedSelector from 're-reselect';
import { getSettingsSpecSelector } from '../../../../store/selectors/get_settings_specs';
import { IChartState } from '../../../../store/chart_store';

const isLegendCollapsedSelector = (state: IChartState) => state.interactions.legendCollapsed;

export const isLegendVisibleSelector = createCachedSelector(
  [getSettingsSpecSelector, isLegendCollapsedSelector],
  (settingsSpecs, isLegendCollapsed): boolean => {
    return settingsSpecs.showLegend && !isLegendCollapsed;
  },
)((state) => state.chartId);
