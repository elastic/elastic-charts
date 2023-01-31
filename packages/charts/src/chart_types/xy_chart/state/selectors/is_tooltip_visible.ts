/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isFollowTooltipType, TooltipSpec } from './../../../../specs/tooltip';
import { getTooltipSpecSelector } from './../../../../state/selectors/get_tooltip_spec';
import { getProjectedPointerPositionSelector } from './get_projected_pointer_position';
import { getTooltipInfoAndGeomsSelector, TooltipAndHighlightedGeoms } from './get_tooltip_values_highlighted_geoms';
import { isAnnotationTooltipVisibleSelector } from './is_annotation_tooltip_visible';
import { TooltipType } from '../../../../specs/constants';
import { InteractionsState, TooltipVisibility } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getTooltipInteractionState } from '../../../../state/selectors/get_tooltip_interaction_state';
import { isExternalTooltipVisibleSelector } from '../../../../state/selectors/is_external_tooltip_visible';
import { Point } from '../../../../utils/point';

/** @internal */
export const isTooltipVisibleSelector = createCustomCachedSelector(
  [
    getTooltipSpecSelector,
    getTooltipInteractionState,
    getProjectedPointerPositionSelector,
    getTooltipInfoAndGeomsSelector,
    isAnnotationTooltipVisibleSelector,
    isExternalTooltipVisibleSelector,
  ],
  isTooltipVisible,
);

function isTooltipVisible(
  { type: tooltipType, maxTooltipItems }: TooltipSpec,
  { pinned }: InteractionsState['tooltip'],
  projectedPointerPosition: Point,
  { tooltip, highlightedGeometries }: TooltipAndHighlightedGeoms,
  isAnnotationTooltipVisible: boolean,
  externalTooltipVisible: boolean,
): TooltipVisibility {
  const visibleTooltip = isFollowTooltipType(tooltipType)
    ? highlightedGeometries
    : tooltip.values.length > maxTooltipItems && highlightedGeometries.length > 0
    ? highlightedGeometries
    : tooltip.values;
  const isLocalTooltip =
    tooltipType !== TooltipType.None &&
    projectedPointerPosition.x > -1 &&
    projectedPointerPosition.y > -1 &&
    visibleTooltip.length > 0 &&
    !isAnnotationTooltipVisible;
  const isExternalTooltip = externalTooltipVisible && visibleTooltip.length > 0;

  return {
    visible: isLocalTooltip || isExternalTooltip || pinned,
    isExternal: externalTooltipVisible,
    displayOnly: false,
    isPinnable: tooltip.values.length > 0,
  };
}
