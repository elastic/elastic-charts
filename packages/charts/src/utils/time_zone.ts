/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const isValidTimeZone = (timeZone?: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`The supplied timeZone ${timeZone} does not exist. The default time zone will be used.`);
    // eslint-disable-next-line no-console
    console.error(error);
    return false;
  }
};

/** @internal */
export const getValidatedTimeZone = (specifiedTimeZone?: string): string =>
  isValidTimeZone(specifiedTimeZone) ? specifiedTimeZone ?? '' : Intl.DateTimeFormat().resolvedOptions().timeZone;

/** @internal */
export const getZoneFromSpecs = (specs: { timeZone?: string }[]): string => {
  const allValidTimezones = new Set<string>(specs.map((s) => getValidatedTimeZone(s.timeZone ?? '')));
  return new Set(allValidTimezones).size === 1
    ? allValidTimezones.values().next().value
    : Intl.DateTimeFormat().resolvedOptions().timeZone;
};
