import createCachedSelector from 're-reselect';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import {
  ColorPalette,
  euiColorBlindPalette,
  getCategoricalPalette,
  getDivergingPalette,
  getSequentialPalette,
} from '../../../../utils/colors/color_palette';

export const getColorPaletteSelector = createCachedSelector(
  [getSettingsSpecSelector],
  (settingsSpec): ReadonlyArray<string> | undefined => {
    if (!settingsSpec.colorPalette) {
      return undefined;
    }
    return getColorPalette(settingsSpec.colorPalette);
  },
)(getChartIdSelector);

function getColorPalette(colorPalette: ColorPalette): ReadonlyArray<string> {
  const { name, steps } = colorPalette;
  switch (name) {
    case 'categorical':
      return getCategoricalPalette('category10');
    case 'colorBlind':
      return euiColorBlindPalette;
    case 'grayscale':
      return getSequentialPalette('greys', steps);
    case 'warm':
      return getSequentialPalette('OrRd', steps);
    case 'cool':
      return getSequentialPalette('PuBu', steps);
    case 'status':
      return getDivergingPalette('RdYlGn', steps);
    case 'temperature':
      return getDivergingPalette('RdYlBu', steps);
    default:
      return euiColorBlindPalette;
  }
}
