/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const module = jest.requireActual('../common.ts');

/** @internal */
export const { ColorVariant, Position } = module;

/** @internal */
export const identity = jest.fn(module.identity);
/** @internal */
export const compareByValueAsc = jest.fn(module.compareByValueAsc);
/** @internal */
export const clamp = jest.fn(module.clamp);
/** @internal */
export const getColorFromVariant = jest.fn(module.getColorFromVariant);
/** @internal */
export const htmlIdGenerator = jest.fn(module.htmlIdGenerator);
/** @internal */
export const getPartialValue = jest.fn(module.getPartialValue);
/** @internal */
export const getAllKeys = jest.fn(module.getAllKeys);
/** @internal */
export const hasPartialObjectToMerge = jest.fn(module.hasPartialObjectToMerge);
/** @internal */
export const shallowClone = jest.fn(module.shallowClone);
/** @internal */
export const mergePartial = jest.fn(module.mergePartial);
/** @internal */
export const isNumberArray = jest.fn(module.isNumberArray);
/** @internal */
export const getUniqueValues = jest.fn(module.getUniqueValues);
