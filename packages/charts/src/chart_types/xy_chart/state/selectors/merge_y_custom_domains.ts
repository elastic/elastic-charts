/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Rotation } from '../../../../utils/common';
import { GroupId } from '../../../../utils/ids';
import { isBounded, isCompleteBound, isLowerBound, isUpperBound } from '../../utils/axis_type_utils';
import { isXDomain } from '../../utils/axis_utils';
import { AxisSpec, YDomainRange } from '../../utils/specs';

/** @internal */
export function mergeYCustomDomainsByGroupId(
  axesSpecs: AxisSpec[],
  chartRotation: Rotation,
): Map<GroupId, YDomainRange> {
  const domainsByGroupId = new Map<GroupId, YDomainRange>();

  axesSpecs.forEach((spec: AxisSpec) => {
    const { id, groupId, domain } = spec;

    if (!domain) {
      return;
    }

    if (isXDomain(spec.position, chartRotation)) {
      const errorMessage = `[Axis ${id}]: custom domain for xDomain should be defined in Settings`;
      throw new Error(errorMessage);
    }

    if (isCompleteBound(domain) && domain.min > domain.max) {
      const errorMessage = `[Axis ${id}]: custom domain is invalid, min is greater than max`;
      throw new Error(errorMessage);
    }

    const prevGroupDomain = domainsByGroupId.get(groupId);

    if (prevGroupDomain) {
      const prevDomain = prevGroupDomain;
      const prevMin = isLowerBound(prevDomain) ? prevDomain.min : undefined;
      const prevMax = isUpperBound(prevDomain) ? prevDomain.max : undefined;

      let max = prevMax;
      let min = prevMin;

      if (isCompleteBound(domain)) {
        min = prevMin === undefined ? domain.min : Math.min(domain.min, prevMin);
        max = prevMax === undefined ? domain.max : Math.max(domain.max, prevMax);
      } else if (isLowerBound(domain)) {
        min = prevMin === undefined ? domain.min : Math.min(domain.min, prevMin);
      } else if (isUpperBound(domain)) {
        max = prevMax === undefined ? domain.max : Math.max(domain.max, prevMax);
      }

      const mergedDomain = {
        min,
        max,
      };

      if (isBounded(mergedDomain)) {
        domainsByGroupId.set(groupId, mergedDomain);
      }
    } else {
      domainsByGroupId.set(groupId, domain);
    }
  });
  return domainsByGroupId;
}
