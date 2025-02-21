/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Rotation } from '../../../../utils/common';
import type { GroupId } from '../../../../utils/ids';
import { isXDomain } from '../../utils/axis_utils';
import type { AxisSpec, YDomainRange } from '../../utils/specs';

/** @internal */
export function mergeYCustomDomainsByGroupId(
  axesSpecs: AxisSpec[],
  chartRotation: Rotation,
): Map<GroupId, YDomainRange> {
  const domainsByGroupId = new Map<GroupId, YDomainRange>();

  axesSpecs.forEach((spec: AxisSpec) => {
    const { id, groupId, domain } = spec;

    if (!domain) return;

    if (isXDomain(spec.position, chartRotation)) {
      throw new Error(`[Axis ${id}]: custom domain for xDomain should be defined in Settings`);
    }

    if (domain.min > domain.max) {
      throw new Error(`[Axis ${id}]: custom domain is invalid, min is greater than max`);
    }

    const prevGroupDomain = domainsByGroupId.get(groupId);

    if (prevGroupDomain) {
      const mergedDomain = {
        min: Math.min(
          Number.isFinite(domain.min) ? domain.min : Infinity,
          prevGroupDomain && Number.isFinite(prevGroupDomain.min) ? prevGroupDomain.min : Infinity,
        ),
        max: Math.max(
          Number.isFinite(domain.max) ? domain.max : -Infinity,
          prevGroupDomain && Number.isFinite(prevGroupDomain.max) ? prevGroupDomain.max : -Infinity,
        ),
      };

      if (Number.isFinite(mergedDomain.min) || Number.isFinite(mergedDomain.max)) {
        domainsByGroupId.set(groupId, mergedDomain);
      }
    } else {
      domainsByGroupId.set(groupId, domain);
    }
  });
  return domainsByGroupId;
}
