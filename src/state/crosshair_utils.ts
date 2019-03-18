import { isOrdinalScale, ScaleBand } from '../lib/utils/scales/scale_band';
import { ScaleContinuous } from '../lib/utils/scales/scale_continuous';
import { Scale } from '../lib/utils/scales/scales';

export function getSnapPosition(value: string | number, scale: Scale, totalGroupCount: number = 1) {
  if (isOrdinalScale(scale)) {
    return getOrdinalSnapPosition(value, scale, totalGroupCount);
  } else {
    return getContinuousSnapPosition(value as number, scale as ScaleContinuous, totalGroupCount);
  }
}

function getOrdinalSnapPosition(value: string | number, scale: ScaleBand, totalGroupCount: number) {
  const halfBand = (scale.bandwidth * (totalGroupCount || 1)) / 2;
  const scaledValue = scale.scale(value);
  return {
    snappingPosition: scaledValue + halfBand,
    x: scaledValue,
    width: scale.bandwidth * (totalGroupCount || 1),
  };
}

function getContinuousSnapPosition(value: number, scale: ScaleContinuous, totalGroupCount: number) {
  if (scale.bandwidth > 0) {
    return {
      snappingPosition: scale.scale(value + scale.minInterval / 2),
      x: scale.scale(value),
      width: scale.bandwidth * (totalGroupCount || 1),
    };
  } else {
    return {
      snappingPosition: scale.scale(value),
      x: scale.scale(value),
      width: 1,
    };
  }
}
