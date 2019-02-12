import { Datum } from '../../lib/series/specs';
import { Accessor } from '../../lib/utils/accessor';

export type FitFunction = (
  array: Datum[],
  accessor: Accessor,
  i: number,
  defaultValue?: any,
) => Datum | null;

export const lookahead: FitFunction = (array: Datum[], accessor: Accessor, i: number) => {
  const nonNull = array.slice(i).find((d) => d[accessor] !== null);
  if (nonNull) {
    return nonNull[accessor];
  }
  return null;
};
export const none: FitFunction = (
  array: Datum[],
  accessor: Accessor,
  i: number,
  defaultValue: any = null,
) => {
  return defaultValue;
};
export function average(array: Datum[], accessor: Accessor, i: number) {
  return null;
}
export function linearScale(array: Datum[], accessor: Accessor, i: number) {
  return null;
}
export function explicitValue(array: Datum[], accessor: Accessor, i: number) {
  return null;
}
export const FittingFunctions = {
  Lookahead: lookahead,
  None: none,
  Average: average,
  LinearScale: linearScale,
  ExplicitValue: explicitValue,
};
/**
 * Use the last non null value before that
 * @param array
 */
export function fitNullValues(
  array: Datum[],
  xAccessor: Accessor,
  yAccessors: Accessor[],
  fitFunction: FitFunction,
  defaultValue?: any,
) {
  let i = 0;
  const length = array.length;
  let accessorCount = 0;
  const accessorCountLength = yAccessors.length;
  const output = [];
  for (; i < length; i++) {
    const currentDatum = array[i];
    if (currentDatum[xAccessor] === null) {
      // skip null x values;
      continue;
    }
    const fittedDatum = Array.isArray(currentDatum)
      ? currentDatum.slice()
      : {
          ...currentDatum,
        };
    let skipCount = 0;
    for (accessorCount = 0; accessorCount < accessorCountLength; accessorCount++) {
      const accessor = yAccessors[accessorCount];
      if (fittedDatum[accessor] === null) {
        const value = fitFunction(array, accessor, i, defaultValue);
        console.log(array, value, fitFunction !== none);
        if (value === null && fitFunction !== none) {
          console.log('skip');
          skipCount++;
          continue;
        }
        fittedDatum[accessor] = value;
      }
    }
    console.log({ skipCount, accessorCountLength });
    if (skipCount !== accessorCountLength) {
      output.push(fittedDatum);
    }
  }
  return output;
}
