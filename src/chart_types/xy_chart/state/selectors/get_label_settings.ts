import createCachedSelector from 're-reselect';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { SeriesLabelSettings } from '../../../../specs';

export const getLabelSettingsSelector = createCachedSelector(
  [getSettingsSpecSelector],
  ({ seriesLabels }): SeriesLabelSettings | undefined => seriesLabels,
)(getChartIdSelector);
