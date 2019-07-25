import * as uuid from 'uuid';

export function identity<T>(value: T): T {
  return value;
}

export function compareByValueAsc(firstEl: number, secondEl: number): number {
  return firstEl - secondEl;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Can remove once we upgrade to TypesScript >= 3.5
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * This function returns a function to generate ids.
 * This can be used to generate unique, but predictable ids to pair labels
 * with their inputs. It takes an optional prefix as a parameter. If you don't
 * specify it, it generates a random id prefix. If you specify a custom prefix
 * it should begin with an letter to be HTML4 compliant.
 */
export function htmlIdGenerator(idPrefix?: string) {
  const prefix = idPrefix || `i${uuid.v1()}`;
  return (suffix?: string) => `${prefix}_${suffix || uuid.v1()}`;
}

/**
 * Replaces all properties on any type as optional, includes nested types
 *
 * example:
 * ```ts
 * interface Person {
 *  name: string;
 *  age?: number;
 *  spouse: Person;
 *  children: Person[];
 * }
 * type PartialPerson = RecursivePartial<Person>;
 * // results in
 * interface PartialPerson {
 *  name?: string;
 *  age?: number;
 *  spouse?: RecursivePartial<Person>;
 *  children?: RecursivePartial<Person>[]
 * }
 * ```
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends ReadonlyArray<infer U> // eslint-disable-line @typescript-eslint/array-type
    ? ReadonlyArray<RecursivePartial<U>> // eslint-disable-line @typescript-eslint/array-type
    : RecursivePartial<T[P]>
};

export interface MergeOptions {
  mergeOptionalPartialValues?: boolean;
}

/**
 * Merges values of a partial structure with a base structure.
 *
 * @param base structure to be duplicated, must have all props of `partial`
 * @param partial structure to override values from base
 *
 * @returns new base structure with updated partial values
 */
export function mergePartial<T>(base: T, partial?: RecursivePartial<T>, options: MergeOptions = {}): T {
  if (Array.isArray(base)) {
    return partial ? (partial as T) : base; // No nested array merging
  } else if (typeof base === 'object') {
    const baseClone = { ...base };

    if (partial && options.mergeOptionalPartialValues) {
      Object.keys(partial).forEach((key) => {
        if (!(key in baseClone)) {
          // @ts-ignore
          baseClone[key] = partial[key];
        }
      });
    }

    return Object.keys(base).reduce((newBase, key) => {
      // @ts-ignore
      newBase[key] = mergePartial(base[key], partial && partial[key], options);
      return newBase;
    }, baseClone);
  }

  return partial !== undefined ? (partial as T) : base;
}
