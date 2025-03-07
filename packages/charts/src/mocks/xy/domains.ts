/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { XDomain, YDomain } from '../../chart_types/xy_chart/domains/types';
import {
  getXNiceFromSpec,
  getXScaleTypeFromSpec,
  getYNiceFromSpec,
  getYScaleTypeFromSpec,
} from '../../chart_types/xy_chart/scales/get_api_scales';
import { X_SCALE_DEFAULT, Y_SCALE_DEFAULT } from '../../chart_types/xy_chart/scales/scale_defaults';
import type { XScaleType } from '../../chart_types/xy_chart/utils/specs';
import { DEFAULT_GLOBAL_ID } from '../../chart_types/xy_chart/utils/specs';
import type { ScaleContinuousType } from '../../scales';
import { ScaleType } from '../../scales/constants';
import type { RecursivePartial } from '../../utils/common';
import { mergePartial } from '../../utils/common';

/** @internal */
export class MockXDomain {
  private static readonly base: XDomain = {
    ...X_SCALE_DEFAULT,
    isBandScale: X_SCALE_DEFAULT.type !== ScaleType.Ordinal,
    minInterval: 0,
    timeZone: 'local',
    domain: [0, 1],
    dataDomain: [0, 1],
  };

  static default(partial?: RecursivePartial<XDomain>) {
    return mergePartial<XDomain>(MockXDomain.base, partial);
  }

  static fromScaleType(scaleType: XScaleType, partial?: RecursivePartial<XDomain>) {
    return mergePartial<XDomain>(MockXDomain.base, partial, {}, [
      { type: getXScaleTypeFromSpec(scaleType), nice: getXNiceFromSpec() },
    ]);
  }
}

/** @internal */
export class MockYDomain {
  private static readonly base: YDomain = {
    ...Y_SCALE_DEFAULT,
    isBandScale: false,
    groupId: DEFAULT_GLOBAL_ID,
    domain: [0, 1],
  };

  static default(partial?: RecursivePartial<YDomain>) {
    return mergePartial<YDomain>(MockYDomain.base, partial);
  }

  static fromScaleType(scaleType: ScaleContinuousType, partial?: RecursivePartial<YDomain>) {
    return mergePartial<YDomain>(MockYDomain.base, partial, {}, [
      { type: getYScaleTypeFromSpec(scaleType), nice: getYNiceFromSpec() },
    ]);
  }
}
