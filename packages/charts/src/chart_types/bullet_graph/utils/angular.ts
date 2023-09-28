/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TAU } from '../../../common/constants';
import { clamp } from '../../../utils/common';
import { Size } from '../../../utils/dimensions';
import { TARGET_SIZE } from '../renderer/canvas/constants';
import { BulletGraphSize } from '../spec';
import { GRAPH_PADDING } from '../theme';

const sizeAngles: Record<BulletGraphSize, { startAngle: number; endAngle: number }> = {
  [BulletGraphSize.half]: {
    startAngle: 1 * Math.PI,
    endAngle: 0,
  },
  [BulletGraphSize.twoThirds]: {
    startAngle: 1.25 * Math.PI,
    endAngle: -0.25 * Math.PI,
  },
  [BulletGraphSize.full]: {
    startAngle: 1.5 * Math.PI,
    endAngle: -0.5 * Math.PI,
  },
};

/** @internal */
export function getAnglesBySize(size: BulletGraphSize, reverse: boolean): [startAngle: number, endAngle: number] {
  const angles = sizeAngles[size] ?? sizeAngles[BulletGraphSize.twoThirds]!;
  // Negative angles used to match current radian pattern
  const startAngle = -angles.startAngle;
  // limit endAngle to startAngle +/- 2π
  const endAngle = clamp(-angles.endAngle, startAngle - TAU, startAngle + TAU);
  if (reverse) return [endAngle, startAngle];
  return [startAngle, endAngle];
}

const heightModifiers: Record<BulletGraphSize, number> = {
  [BulletGraphSize.half]: 0.5,
  [BulletGraphSize.twoThirds]: 0.86, // approximated to account for flare of arc stroke at the bottom
  [BulletGraphSize.full]: 1,
};

/** @internal */
export function getAngledChartSizing(
  graphSize: Size,
  size: BulletGraphSize,
): { maxWidth: number; maxHeight: number; radius: number } {
  const heightModifier = heightModifiers[size] ?? 1;
  const maxWidth = graphSize.width - GRAPH_PADDING.left - GRAPH_PADDING.right;
  const maxHeight = graphSize.height - GRAPH_PADDING.top - GRAPH_PADDING.bottom;
  const modifiedHeight = maxHeight / heightModifier;
  const radius = Math.min(maxWidth, modifiedHeight) / 2 - TARGET_SIZE / 2;

  return { maxWidth, maxHeight: modifiedHeight, radius };
}
