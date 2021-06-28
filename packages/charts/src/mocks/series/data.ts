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

import { DataSeriesDatum } from '../../chart_types/xy_chart/utils/series';
import { MockDatumMetadata } from './metadata';

/** @internal */
export const fitFunctionData: DataSeriesDatum[] = [
  {
    x: 0,
    y1: NaN,
    y0: NaN,
    mark: NaN,
    datum: {
      x: 0,
      y: null,
    },
    metadata: {
      x: MockDatumMetadata.primitive({ value: 0, validated: 0 }),
      y1: MockDatumMetadata.simpleNumeric(NaN),
      y0: MockDatumMetadata.simpleNumeric(NaN),
      mark: MockDatumMetadata.simpleNumeric(NaN),
    },
  },
  {
    x: 1,
    y1: 3,
    y0: 0,
    mark: NaN,
    datum: {
      x: 1,
      y: 3,
    },
    metadata: {
      x: MockDatumMetadata.primitive({ value: 1, validated: 1 }),
      y1: MockDatumMetadata.simpleNumeric(3),
      y0: MockDatumMetadata.simpleNumeric(0),
      mark: MockDatumMetadata.simpleNumeric(NaN),
    },
  },
  {
    x: 2,
    y1: 5,
    y0: 0,
    mark: NaN,
    datum: {
      x: 2,
      y: 5,
    },
    metadata: {
      x: MockDatumMetadata.primitive({ value: 2, validated: 2 }),
      y1: MockDatumMetadata.simpleNumeric(5),
      y0: MockDatumMetadata.simpleNumeric(0),
      mark: MockDatumMetadata.simpleNumeric(NaN),
    },
  },
  {
    x: 3,
    y1: NaN,
    y0: NaN,
    mark: NaN,
    datum: {
      x: 3,
      y: null,
    },
    metadata: {
      x: MockDatumMetadata.primitive({ value: 3, validated: 3 }),
      y1: MockDatumMetadata.simpleNumeric(NaN),
      y0: MockDatumMetadata.simpleNumeric(NaN),
      mark: MockDatumMetadata.simpleNumeric(NaN),
    },
  },
  {
    x: 4,
    y1: 4,
    y0: 0,
    mark: NaN,
    datum: {
      x: 4,
      y: 4,
    },
    metadata: {
      x: MockDatumMetadata.primitive({ value: 4, validated: 4 }),
      y1: MockDatumMetadata.simpleNumeric(4),
      y0: MockDatumMetadata.simpleNumeric(0),
      mark: MockDatumMetadata.simpleNumeric(NaN),
    },
  },
  {
    x: 5,
    y1: NaN,
    y0: NaN,
    mark: NaN,
    datum: {
      x: 5,
      y: null,
    },
    metadata: {
      x: MockDatumMetadata.primitive({ value: 5, validated: 5 }),
      y1: MockDatumMetadata.simpleNumeric(NaN),
      y0: MockDatumMetadata.simpleNumeric(NaN),
      mark: MockDatumMetadata.simpleNumeric(NaN),
    },
  },
  {
    x: 6,
    y1: 5,
    y0: 0,
    mark: NaN,
    datum: {
      x: 6,
      y: 5,
    },
    metadata: {
      x: MockDatumMetadata.primitive({ value: 6, validated: 6 }),
      y1: MockDatumMetadata.simpleNumeric(5),
      y0: MockDatumMetadata.simpleNumeric(0),
      mark: MockDatumMetadata.simpleNumeric(NaN),
    },
  },
  {
    x: 7,
    y1: 6,
    y0: 0,
    mark: NaN,
    datum: {
      x: 7,
      y: 6,
    },
    metadata: {
      x: MockDatumMetadata.primitive({ value: 7, validated: 7 }),
      y1: MockDatumMetadata.simpleNumeric(6),
      y0: MockDatumMetadata.simpleNumeric(0),
      mark: MockDatumMetadata.simpleNumeric(NaN),
    },
  },
  {
    x: 8,
    y1: NaN,
    y0: NaN,
    mark: NaN,
    datum: {
      x: 8,
      y: null,
    },
    metadata: {
      x: MockDatumMetadata.primitive({ value: 8, validated: 8 }),
      y1: MockDatumMetadata.simpleNumeric(NaN),
      y0: MockDatumMetadata.simpleNumeric(NaN),
      mark: MockDatumMetadata.simpleNumeric(NaN),
    },
  },
  {
    x: 9,
    y1: NaN,
    y0: NaN,
    mark: NaN,
    datum: {
      x: 9,
      y: null,
    },
    metadata: {
      x: MockDatumMetadata.primitive({ value: 9, validated: 9 }),
      y1: MockDatumMetadata.simpleNumeric(NaN),
      y0: MockDatumMetadata.simpleNumeric(NaN),
      mark: MockDatumMetadata.simpleNumeric(NaN),
    },
  },
  {
    x: 10,
    y1: NaN,
    y0: NaN,
    mark: NaN,
    datum: {
      x: 10,
      y: null,
    },
    metadata: {
      x: MockDatumMetadata.primitive({ value: 10, validated: 10 }),
      y1: MockDatumMetadata.simpleNumeric(NaN),
      y0: MockDatumMetadata.simpleNumeric(NaN),
      mark: MockDatumMetadata.simpleNumeric(NaN),
    },
  },
  {
    x: 11,
    y1: 12,
    y0: 0,
    mark: NaN,
    datum: {
      x: 11,
      y: 12,
    },
    metadata: {
      x: MockDatumMetadata.primitive({ value: 11, validated: 11 }),
      y1: MockDatumMetadata.simpleNumeric(12),
      y0: MockDatumMetadata.simpleNumeric(0),
      mark: MockDatumMetadata.simpleNumeric(NaN),
    },
  },
  {
    x: 12,
    y1: NaN,
    y0: NaN,
    mark: NaN,
    datum: {
      x: 12,
      y: null,
    },
    metadata: {
      x: MockDatumMetadata.primitive({ value: 12, validated: 12 }),
      y1: MockDatumMetadata.simpleNumeric(NaN),
      y0: MockDatumMetadata.simpleNumeric(NaN),
      mark: MockDatumMetadata.simpleNumeric(NaN),
    },
  },
];
