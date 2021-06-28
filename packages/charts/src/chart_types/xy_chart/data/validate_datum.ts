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

import { Accessor, AccessorFn } from '../../../utils/accessor';
import { Datum, isNil } from '../../../utils/common';

/** @public */
export interface DatumMetadata<T> {
  validated: T;
  hasAccessor: boolean;
  isNil: boolean;
  isFilled: boolean;
  value: any;
}
/** @internal */
export function getDatumNumericProperty(datum: Datum, accessor?: Accessor | AccessorFn): DatumMetadata<number> {
  const value = !isNil(accessor) ? getValueViaAccessor(datum, accessor) : undefined;
  return {
    validated: parseFloat(value),
    hasAccessor: !isNil(accessor),
    isNil: isNil(value),
    isFilled: false,
    value,
  };
}

/**
 * Helper function to get accessor value from string, number or function
 * @internal
 */
function getValueViaAccessor(datum: Datum, accessor: Accessor | AccessorFn) {
  if (typeof accessor === 'function') {
    return accessor(datum);
  }

  return datum[accessor];
}
