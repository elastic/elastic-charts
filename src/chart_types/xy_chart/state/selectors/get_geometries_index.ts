import createCachedSelector from 're-reselect';
import { IndexedGeometry } from '../../../../utils/geometry';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';

export const getGeometriesIndexSelector = createCachedSelector(
  [computeSeriesGeometriesSelector],
  (geometries): Map<any, IndexedGeometry[]> => {
    return geometries.geometriesIndex;
  },
)((state) => state.chartId);
