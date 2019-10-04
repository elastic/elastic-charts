import createCachedSelector from 're-reselect';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { GlobalChartState } from '../../../../state/chart_state';

const isLegendCollapsedSelector = (state: GlobalChartState) => state.interactions.legendCollapsed;

export const isLegendVisibleSelector = createCachedSelector(
  [getSettingsSpecSelector, isLegendCollapsedSelector],
  (settingsSpecs, isLegendCollapsed): boolean => {
    return settingsSpecs.showLegend && !isLegendCollapsed;
  },
)((state) => state.chartId);
