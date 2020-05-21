/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License. */

const module = jest.requireActual('../color_library_wrappers.ts');

export const defaultColor = module.defaultColor;
export const transparentColor = module.transparentColor;
export const defaultD3Color = module.defaultD3Color;

export const stringToRGB = jest.fn(module.stringToRGB);
export const validateColor = jest.fn(module.validateColor);
export const argsToRGB = jest.fn(module.argsToRGB);
export const argsToRGBString = jest.fn(module.argsToRGBString);
export const RGBtoString = jest.fn(module.RGBtoString);
