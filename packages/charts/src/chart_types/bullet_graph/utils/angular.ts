/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TAU } from '../../../common/constants';
import { clamp } from '../../../utils/common';
import type { Size } from '../../../utils/dimensions';
import { TARGET_SIZE } from '../renderer/canvas/constants';
import { BulletSubtype } from '../spec';
import { GRAPH_PADDING } from '../theme';

type AngularBulletSubtypes = Extract<BulletSubtype, 'circle' | 'half-circle' | 'two-thirds-circle'>;

const sizeAngles: Record<AngularBulletSubtypes, { startAngle: number; endAngle: number }> = {
  [BulletSubtype.halfCircle]: {
    startAngle: 1 * Math.PI,
    endAngle: 0,
  },
  [BulletSubtype.twoThirdsCircle]: {
    startAngle: 1.25 * Math.PI,
    endAngle: -0.25 * Math.PI,
  },
  [BulletSubtype.circle]: {
    startAngle: 1.5 * Math.PI,
    endAngle: -0.5 * Math.PI,
  },
};

/** @internal */
export function getAnglesBySize(subtype: BulletSubtype): [startAngle: number, endAngle: number] {
  if (subtype === BulletSubtype.vertical || subtype === BulletSubtype.horizontal) {
    throw new Error('Attempting to retrieve angle size from horizontal/vertical bullet');
  }
  const angles = sizeAngles[subtype] ?? sizeAngles[BulletSubtype.twoThirdsCircle];
  // Negative angles used to match current radian pattern
  const startAngle = -angles.startAngle;
  // limit endAngle to startAngle +/- 2π
  const endAngle = clamp(-angles.endAngle, startAngle - TAU, startAngle + TAU);
  return [startAngle, endAngle];
}

const heightModifiers: Record<AngularBulletSubtypes, number> = {
  [BulletSubtype.halfCircle]: 0.5,
  [BulletSubtype.twoThirdsCircle]: 0.86, // approximated to account for flare of arc stroke at the bottom
  [BulletSubtype.circle]: 1,
};

/** @internal */
export function getAngledChartSizing(
  graphSize: Size,
  subtype: BulletSubtype,
): { maxWidth: number; maxHeight: number; radius: number } {
  if (subtype === BulletSubtype.vertical || subtype === BulletSubtype.horizontal) {
    throw new Error('Attempting to retrieve angle size from horizontal/vertical bullet');
  }
  const heightModifier = heightModifiers[subtype] ?? 1;
  const maxWidth = graphSize.width - GRAPH_PADDING.left - GRAPH_PADDING.right;
  const maxHeight = graphSize.height - GRAPH_PADDING.top - GRAPH_PADDING.bottom;
  const modifiedHeight = maxHeight / heightModifier;
  const radius = Math.min(maxWidth, modifiedHeight) / 2 - TARGET_SIZE / 2;

  return { maxWidth, maxHeight: modifiedHeight, radius };
}
