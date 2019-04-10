import { RawDataSeries } from './series';

/**
 * Map each y value from a RawDataSeries on it's specific x value into,
 * ordering the stack based on the dataseries index.
 * @param dataseries
 */
export function getYValueStackMap(dataseries: RawDataSeries[]): Map<any, number[]> {
  const stackMap = new Map<any, number[]>();
  dataseries.forEach((ds, index) => {
    ds.data.forEach((datum) => {
      const stack = stackMap.get(datum.x) || new Array(dataseries.length).fill(0);
      stack[index] = datum.y1;
      stackMap.set(datum.x, stack);
    });
  });
  return stackMap;
}

/**
 * For each key of the yValueStackMap, it stacks the values one after the other,
 * summing the previous value to the next one.
 * @param yValueStackMap
 * @param scaleToExtent
 */
export function computeYStackedMapValues(
  yValueStackMap: Map<any, number[]>,
  scaleToExtent: boolean,
): Map<any, number[]> {
  const stackedValues = new Map<any, number[]>();

  yValueStackMap.forEach((yStackArray, xValue) => {
    const stackArray = yStackArray.reduce(
      (stackedValue, currentValue, index) => {
        if (stackedValue.length === 0) {
          if (scaleToExtent) {
            return [currentValue, currentValue];
          }
          return [0, currentValue];
        }
        return [...stackedValue, stackedValue[index] + currentValue];
      },
      [] as number[],
    );
    stackedValues.set(xValue, stackArray);
  });
  return stackedValues;
}
