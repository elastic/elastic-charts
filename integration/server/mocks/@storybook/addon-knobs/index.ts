/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function getParams() {
  return new URL(window.location.toString()).searchParams;
}

function getKnobKey(name: string, groupId?: string) {
  return `knob-${name}${groupId !== undefined ? `_${groupId}` : ''}`;
}

export function boolean(name: string, dftValue: boolean, groupId?: string) {
  return Boolean(getParams().get(getKnobKey(name, groupId))) || dftValue;
}

export function number(name: string, dftValue: number, options?: any, groupId?: string) {
  const params = getParams();
  const key = getKnobKey(name, groupId);
  return Number.parseFloat(params.get(key) ?? `${dftValue}`);
}

export function radios(name: string, options: unknown, dftValue: string, groupId?: string) {
  return text(name, dftValue, groupId);
}

export function color(name: string, dftValue: string, groupId?: string) {
  return text(name, dftValue, groupId);
}

export function select(name: string, b: unknown, dftValue: string, groupId?: string) {
  return text(name, dftValue, groupId);
}

export function text(name: string, dftValue: string, groupId?: string) {
  const params = getParams();
  const key = getKnobKey(name, groupId);
  const value = params.get(key);
  // the # used for the color knob needs to be escaped on the URL and unescaped here
  return value === null ? dftValue : unescape(value);
}

export function array(name: string, dftValues: unknown[], options: any, groupId?: string) {
  const params = getParams();
  const values = [];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  for (const [key, value] of params) {
    if (key.startsWith(`${getKnobKey(name, groupId)}[`)) {
      values.push(value);
    }
  }
  if (values.length === 0) {
    return dftValues;
  }
  return values;
}

export function optionsKnob(name: string, values: unknown, dftValues: unknown[], options: any, groupId?: string) {
  return array(name, dftValues, options, groupId);
}

export function button() {
  // NOP
}
