export type ChartSizeArray = [number | string | undefined, number | string | undefined];
export interface ChartSizeObject {
  width?: number | string;
  height?: number | string;
}

export type ChartSize = number | string | ChartSizeArray | ChartSizeObject;

function isSizeArray(size: ChartSize): size is ChartSizeArray {
  return Array.isArray(size);
}
function isSizeObject(size: ChartSize): size is ChartSizeObject {
  return !Array.isArray(size) && typeof size === 'object';
}

export function getChartSize(size: ChartSize) {
  if (isSizeArray(size)) {
    return {
      width: size[0] === undefined ? '100%' : size[0],
      height: size[1] === undefined ? '100%' : size[1],
    };
  }
  if (isSizeObject(size)) {
    return {
      width: size.width === undefined ? '100%' : size.width,
      height: size.height === undefined ? '100%' : size.height,
    };
  }
  const sameSize = size === undefined ? '100%' : size;
  return {
    width: sameSize,
    height: sameSize,
  };
}
