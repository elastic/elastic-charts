/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Selector } from '@reduxjs/toolkit';

import { getMultipleRectangleAnnotations } from './get_multiple_rectangle_annotations';
import { getProjectedScaledValues } from './get_projected_scaled_values';
import { getHighlightedGeomsSelector } from './get_tooltip_values_highlighted_geoms';
import { ChartType } from '../../..';
import type { LineAnnotationDatum, ProjectedValues, RectAnnotationDatum, SettingsSpec } from '../../../../specs';
import { AnnotationType } from '../../../../specs';
import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import type { PointerState } from '../../../../state/pointer_states';
import { getLastClickSelector } from '../../../../state/selectors/get_last_click';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { isClicking } from '../../../../state/utils/is_clicking';
import type { IndexedGeometry, GeometryValue } from '../../../../utils/geometry';
import type { AnnotationTooltipState } from '../../annotations/types';
import type { XYChartSeriesIdentifier } from '../../utils/series';

/**
 * Will call the onElementClick listener every time the following preconditions are met:
 * - the onElementClick listener is available
 * - we have at least one highlighted geometry
 * - the pointer state goes from down state to up state
 * @internal
 */
export function createOnClickCaller(): (state: GlobalChartState) => void {
  let prevClick: PointerState | null = null;
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector) {
      return selector(state);
    }
    if (state.chartType !== ChartType.XYAxis) {
      return;
    }
    selector = createCustomCachedSelector(
      [
        getLastClickSelector,
        getSettingsSpecSelector,
        getHighlightedGeomsSelector,
        getProjectedScaledValues,
        getMultipleRectangleAnnotations,
      ],
      (
        lastClick: PointerState | null,
        { onElementClick, onProjectionClick, onAnnotationClick }: SettingsSpec,
        indexedGeometries: IndexedGeometry[],
        values,
        tooltipStates,
      ): void => {
        if (!isClicking(prevClick, lastClick)) {
          return;
        }
        const elementClickFired = tryFiringOnElementClick(indexedGeometries, onElementClick);
        if (!elementClickFired && onAnnotationClick && tooltipStates) {
          tryFiringOnAnnotationClick(tooltipStates, onAnnotationClick, indexedGeometries);
        } else if (!elementClickFired) {
          tryFiringOnProjectionClick(values, onProjectionClick);
        }
        prevClick = lastClick;
      },
    );
  };
}

function tryFiringOnElementClick(
  indexedGeometries: IndexedGeometry[],
  onElementClick: SettingsSpec['onElementClick'],
): boolean {
  if (indexedGeometries.length === 0 || !onElementClick) {
    return false;
  }
  const elements = indexedGeometries.map<[GeometryValue, XYChartSeriesIdentifier]>(({ value, seriesIdentifier }) => [
    value,
    seriesIdentifier,
  ]);
  onElementClick(elements);
  return true;
}

function tryFiringOnProjectionClick(
  values: ProjectedValues | undefined,
  onProjectionClick: SettingsSpec['onProjectionClick'],
): boolean {
  const properClick = values !== undefined && onProjectionClick;
  if (properClick) onProjectionClick(values);
  return Boolean(properClick);
}

function tryFiringOnAnnotationClick(
  annotationState: AnnotationTooltipState[],
  onAnnotationClick: SettingsSpec['onAnnotationClick'],
  indexedGeometries: IndexedGeometry[],
): boolean {
  if (indexedGeometries.length > 0) return false;
  if (annotationState.length > 0 && onAnnotationClick) {
    const rects: { id: string; datum: RectAnnotationDatum }[] = [];
    const lines: { id: string; datum: LineAnnotationDatum }[] = [];
    annotationState.forEach((annotation) => {
      if (annotation.annotationType === AnnotationType.Rectangle) {
        rects.push({
          id: annotation.id,
          datum: annotation.datum as RectAnnotationDatum,
        });
      } else if (annotation.annotationType === AnnotationType.Line) {
        lines.push({
          id: annotation.id,
          datum: annotation.datum as LineAnnotationDatum,
        });
      }
    });
    onAnnotationClick({ rects, lines });
    return true;
  }
  return false;
}
