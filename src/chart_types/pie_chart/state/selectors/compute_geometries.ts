import { arc, pie } from 'd3-shape';
import createCachedSelector from 're-reselect';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { Theme } from '../../../../utils/themes/theme';
import { ArcGeometry } from '../../../../utils/geometry';
import { Dimensions } from '../../../../utils/dimensions';
import { PieSpec } from '../../specs/pie_spec';
import { getSpecsFromStore } from '../../../../state/utils';
import { ChartTypes } from '../../..';
import { SpecTypes } from '../../../xy_chart/utils/specs';

const getSpecs = (state: GlobalChartState) => state.specs;
const getParentDimensionsSelector = (state: GlobalChartState) => state.parentDimensions;

function render(pieSpec: PieSpec, parentDimensions: Dimensions, theme: Theme) {
  const paths = pie().value((d: any) => {
    return d[pieSpec.yAccessor];
  })(pieSpec.data);
  const { width, height } = parentDimensions;
  const outerRadius = width < height ? width / 2 : height / 2;
  const innerRadius = pieSpec.donut ? outerRadius / 2 : 0;
  const arcGenerator = arc();
  const arcs = paths.map((path, i) => {
    const arc = arcGenerator({
      ...path,
      innerRadius: innerRadius,
      outerRadius: outerRadius,
    });
    return {
      arc: arc === null ? '' : arc,
      color: theme.colors.vizColors[i % theme.colors.vizColors.length],
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
  [getSpecs, getParentDimensionsSelector, getChartThemeSelector],
  (specs, parentDimensions, theme): { arcs?: ArcGeometry[] } => {
    const pieSpecs = getSpecsFromStore<PieSpec>(specs, ChartTypes.Pie, SpecTypes.Series);
    if (pieSpecs.length !== 1) {
      return {};
    }
    return render(pieSpecs[0], parentDimensions, theme);
  },
)((state) => state.chartId);
