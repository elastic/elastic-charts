import { arc, pie } from 'd3-shape';
import createCachedSelector from 're-reselect';
import { GlobalChartState, GeometriesList, GlobalSettings } from '../../../../store/chart_store';
import { PieSpec } from '../../../../specs';
import { getPieSpecSelector } from './get_pie_spec';
import { getChartThemeSelector } from '../../../../store/selectors/get_chart_theme';
import { Theme } from '../../../../utils/themes/theme';

const getGlobalSettingsSelector = (state: GlobalChartState) => state.settings;

function render(pieSpec: PieSpec, globalSettings: GlobalSettings, theme: Theme) {
  const paths = pie().value((d: any) => {
    return d[pieSpec.accessor];
  })(pieSpec.data);
  const { width, height } = globalSettings.parentDimensions;
  const outerRadius = width < height ? width / 2 : height / 2;
  const innerRadius = pieSpec.donut ? outerRadius / 2 : 0;
  const arcGenerator = arc();
  const arcs = paths.map((path) => {
    const arc = arcGenerator({
      ...path,
      innerRadius: innerRadius,
      outerRadius: outerRadius,
    });
    return {
      arc: arc === null ? '' : arc,
      color: 'red',
      transform: {
        x: width / 2,
        y: height / 2,
      },
      geometryId: {
        specId: pieSpec.id,
        seriesKey: [],
      },
      seriesArcStyle: theme.arcSeriesStyle.arc,
    };
  });
  console.log(arcs);
  return { arcs };
}

export const computeGeometriesSelector = createCachedSelector(
  [getPieSpecSelector, getGlobalSettingsSelector, getChartThemeSelector],
  (pieSpec, globalSettings, theme): GeometriesList => {
    if (!pieSpec) {
      return {};
    }
    return render(pieSpec, globalSettings, theme);
  },
)((state) => state.chartId);
