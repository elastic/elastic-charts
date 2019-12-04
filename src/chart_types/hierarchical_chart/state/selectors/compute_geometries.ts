import { arc, pie } from 'd3-shape';
import createCachedSelector from 're-reselect';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { Theme } from '../../../../utils/themes/theme';
import { ArcGeometry } from '../../../../utils/geometry';
import { Dimensions } from '../../../../utils/dimensions';
import { SunburstSpec } from '../../specs/sunburst_spec';
import { getSpecsFromStore } from '../../../../state/utils';
import { ChartTypes } from '../../..';
import { SpecTypes } from '../../../xy_chart/utils/specs';

const getSpecs = (state: GlobalChartState) => state.specs;
const getParentDimensionsSelector = (state: GlobalChartState) => state.parentDimensions;

function render(sunburstSpec: SunburstSpec, parentDimensions: Dimensions, theme: Theme) {
  const paths = pie().value((d: any) => {
    return d[sunburstSpec.yAccessor];
  })(sunburstSpec.data);
  const { width, height } = parentDimensions;
  const outerRadius = width < height ? width / 2 : height / 2;
  const innerRadius = sunburstSpec.donut ? outerRadius / 2 : 0;
  const arcGenerator = arc();
  const arcs = paths.map<ArcGeometry>((path, i) => {
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
      seriesArcStyle: theme.arcSeriesStyle.arc,
      seriesIdentifier: {
        key: '',
        specId: sunburstSpec.id,
        yAccessor: 0,
        splitAccessors: new Map(),
        seriesKeys: [],
      },
    };
  });
  return { arcs };
}

export const computeGeometriesSelector = createCachedSelector(
  [getSpecs, getParentDimensionsSelector, getChartThemeSelector],
  (specs, parentDimensions, theme): { arcs: ArcGeometry[] } => {
    const pieSpecs = getSpecsFromStore<SunburstSpec>(specs, ChartTypes.Sunburst, SpecTypes.Series);
    if (pieSpecs.length !== 1) {
      return { arcs: [] };
    }
    return render(pieSpecs[0], parentDimensions, theme);
  },
)((state) => state.chartId);
