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
import { Domain } from '../../../utils/domain';
import { GroupId } from '../../../utils/ids';

export interface BaseDomain {
  scaleType: typeof ScaleType.Ordinal | ScaleContinuousType;
  domain: Domain;
  /* if the scale needs to be a band scale: used when displaying bars */
  isBandScale: boolean;
}

export type XDomain = BaseDomain & {
  type: 'xDomain';
  /* the minimum interval of the scale if not-ordinal band-scale */
  minInterval: number;
  /** if x domain is time, we should also specify the timezone */
  timeZone?: string;
};

export type YDomain = BaseDomain & {
  type: 'yDomain';
  isBandScale: false;
  scaleType: ScaleContinuousType;
  groupId: GroupId;
};
