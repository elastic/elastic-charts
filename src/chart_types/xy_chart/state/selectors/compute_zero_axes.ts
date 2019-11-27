import createCachedSelector from 're-reselect';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { ZeroAxisSpec } from '../../utils/specs';
import { computeZeroAxes } from '../../utils/zero_axis_utils';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';

export const computeZeroAxesSelector = createCachedSelector(
  [
    getSettingsSpecSelector,
    computeSeriesGeometriesSelector,
    getChartContainerDimensionsSelector,
    getChartRotationSelector,
  ],
  (settingsSpecs, seriesGeometries, chartDimensions, chartRotation): ZeroAxisSpec[] => {
    if (settingsSpecs.hideZeroAxes) {
      return [];
    }
    const { yScales } = seriesGeometries.scales;
    return computeZeroAxes(yScales, chartDimensions, chartRotation);
  },
)(getChartIdSelector);
