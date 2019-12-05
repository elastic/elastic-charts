import createCachedSelector from 're-reselect';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { SunburstSpec } from '../../specs/sunburst_spec';
import { getSpecsFromStore } from '../../../../state/utils';
import { ChartTypes } from '../../..';
import { SpecTypes } from '../../../xy_chart/utils/specs';
import { render } from './scenegraph';
import { nullSectorViewModel } from '../../renderer/canvas/sunburst';
import { ShapeViewModel } from '../../layout/circline/types/ViewModelTypes';

const getSpecs = (state: GlobalChartState) => state.specs;
const getParentDimensionsSelector = (state: GlobalChartState) => state.parentDimensions;

export const computeGeometriesSelector = createCachedSelector(
  [getSpecs, getParentDimensionsSelector, getChartThemeSelector],
  (specs, parentDimensions, theme): ShapeViewModel => {
    const pieSpecs = getSpecsFromStore<SunburstSpec>(specs, ChartTypes.Sunburst, SpecTypes.Series);
    if (pieSpecs.length !== 1) {
      return nullSectorViewModel();
    }
    return render(pieSpecs[0], parentDimensions, theme);
  },
)((state) => state.chartId);
