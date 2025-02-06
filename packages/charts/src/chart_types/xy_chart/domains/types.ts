/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleContinuousType, LogScaleOptions } from '../../../scales';
import { OrdinalDomain, ContinuousDomain } from '../../../utils/domain';
import { GroupId } from '../../../utils/ids';
import { XScaleType } from '../utils/specs';

/** @internal */
export type XDomain = Pick<LogScaleOptions, 'logBase'> & {
  type: XScaleType;
  nice: boolean;
  /* if the scale needs to be a band scale: used when displaying bars */
  isBandScale: boolean;
  /* the minimum interval of the scale (for time, in milliseconds) if not-ordinal band-scale */
  minInterval: number;
  /** the configured timezone in the specs or the fallback to the browser local timezone */
  timeZone: string;
  domain: OrdinalDomain | ContinuousDomain;
  dataDomain: OrdinalDomain | ContinuousDomain;
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
