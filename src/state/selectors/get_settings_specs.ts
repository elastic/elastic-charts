import createCachedSelector from 're-reselect';
import { GlobalChartState } from '../chart_state';
import { ChartTypes } from '../../chart_types';
import { getSpecsFromStore } from '../utils';
import { SettingsSpec } from '../../specs/settings';

const getSpecs = (state: GlobalChartState) => state.specs;

export const getSettingsSpecSelector = createCachedSelector(
  [getSpecs],
  (specs): SettingsSpec => {
    const settingsSpecs = getSpecsFromStore<SettingsSpec>(specs, ChartTypes.Global, 'settings');
    if (settingsSpecs.length > 1) {
      throw new Error('Multiple settings specs are configured on the same chart');
    }
    return settingsSpecs[0];
  },
)((state) => state.chartId);
