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
      throw new Error(`[Axis ${id}]: custom domain for xDomain should be defined in Settings`);
    }

    if (isCompleteBound(domain) && domain.min > domain.max) {
      throw new Error(`[Axis ${id}]: custom domain is invalid, min is greater than max`);
    }

    const prevGroupDomain = domainsByGroupId.get(groupId);

    if (prevGroupDomain) {
      const min = Math.min(
        ...(isLowerBound(domain) ? [domain.min] : []),
        ...(prevGroupDomain && isLowerBound(prevGroupDomain) ? [prevGroupDomain.min] : []),
      );
      const max = Math.max(
        ...(isUpperBound(domain) ? [domain.max] : []),
        ...(prevGroupDomain && isUpperBound(prevGroupDomain) ? [prevGroupDomain.max] : []),
      );

      const mergedDomain = {
        min: Number.isFinite(min) ? min : undefined,
        max: Number.isFinite(max) ? max : undefined,
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
