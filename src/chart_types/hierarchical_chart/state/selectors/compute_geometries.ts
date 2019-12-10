import createCachedSelector from 're-reselect';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSpecsFromStore } from '../../../../state/utils';
import { ChartTypes } from '../../..';
import { SpecTypes } from '../../../xy_chart/utils/specs';
import { render } from './scenegraph';
import { nullSectorViewModel, ShapeViewModel } from '../../layout/circline/types/ViewModelTypes';
import { SunburstSpec } from '../../specs/index';

const getSpecs = (state: GlobalChartState) => state.specs;

const getParentDimensions = (state: GlobalChartState) => state.parentDimensions;

export const sunburstGeometries = createCachedSelector(
  [getSpecs, getParentDimensions, getChartThemeSelector],
  (specs, parentDimensions, theme): ShapeViewModel => {
    const pieSpecs = getSpecsFromStore<SunburstSpec>(specs, ChartTypes.Sunburst, SpecTypes.Series);
    return pieSpecs.length === 1 ? render(pieSpecs[0], parentDimensions, theme) : nullSectorViewModel();
  },
)((state) => state.chartId);
