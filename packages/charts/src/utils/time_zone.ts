/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// the 'local' timeZone is a tech debt that we keep in place until Kibana hasn't switch to Intl for timezones
const DEFAULT_TZ = 'local';

const isValidTimeZone = (timeZone: string): boolean => {
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
export const getTimeZone = (specs: { timeZone?: string }[]): string =>
  specs.find((s) => s.timeZone)?.timeZone?.toLowerCase() ?? DEFAULT_TZ; // second coalescing is TS 4.8.3 appeasement

/** @internal */
export const validatedTimeZone = (specifiedTimeZone?: string) =>
  specifiedTimeZone === 'local' || !specifiedTimeZone || !isValidTimeZone(specifiedTimeZone)
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : specifiedTimeZone;
