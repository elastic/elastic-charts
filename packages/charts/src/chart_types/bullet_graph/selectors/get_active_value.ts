/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getBulletSpec } from './get_bullet_spec';
import { BulletPanelDimensions, getPanelDimensions } from './get_panel_dimensions';
import { TAU } from '../../../common/constants';
import { Radian } from '../../../common/geometry';
import { createCustomCachedSelector } from '../../../state/create_selector';
import { getActivePointerPosition } from '../../../state/selectors/get_active_pointer_position';
import { isBetween, isFiniteNumber, roundTo } from '../../../utils/common';
import { Range } from '../../../utils/domain';
import { Point } from '../../../utils/point';
import { BULLET_SIZE, HOVER_SLOP, TARGET_SIZE } from '../renderer/canvas/constants';
import { BulletGraphSpec, BulletGraphSubtype } from '../spec';
import { GRAPH_PADDING } from '../theme';
import { getAngledChartSizing } from '../utils/angular';

/** @internal */
export interface ActiveValueDetails {
  value: number;
  snapValue: number;
  color: string;
  pixelValue: number;
  rowIndex: number;
  columnIndex: number;
  panel: BulletPanelDimensions;
}

/** @internal */
export const getActiveValue = createCustomCachedSelector(
  [getActivePointerPosition, getPanelDimensions, getBulletSpec],
  (pointer, dimensions, spec): ActiveValueDetails | null => {
    if (!pointer) return null;
    const { x, y } = pointer;

    const rowIndex = Math.ceil(y / dimensions.panel.height) - 1;
    const columnIndex = Math.ceil(x / dimensions.panel.width) - 1;
    const activePanel = dimensions.rows?.[rowIndex]?.[columnIndex];

    if (!activePanel) return null;

    const relativePointer = {
      x: x - activePanel.panel.x,
      y: y - activePanel.panel.y,
    };

    const valueDetails = getPanelValue(activePanel, relativePointer, spec);

    if (!valueDetails || !isFiniteNumber(valueDetails.value)) return null;

    return {
      ...valueDetails,
      rowIndex,
      columnIndex,
      panel: activePanel,
    };
  },
);

function getPanelValue(
  panel: BulletPanelDimensions,
  pointer: Point,
  spec: BulletGraphSpec,
): Pick<ActiveValueDetails, 'value' | 'snapValue' | 'color' | 'pixelValue'> | undefined {
  const { datum, graphArea, scale } = panel;
  const isWithinDomain = isBetween(datum.domain.min, datum.domain.max);

  switch (spec.subtype) {
    case BulletGraphSubtype.circle:
    case BulletGraphSubtype.halfCircle:
    case BulletGraphSubtype.twoThirdsCircle: {
      const { radius } = getAngledChartSizing(graphArea.size, spec.subtype);
      const center = {
        x: graphArea.center.x,
        y: radius + TARGET_SIZE / 2,
      };
      const { x, y } = pointer;
      const normalizedPointer = {
        x: x - center.x - graphArea.origin.x - GRAPH_PADDING.left,
        y: y - center.y - graphArea.origin.y - GRAPH_PADDING.top,
      };

      const distance = Math.sqrt(Math.pow(normalizedPointer.x, 2) + Math.pow(normalizedPointer.y, 2));
      const outerLimit = radius + BULLET_SIZE / 2 + HOVER_SLOP;
      const innerLimit = radius - BULLET_SIZE / 2 - HOVER_SLOP;

      if (distance <= outerLimit && distance >= innerLimit) {
        // TODO find why to determine angle between origin and point
        // The angle goes from -π in Quadrant 2 to +π in Quadrant 3
        // This angle offset is a temporary fix
        const angleOffset = normalizedPointer.x < 0 && normalizedPointer.y > 0 ? -TAU : 0;
        const angle: Radian = Math.atan2(normalizedPointer.y, normalizedPointer.x) + angleOffset;
        const value = scale.invert(angle);
        const snapValue = spec.tickSnapStep ? roundTo(value, spec.tickSnapStep) : value;

        if (isWithinDomain(snapValue)) {
          return {
            value,
            snapValue,
            color: `${panel.colorScale(snapValue)}`,
            pixelValue: angle,
          };
        }
      }
      break;
    }

    case BulletGraphSubtype.horizontal: {
      const yCenterOffset = Math.abs(pointer.y - graphArea.origin.y - TARGET_SIZE / 2);

      if (yCenterOffset > TARGET_SIZE / 2 + HOVER_SLOP) return;

      const relativeX = pointer.x - GRAPH_PADDING.left;
      const [min, max] = scale.range() as Range;

      if (relativeX < min || relativeX > max) break;

      const value = panel.scale.invert(relativeX);
      const snapValue = spec.tickSnapStep ? roundTo(value, spec.tickSnapStep) : value;

      if (isWithinDomain(snapValue)) {
        return {
          value,
          snapValue,
          color: `${panel.colorScale(snapValue)}`,
          pixelValue: relativeX,
        };
      }

      break;
    }

    case BulletGraphSubtype.vertical: {
      const xCenterOffset = Math.abs(pointer.x - graphArea.center.x - GRAPH_PADDING.left);

      if (xCenterOffset > TARGET_SIZE / 2 + HOVER_SLOP) return;

      const relativeY = panel.panel.height - pointer.y - GRAPH_PADDING.bottom;
      const [min, max] = scale.range() as Range;

      if (relativeY < min || relativeY > max) break;

      const value = panel.scale.invert(relativeY);
      const snapValue = spec.tickSnapStep ? roundTo(value, spec.tickSnapStep) : value;

      if (isWithinDomain(snapValue)) {
        return {
          value,
          snapValue,
          color: `${panel.colorScale(snapValue)}`,
          pixelValue: relativeY,
        };
      }
      break;
    }

    default:
      return;
  }
}
