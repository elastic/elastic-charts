import createCachedSelector from 're-reselect';
import { compareByValueAsc } from '../../../../utils/commons';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';

export const getGeometriesIndexKeysSelector = createCachedSelector(
  [computeSeriesGeometriesSelector],
  (seriesGeometries): any[] => {
    return [...seriesGeometries.geometriesIndex.keys()].sort(compareByValueAsc);
  },
)((state) => state.chartId);
