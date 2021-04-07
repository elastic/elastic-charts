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
 * under the License.
 */

import { ScaleContinuousType } from '../../../scales';
import { ScaleType } from '../../../scales/constants';
import { BasicSeriesSpec, XScaleType } from '../utils/specs';
import { X_SCALE_DEFAULT, Y_SCALE_DEFAULT } from './scale_defaults';
import { APIScale } from './types';

/** @internal */
export function getXAPIScale(scaleType: BasicSeriesSpec['xScaleType']): APIScale<XScaleType> {
  return getDefaultAPIScale<XScaleType>(scaleType, { type: X_SCALE_DEFAULT.type, nice: X_SCALE_DEFAULT.nice });
}

/** @internal */
export function getYAPIScale(scaleType: BasicSeriesSpec['yScaleType']): APIScale<ScaleContinuousType> {
  return getDefaultAPIScale(scaleType, { type: Y_SCALE_DEFAULT.type, nice: Y_SCALE_DEFAULT.nice });
}

/** @internal */
export function getDefaultAPIScale<T extends ScaleType>(type: T | APIScale<T>, defaults: APIScale<T>): APIScale<T> {
  if (typeof type === 'object') {
    return type;
  }
  return {
    ...defaults,
    type,
  };
}
