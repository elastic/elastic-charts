import createCachedSelector from 're-reselect';
import { isTooltipProps } from '../../utils/interactions';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { SettingsSpec } from '../../../../specs/settings';
import { DEFAULT_TOOLTIP_SNAP } from '../../../../specs/settings';

export const getTooltipSnapSelector = createCachedSelector([getSettingsSpecSelector], getTooltipSnap)(
  (state) => state.chartId,
);

function getTooltipSnap(settings: SettingsSpec): boolean {
  const { tooltip } = settings;
  if (tooltip && isTooltipProps(tooltip)) {
    return tooltip.snap || false;
  }
  return DEFAULT_TOOLTIP_SNAP;
}
