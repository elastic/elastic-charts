import createCachedSelector from 're-reselect';
import { getSettingsSpecSelector } from './get_settings_specs';
import { SettingsSpec, TooltipValueFormatter, isTooltipProps } from '../../specs/settings';
import { getChartIdSelector } from './get_chart_id';

export const getTooltipHeaderFormatterSelector = createCachedSelector(
  [getSettingsSpecSelector],
  getTooltipHeaderFormatter,
)(getChartIdSelector);

function getTooltipHeaderFormatter(settings: SettingsSpec): TooltipValueFormatter | undefined {
  const { tooltip } = settings;
  if (tooltip && isTooltipProps(tooltip)) {
    return tooltip.headerFormatter;
  }
  return undefined;
}
