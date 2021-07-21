/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BasicSeriesSpec, DEFAULT_GLOBAL_ID, Spec } from '../../../../specs';
import { GroupId } from '../../../../utils/ids';
import { isVerticalAxis } from '../../utils/axis_type_utils';
import { AxisSpec } from '../../utils/specs';

/** @internal */
export function getSpecsById<T extends Spec>(specs: T[], id: string): T | undefined {
  return specs.find((spec) => spec.id === id);
}

/** @internal */
export function getAxesSpecForSpecId(axesSpecs: AxisSpec[], groupId: GroupId) {
  let xAxis: AxisSpec | undefined;
  let yAxis: AxisSpec | undefined;
  // eslint-disable-next-line no-restricted-syntax
  for (const axisSpec of axesSpecs) {
    if (axisSpec.groupId !== groupId) {
      continue;
    }
    if (isVerticalAxis(axisSpec.position)) {
      yAxis = axisSpec;
    } else {
      xAxis = axisSpec;
    }
  }

  return {
    xAxis,
    yAxis,
  };
}

/** @internal */
export function getSpecDomainGroupId(spec: BasicSeriesSpec): string {
  if (!spec.useDefaultGroupDomain) {
    return spec.groupId;
  }
  return typeof spec.useDefaultGroupDomain === 'boolean' ? DEFAULT_GLOBAL_ID : spec.useDefaultGroupDomain;
}
