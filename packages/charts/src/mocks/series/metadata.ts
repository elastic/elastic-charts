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

import { DatumMetadata, getDatumNumericProperty } from '../../chart_types/xy_chart/data/validate_datum';
import { isNil, mergePartial } from '../../utils/common';

/** @internal */
export class MockDatumMetadata {
  private static readonly baseNumeric: DatumMetadata<number> = {
    validated: 0,
    value: 0,
    isFilled: false,
    isNil: false,
    hasAccessor: true,
  };

  private static readonly basePrimitive: DatumMetadata<number | string> = {
    validated: 0,
    value: 0,
    isFilled: false,
    isNil: false,
    hasAccessor: true,
  };

  static numeric(partial?: Partial<DatumMetadata<number>>): DatumMetadata<number> {
    return mergePartial<DatumMetadata<number>>(MockDatumMetadata.baseNumeric, partial, {
      mergeOptionalPartialValues: true,
    });
  }

  static primitive(partial?: Partial<DatumMetadata<number | string>>): DatumMetadata<number | string> {
    return mergePartial<DatumMetadata<number | string>>(MockDatumMetadata.basePrimitive, partial, {
      mergeOptionalPartialValues: true,
    });
  }

  static simpleNumeric(value: any): DatumMetadata<number> {
    return getDatumNumericProperty([value], isNil(value) ? undefined : 0);
  }
}
