/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Position } from '../../../utils/common';
import { CompleteBoundedDomain, LowerBoundedDomain, UpperBoundedDomain, DomainRange } from './specs';

/** @internal */
export function isLowerBound(domain: Partial<CompleteBoundedDomain>): domain is LowerBoundedDomain {
  return domain.min !== undefined;
}

/** @internal */
export function isUpperBound(domain: Partial<CompleteBoundedDomain>): domain is UpperBoundedDomain {
  return domain.max !== undefined;
}

/** @internal */
export function isCompleteBound(domain: Partial<CompleteBoundedDomain>): domain is CompleteBoundedDomain {
  return domain.max !== undefined && domain.min !== undefined;
}

/** @internal */
export function isBounded(domain: Partial<CompleteBoundedDomain>): domain is DomainRange {
  return domain.max !== undefined || domain.min !== undefined;
}

/** @internal */
export function isVerticalAxis(axisPosition: Position): axisPosition is Extract<Position, 'left' | 'right'> {
  return axisPosition === Position.Left || axisPosition === Position.Right;
}

/** @internal */
export function isHorizontalAxis(axisPosition: Position): axisPosition is Extract<Position, 'top' | 'bottom'> {
  return axisPosition === Position.Top || axisPosition === Position.Bottom;
}

/** @internal */
export function isVerticalGrid(axisPosition: Position) {
  return isHorizontalAxis(axisPosition);
}

/** @internal */
export function isHorizontalGrid(axisPosition: Position) {
  return isVerticalAxis(axisPosition);
}
