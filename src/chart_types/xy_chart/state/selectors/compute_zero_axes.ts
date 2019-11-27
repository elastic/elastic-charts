import createCachedSelector from 're-reselect';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { ZeroAxisSpec } from '../../utils/specs';
import { computeZeroAxes } from '../../utils/zero_axis_utils';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';

export const computeZeroAxesSelector = createCachedSelector(
  [getSettingsSpecSelector, computeSeriesGeometriesSelector, computeChartDimensionsSelector, getChartRotationSelector],
  (settingsSpecs, seriesGeometries, chartDimensions, chartRotation): ZeroAxisSpec[] => {
    if (settingsSpecs.hideZeroAxes) {
      return [];
    }
    const { yScales } = seriesGeometries.scales;
    return computeZeroAxes(yScales, chartDimensions.chartDimensions, chartRotation);
  },
)(getChartIdSelector);
