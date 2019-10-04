import createCachedSelector from 're-reselect';
import { TooltipType, isTooltipProps, isTooltipType } from '../../utils/interactions';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { SettingsSpec } from '../../../../specs/settings';

export const getTooltipTypeSelector = createCachedSelector([getSettingsSpecSelector], getTooltipType)(
  (state) => state.chartId,
);

function getTooltipType(settings: SettingsSpec): TooltipType {
  const { tooltip } = settings;
  if (tooltip === undefined || tooltip === null) {
    return TooltipType.VerticalCursor;
  }
  if (isTooltipType(tooltip)) {
    return tooltip;
  }
  if (isTooltipProps(tooltip)) {
    return tooltip.type || TooltipType.VerticalCursor;
  }
  return TooltipType.VerticalCursor;
}
