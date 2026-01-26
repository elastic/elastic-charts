/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Position, Placement, ScaleType, TooltipStickTo, CurveType, Fit } from '@elastic/charts';
import { PointShape } from '@elastic/charts/src';
import { TooltipType } from '@elastic/charts/src/specs/constants';
import { VerticalAlignment, HorizontalAlignment, LegendLayout } from '@elastic/charts/src/utils/common';

import { getKnobsFnFromEnum } from './utils';

const getTooltipTypeKnob = getKnobsFnFromEnum(TooltipType, 'tooltip type', TooltipType.VerticalCursor);

const getPositionKnob = getKnobsFnFromEnum(Position, 'position', Position.Right);

const getLegendLayoutKnob = getKnobsFnFromEnum(LegendLayout, 'layout', LegendLayout.Table, {
  allowUndefined: true,
  undefinedLabel: 'Default',
});

const getPlacementKnob = getKnobsFnFromEnum(Placement, 'placement', undefined, {
  allowUndefined: true,
  undefinedLabel: 'Default',
});

const getVerticalTextAlignmentKnob = getKnobsFnFromEnum(VerticalAlignment, 'Vertical Text alignment', undefined, {
  allowUndefined: true,
  undefinedLabel: 'None',
});

const getHorizontalTextAlignmentKnob = getKnobsFnFromEnum(HorizontalAlignment, 'Horizontal Text alignment', undefined, {
  allowUndefined: true,
  undefinedLabel: 'None',
});

const getStickToKnob = getKnobsFnFromEnum(TooltipStickTo, 'stickTo', TooltipStickTo.MousePosition, {
  allowUndefined: true,
  undefinedLabel: 'Default',
});

const getEuiPopoverPositionKnob = getKnobsFnFromEnum(
  {
    upCenter: 'upCenter' as const,
    upLeft: 'upLeft' as const,
    upRight: 'upRight' as const,
    downCenter: 'downCenter' as const,
    downLeft: 'downLeft' as const,
    downRight: 'downRight' as const,
    leftCenter: 'leftCenter' as const,
    leftUp: 'leftUp' as const,
    leftDown: 'leftDown' as const,
    rightCenter: 'rightCenter' as const,
    rightUp: 'rightUp' as const,
    rightDown: 'rightDown' as const,
  },
  'Popover position',
  'leftCenter',
  {
    allowUndefined: false,
  },
);

const getScaleTypeKnob = getKnobsFnFromEnum(ScaleType, 'scaleType', ScaleType.Linear);

const getCurveTypeKnob = getKnobsFnFromEnum(CurveType, 'Curve', CurveType.CURVE_CARDINAL);

const getFitKnob = getKnobsFnFromEnum(Fit, 'fitting function', Fit.Average);

const getPointShapeKnob = getKnobsFnFromEnum(PointShape, 'point shape', PointShape.Circle);

export const enumKnobs = {
  tooltipType: getTooltipTypeKnob,
  layout: getLegendLayoutKnob,
  position: getPositionKnob,
  placement: getPlacementKnob,
  stickTo: getStickToKnob,
  euiPopoverPosition: getEuiPopoverPositionKnob,
  verticalTextAlignment: getVerticalTextAlignmentKnob,
  horizontalTextAlignment: getHorizontalTextAlignmentKnob,
  scaleType: getScaleTypeKnob,
  curve: getCurveTypeKnob,
  fit: getFitKnob,
  pointShape: getPointShapeKnob,
};
