/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export const getDesiredTickCount = (cartesianHeight: number, fontSize: number, sparse: boolean) => {
  const desiredMaxTickCount = Math.floor(cartesianHeight / (3 * fontSize));
  return sparse ? 1 + Math.ceil(Math.pow(desiredMaxTickCount, 0.25)) : 1 + Math.ceil(Math.sqrt(desiredMaxTickCount));
};

/** @internal */
export type NumericScale = (n: number) => number;

/** @internal */
export const makeLinearScale = (
  domainFrom: number,
  domainTo: number,
  rangeFrom: number,
  rangeTo: number,
): NumericScale => {
  const domainExtent = domainTo - domainFrom;
  const rangeExtent = rangeTo - rangeFrom;
  const scale = rangeExtent / domainExtent;
  const offset = rangeFrom - scale * domainFrom;
  return (d: number) => offset + scale * d;
};
