/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BasicSeriesSpec, DEFAULT_GLOBAL_ID, Spec } from '../../../../specs';
import { Rotation } from '../../../../utils/common';
import { GroupId } from '../../../../utils/ids';
import { isHorizontalAxis, isVerticalAxis } from '../../utils/axis_type_utils';
import { isXDomain } from '../../utils/axis_utils';
import { AxisSpec } from '../../utils/specs';
import { isHorizontalRotation, isVerticalRotation } from './common';

/** @internal */
export function getSpecsById<T extends Spec>(specs: T[], id: string): T | undefined {
  return specs.find((spec) => spec.id === id);
}

/** @internal */
export function getAxesSpecForSpecId(axesSpecs: AxisSpec[], groupId: GroupId, chartRotation: Rotation = 0) {
  return axesSpecs.reduce<{ xAxis?: AxisSpec; yAxis?: AxisSpec }>((result, spec) => {
    if (
      spec.groupId === groupId &&
      (isXDomain(spec.position, chartRotation) || (isVerticalAxis(spec.position) && isVerticalRotation(chartRotation)))
    )
      result.xAxis = spec;
    else if (
      spec.groupId === groupId &&
      ((isVerticalAxis(spec.position) && isHorizontalRotation(chartRotation)) ||
        (isHorizontalAxis(spec.position) && isVerticalRotation(chartRotation)))
    )
      result.yAxis = spec;
    return result;
  }, {});
}

/** @internal */
export function getSpecDomainGroupId(spec: BasicSeriesSpec): string {
  if (!spec.useDefaultGroupDomain) {
    return spec.groupId;
  }
  return typeof spec.useDefaultGroupDomain === 'boolean' ? DEFAULT_GLOBAL_ID : spec.useDefaultGroupDomain;
}
