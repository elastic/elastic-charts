import { ScaleType, Scale } from '../../../utils/scales/scales';
import { ZeroAxisSpec, Rotation } from './specs';
import { GroupId } from '../../../utils/ids';
import { Dimensions } from '../../../utils/dimensions';

const getPoints = (y: number, chartDimensions: Dimensions, chartRotation: Rotation) => {
  switch (chartRotation) {
    case 0:
      return [0, y, chartDimensions.width, y];
    case 90:
      return [chartDimensions.width - y, 0, chartDimensions.width - y, chartDimensions.height];
    case 180:
      return [0, chartDimensions.height - y, chartDimensions.width, chartDimensions.height - y];
    case -90:
      return [y, 0, y, chartDimensions.height];
    default:
      return [0, y, chartDimensions.width, y];
  }
};

export const computeZeroAxes = (
  yScales: Map<GroupId, Scale>,
  chartDimensions: Dimensions,
  chartRotation: Rotation,
): ZeroAxisSpec[] => {
  const zeroAxes: ZeroAxisSpec[] = [];
  const ids = [...yScales.keys()];
  ids
    .filter((id) => {
      const entry = yScales && yScales.get(id);
      if (!entry || !entry.domain || !entry.type) return false;
      const [min, max] = entry.domain;
      return min < 0 && max > 0 && entry.type === ScaleType.Linear;
    })
    .forEach((id) => {
      const entry = yScales && yScales.get(id);
      const y = entry && entry.scale(0);
      if (y) {
        zeroAxes.push({
          groupId: id,
          points: getPoints(y, chartDimensions, chartRotation),
        });
      }
    });
  return zeroAxes;
};
