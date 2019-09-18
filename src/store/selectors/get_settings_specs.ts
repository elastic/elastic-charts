import createCachedSelector from 're-reselect';
import { IChartState } from '../chart_store';
import { ChartTypes } from '../../chart_types';
import { getSpecsFromStore } from '../utils';
import { SettingsSpec } from '../../specs/settings';

const getSpecs = (state: IChartState) => state.specs;

export const getSettingsSpecSelector = createCachedSelector(
  [getSpecs],
  (specs): SettingsSpec => {
    console.log('---- get settings specs ----');
    const settingsSpecs = getSpecsFromStore<SettingsSpec>(specs, ChartTypes.Global, 'settings');
    if (settingsSpecs.length > 1) {
      throw new Error('Multiple settings specs are configured on the same chart');
    }
    console.log({ settingsSpecs: settingsSpecs[0] });
    return settingsSpecs[0];
  },
)((state) => state.chartId);
