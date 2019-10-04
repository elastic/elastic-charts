import createCachedSelector from 're-reselect';
import { getSettingsSpecSelector } from '../../../../store/selectors/get_settings_specs';
import { GlobalChartState } from '../../../../store/chart_store';

const isLegendCollapsedSelector = (state: GlobalChartState) => state.interactions.legendCollapsed;

export const isLegendVisibleSelector = createCachedSelector(
  [getSettingsSpecSelector, isLegendCollapsedSelector],
  (settingsSpecs, isLegendCollapsed): boolean => {
    return settingsSpecs.showLegend && !isLegendCollapsed;
  },
)((state) => state.chartId);
