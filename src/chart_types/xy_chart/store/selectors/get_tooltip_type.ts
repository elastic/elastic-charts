import createCachedSelector from 're-reselect';
import { TooltipType, isTooltipType, isTooltipProps } from '../../utils/interactions';
import { getSettingsSpecSelector } from 'store/selectors/get_settings_specs';
import { SettingsSpec } from 'specs/settings';

export const getTooltipTypeSelector = createCachedSelector([getSettingsSpecSelector], getTooltipType)(
  (state) => state.chartId,
);

function getTooltipType(settings: SettingsSpec): TooltipType | undefined {
  const { tooltip } = settings;
  if (!tooltip) {
    return undefined;
  }
  if (isTooltipType(tooltip)) {
    return tooltip;
  }
  if (isTooltipProps(tooltip)) {
    return tooltip.type;
  }
}
