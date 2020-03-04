import createCachedSelector from 're-reselect';
import { partitionGeometries } from './geometries';
import { QuadViewModel } from '../../layout/types/viewmodel_types';
import { GlobalChartState } from '../../../../state/chart_state';

function getCurrentPointerPosition(state: GlobalChartState) {
  return state.interactions.pointer.current.position;
}

export const getPickedShapes = createCachedSelector(
  [partitionGeometries, getCurrentPointerPosition],
  (geoms, pointerPosition): Array<QuadViewModel> => {
    const picker = geoms.pickQuads;
    const diskCenter = geoms.diskCenter;
    const x = pointerPosition.x - diskCenter.x;
    const y = pointerPosition.y - diskCenter.y;
    return picker(x, y);
  },
)((state) => state.chartId);
