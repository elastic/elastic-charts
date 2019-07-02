import { Datum } from '../series/specs';
import { RawDataSeriesDatum } from '../series/series';

export type AccessorFn<T = Datum> = (cleanedDatum: T, datum?: any) => any;
export type AccessorString = string | number;
export type Accessor = AccessorString;

/**
 * Return an accessor function using the accessor passed as argument
 * @param accessor the spec accessor
 */
export function getAccessorFn(accessor: Accessor): AccessorFn {
  if (typeof accessor === 'string' || typeof accessor === 'number') {
    return (datum: Datum) => datum[accessor];
  }
  if (typeof accessor === 'function') {
    return accessor;
  }
  throw new Error('Accessor must be a string or a function');
}

/**
 * Get array of values that from accessors
 */
export function getAccessorValues(datum: Datum, accessors: (Accessor | AccessorFn<RawDataSeriesDatum>)[] = []): any[] {
  return accessors
    .map((accessor) => (typeof accessor === 'function' ? accessor(datum, datum.datum) : datum[accessor]))
    .filter((value) => value !== undefined && value !== null);
}
