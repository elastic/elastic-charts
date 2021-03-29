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

/** @internal */
export interface ScaleConfig<T extends ScaleType> {
  type: T;
  nice: boolean;
}

/** @internal */
export function getXScaleConfig(scaleType: BasicSeriesSpec['xScaleType']): ScaleConfig<XScaleType> {
  return getScaleConfig<XScaleType>(scaleType, X_SCALE_DEFAULT);
}

/** @internal */
export function getYScaleConfig(scaleType: BasicSeriesSpec['yScaleType']): ScaleConfig<ScaleContinuousType> {
  return getScaleConfig(scaleType, Y_SCALE_DEFAULT);
}

/** @internal */
function getScaleConfig<T extends ScaleType>(scaleType: T | ScaleConfig<T>, defaults: ScaleConfig<T>): ScaleConfig<T> {
  if (typeof scaleType === 'object') {
    return scaleType;
  }
  return {
    ...defaults,
    type: scaleType,
  };
}
