import createCachedSelector from 're-reselect';
import { getSettingsSpecSelector } from './get_settings_specs';
import { PartialTheme, Theme, mergeWithDefaultTheme } from '../../utils/themes/theme';
import { LIGHT_THEME } from '../../utils/themes/light_theme';
import { getChartIdSelector } from './get_chart_id';
import { getColorPaletteSelector } from '../../chart_types/xy_chart/state/selectors/get_color_palette';

export const getChartThemeSelector = createCachedSelector(
  [getSettingsSpecSelector, getColorPaletteSelector],
  (settingsSpec, colorPaletteSpec): Theme => {
    return getTheme(settingsSpec.baseTheme, settingsSpec.theme, colorPaletteSpec);
  },
)(getChartIdSelector);

function getTheme(
  baseTheme?: Theme,
  theme?: PartialTheme | PartialTheme[],
  colorPaletteSpec?: ReadonlyArray<string>,
): Theme {
  const base = baseTheme ? baseTheme : LIGHT_THEME;
  let finalTheme = base;

  if (Array.isArray(theme)) {
    const [firstTheme, ...axillaryThemes] = theme;
    finalTheme = mergeWithDefaultTheme(firstTheme, base, axillaryThemes);
  } else {
    finalTheme = theme ? mergeWithDefaultTheme(theme, base) : base;
  }
  if (colorPaletteSpec) {
    const colors = Object.assign({}, finalTheme.colors, { vizColors: colorPaletteSpec });
    return Object.assign({}, finalTheme, { colors: colors });
  }

  return finalTheme;
}
