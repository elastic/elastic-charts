/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleContinuousType } from '../../../scales';
import { LogScaleOptions } from '../../../scales/scale_continuous';
import { OrdinalDomain, ContinuousDomain } from '../../../utils/domain';
import { GroupId } from '../../../utils/ids';
import { XScaleType } from '../utils/specs';

/** @internal */
export type XDomain = Pick<LogScaleOptions, 'logBase'> & {
  type: XScaleType;
  nice: boolean;
  /* if the scale needs to be a band scale: used when displaying bars */
  isBandScale: boolean;
  /* the minimum interval of the scale if not-ordinal band-scale */
  minInterval: number;
  /** if x domain is time, we should also specify the timezone */
  timeZone?: string;
  domain: OrdinalDomain | ContinuousDomain;
  desiredTickCount: number;
};

/** @internal */
export type YDomain = LogScaleOptions & {
  type: ScaleContinuousType;
  nice: boolean;
  isBandScale: false;
  groupId: GroupId;
  domain: ContinuousDomain;
  desiredTickCount: number;
  domainPixelPadding?: number;
  constrainDomainPadding?: boolean;
};
