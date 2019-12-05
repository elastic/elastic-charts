import { SunburstSpec } from '../../specs/sunburst_spec';
import { Dimensions } from '../../../../utils/dimensions';
import { Theme } from '../../../../utils/themes/theme';
import { arc as d3arc, pie as d3pie } from 'd3-shape';
import { ArcGeometry } from '../../../../utils/geometry';

export function render(sunburstSpec: SunburstSpec, parentDimensions: Dimensions, theme: Theme) {
  const paths = d3pie().value((d: any) => {
    return d[sunburstSpec.yAccessor];
  })(sunburstSpec.data);
  const { width, height } = parentDimensions;
  const outerRadius = width < height ? width / 2 : height / 2;
  const innerRadius = sunburstSpec.donut ? outerRadius / 2 : 0;
  const arcGenerator = d3arc();
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
