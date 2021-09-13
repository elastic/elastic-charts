/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const module = jest.requireActual('../color_library_wrappers.ts');

export const { defaultColor, transparentColor, defaultD3Color } = module;

export const validateColor = jest.fn(module.validateColor);
export const argsToRGB = jest.fn(module.argsToRGB);
export const argsToRGBString = jest.fn(module.argsToRGBString);
export const RGBtoString = jest.fn(module.RGBtoString);
