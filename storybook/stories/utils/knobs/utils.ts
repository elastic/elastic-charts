/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import type { SelectTypeKnobValue } from '@storybook/addon-knobs/dist/components/types';
import { kebabCase, startCase } from 'lodash';

import type { ExtendsNever } from '@elastic/charts/src/utils/common';

import { getNumberSelectKnob } from './custom';

export type KnobFromEnumBaseOptions<AU extends boolean> = {
  group?: string;
  allowUndefined?: AU;
  undefinedLabel?: string;
};

export type KnobFromEnumOptions<
  O extends Record<string, unknown>,
  AU extends boolean = false,
  I extends keyof O = never,
  E extends keyof O = never,
> = KnobFromEnumBaseOptions<AU> &
  (
    | {
        include?: I[];
        exclude?: never;
      }
    | {
        include?: never;
        exclude?: E[];
      }
  );

/**
 * Generates storybook knobs from const enum
 * must be an enum type, types are not inferable from object literals
 *
 * There are a few ts ignores inside the function to force type alignment
 * All exterior input and output types are correctly aligned
 */
export const getKnobFromEnum = <
  O extends Record<keyof O, SelectTypeKnobValue>,
  T extends O[keyof O],
  D extends ExtendsNever<I, O[Exclude<keyof O, E>] | AUR, O[Extract<keyof O, I>] | AUR>,
  AU extends boolean = false,
  I extends keyof O = never,
  E extends keyof O = never,
  AUR = AU extends true ? undefined : never,
>(
  name: string,
  enumObject: O,
  defaultValue: D,
  { group, allowUndefined, undefinedLabel, ...rest }: KnobFromEnumOptions<O, AU, I, E> = {},
): ExtendsNever<I, O[Exclude<keyof O, E>] | AUR, O[Extract<keyof O, I>] | AUR> => {
  // @ts-ignore - force complex typings
  const options = (Object.entries<T>(enumObject) as [keyof O, T][])
    // @ts-ignore - skip key type checks
    .filter('include' in rest ? ([k]) => rest.include!.includes(k) : () => true)
    // @ts-ignore - skip key type checks
    .filter('exclude' in rest ? ([k]) => !rest.exclude!.includes(k) : () => true)
    .reduce<O>(
      (acc, [key, value]) => {
        // @ts-ignore - override key casing
        acc[startCase(kebabCase(key))] = value;
        return acc;
      },
      (allowUndefined ? { [undefinedLabel || 'Undefined']: undefined } : ({} as unknown)) as O,
    );

  const hasOnlyNumbers = Object.values(options).every((v) => typeof v === 'number');
  const selectFunction = hasOnlyNumbers ? getNumberSelectKnob : select;
  // @ts-ignore - force complex typings
  const value = selectFunction<T>(name, options, defaultValue, group);

  if (value === '' || value === undefined) {
    // @ts-ignore - optional undefined return
    if (allowUndefined) return undefined;

    throw new Error(`Unable to get determine knob value [${name}]`); // likely due to bad or old url params
  }

  // @ts-ignore - force type alignment
  return value;
};

/**
 * Generates reusable generic knob function from enum
 */
export function getKnobsFnFromEnum<
  O extends Record<keyof O, SelectTypeKnobValue>,
  T extends O[keyof O],
  DF extends T | UAUR,
  UAU extends boolean = never,
  UAUR = UAU extends true ? undefined : never,
>(
  enumObject: O,
  defaultName: string,
  fallbackDefaultValue: DF,
  optionOverrides: Pick<KnobFromEnumBaseOptions<UAU>, 'allowUndefined' | 'undefinedLabel'> = {},
) {
  return <
    D extends ExtendsNever<I, O[Exclude<keyof O, E>] | AUR, O[Extract<keyof O, I>] | AUR>,
    AU extends boolean = UAU,
    I extends keyof O = never,
    E extends keyof O = never,
    AUR = AU extends true ? undefined : never,
  >(
    name = defaultName,
    // @ts-ignore - type always aligned
    defaultValue: D = fallbackDefaultValue,
    // @ts-ignore - type always aligned
    options: Omit<KnobFromEnumOptions<O, AU, I, E>, ExtendsNever<UAU, '', 'allowUndefined'>> = {},
    // @ts-ignore - type always aligned
  ) => getKnobFromEnum<O, T, D, AU, I, E, AUR>(name, enumObject, defaultValue, { ...options, ...optionOverrides });
}
