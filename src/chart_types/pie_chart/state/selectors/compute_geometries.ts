import { arc, pie } from 'd3-shape';
import createCachedSelector from 're-reselect';
import { GlobalChartState } from '../../../../state/chart_state';
import { PieSpec } from '../../../../specs';
import { getPieSpecSelector } from './get_pie_spec';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { Theme } from '../../../../utils/themes/theme';
import { ArcGeometry } from '../../../../utils/geometry';
import { Dimensions } from '../../../../utils/dimensions';

const getGlobalSettingsSelector = (state: GlobalChartState) => state.parentDimensions;

function render(pieSpec: PieSpec, parentDimensions: Dimensions, theme: Theme) {
  const paths = pie().value((d: any) => {
    return d[pieSpec.accessor];
  })(pieSpec.data);
  const { width, height } = parentDimensions;
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
  return { arcs };
}

export const computeGeometriesSelector = createCachedSelector(
  [getPieSpecSelector, getGlobalSettingsSelector, getChartThemeSelector],
  (pieSpec, parentDimensions, theme): { arcs?: ArcGeometry[] } => {
    if (!pieSpec) {
      return {};
    }
    return render(pieSpec, parentDimensions, theme);
  },
)((state) => state.chartId);
