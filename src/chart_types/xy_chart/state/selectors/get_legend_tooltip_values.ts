import createCachedSelector from 're-reselect';
import { getSeriesTooltipValues, TooltipLegendValue } from '../../tooltip/tooltip';
import { getTooltipValuesSelector } from './get_tooltip_values_highlighted_geoms';

export const getLegendTooltipValuesSelector = createCachedSelector(
  [getTooltipValuesSelector],
  (tooltipData): Map<string, TooltipLegendValue> => {
    return getSeriesTooltipValues(tooltipData);
  },
)((state) => state.chartId);
