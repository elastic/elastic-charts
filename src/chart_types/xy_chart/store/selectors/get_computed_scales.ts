import createCachedSelector from 're-reselect';
import { ComputedScales } from '../utils';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';

export const getComputedScalesSelector = createCachedSelector(
  [computeSeriesGeometriesSelector],
  (geometries): ComputedScales => {
    return geometries.scales;
  },
)((state) => state.chartId);
