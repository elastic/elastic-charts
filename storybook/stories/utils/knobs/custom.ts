/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, array, number, optionsKnob, boolean } from '@storybook/addon-knobs';
import {
  OptionsTypeKnobSingleValue,
  OptionsTypeKnobValue,
  OptionsTypeOptionsProp,
} from '@storybook/addon-knobs/dist/components/types';
import { OptionsKnobOptionsDisplay } from '@storybook/addon-knobs/dist/components/types/Options';

import { isFiniteNumber } from '@elastic/charts/src/utils/common';

/**
 * Fix default storybook behavior that does not correctly parse numbers/strings in arrays
 */
export function getArrayKnob(
  name: string,
  values: (string | number)[] | ReadonlyArray<string | number>,
  separator?: string,
  group?: string,
): (string | number)[] {
  const stringifiedValues = values.map<string>((d) => `${d}`);
  return array(name, stringifiedValues, separator, group).map<string | number>((value: string) =>
    Number.isFinite(parseFloat(value)) ? parseFloat(value) : value,
  );
}

/**
 * Fix default storybook behavior that does not correctly parse numbers/strings in arrays
 */
export function getNumbersArrayKnob<T extends number>(
  name: string,
  values: T[],
  separator?: string,
  group?: string,
): T[] {
  const stringifiedValues = values.map<string>((d) => `${d}`);
  return array(name, stringifiedValues, separator, group).map(parseFloat).filter(isFiniteNumber) as T[];
}

export const getPositiveNumberKnob = (name: string, value: number, group?: string) =>
  number(name, value, { min: 0 }, group);

export function getToggledNumberKnob<T>(initEnabled: boolean, fallbackValue: T) {
  return (...[name, initialValue, options, group]: Parameters<typeof number>) => {
    const enabled = boolean(`${name} - enabled`, initEnabled, group);
    const value = number(name, initialValue, options, group);
    return enabled ? value : fallbackValue;
  };
}

/**
 * Treats select option values as numbers
 */
export const getNumberSelectKnob = <T extends number>(
  name: string,
  options: { [s: string]: T },
  value: T,
  group?: string,
): T => (parseInt(select<T | string>(name, options, value, group) as string, 10) as T) || value;

/**
 * Fix default storybook behavior which,
 * throws from when values array becomes empty :(
 */
export function getMultiSelectKnob<T extends OptionsTypeKnobSingleValue>(
  name: string,
  valuesObj: OptionsTypeOptionsProp<T>,
  value: OptionsTypeKnobValue<T>,
  display: OptionsKnobOptionsDisplay = 'multi-select',
  group?: string,
): T[] {
  const knob = optionsKnob<T>(
    name,
    valuesObj,
    value,
    {
      display,
    },
    group,
  );

  if (Array.isArray(knob)) return knob as T[];
  if (typeof knob === 'string') return knob.split(/\s*,\s*/) as T[];
  if (typeof knob === 'number') return [knob] as T[];
  return !knob ? [] : knob;
}
