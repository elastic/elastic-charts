/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 'reselect';

import { ChartType } from '../../..';
import { SmallMultipleScales } from '../../../../common/panel_utils';
import { ScaleContinuous } from '../../../../scales';
import { isContinuousScale } from '../../../../scales/types';
import { GroupBrushExtent, SeriesSpecs, XYBrushEvent } from '../../../../specs';
import { BrushAxis } from '../../../../specs/constants';
import { DragState, GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { computeSmallMultipleScalesSelector } from '../../../../state/selectors/compute_small_multiple_scales';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { clamp, Rotation } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { hasDragged, DragCheckProps } from '../../../../utils/events';
import { GroupId } from '../../../../utils/ids';
import { isHistogramEnabled } from '../../domains/y_domain';
import { isVerticalRotation } from '../utils/common';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getPlotAreaRestrictedPoint, getPointsConstraintToSinglePanel, PanelPoints } from './get_brush_area';
import { getComputedScalesSelector } from './get_computed_scales';
import { getSeriesSpecsSelector } from './get_specs';
import { isBrushAvailableSelector } from './is_brush_available';
import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';

const getLastDragSelector = (state: GlobalChartState) => state.interactions.pointer.lastDrag;

/**
 * Will call the onBrushEnd listener every time the following preconditions are met:
 * - the onBrushEnd listener is available
 * - we dragged the mouse pointer
 * @internal
 */
export function createOnBrushEndCaller(): (state: GlobalChartState) => void {
  let prevProps: DragCheckProps | null = null;
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartType.XYAxis) {
      if (!isBrushAvailableSelector(state)) {
        selector = null;
        prevProps = null;
        return;
      }
      selector = createCustomCachedSelector(
        [
          getLastDragSelector,
          getSettingsSpecSelector,
          getComputedScalesSelector,
          computeChartDimensionsSelector,
          isHistogramModeEnabledSelector,
          computeSmallMultipleScalesSelector,
          getSeriesSpecsSelector,
        ],
        (
          lastDrag,
          { onBrushEnd, rotation, brushAxis, minBrushDelta, roundHistogramBrushValues, allowBrushingLastHistogramBin },
          computedScales,
          { chartDimensions },
          histogramMode,
          smallMultipleScales,
          seriesSpec,
        ): void => {
          const nextProps = {
            lastDrag,
            onBrushEnd,
          };
          const { yScales, xScale } = computedScales;
          if (lastDrag !== null && hasDragged(prevProps, nextProps) && onBrushEnd && isContinuousScale(xScale)) {
            const brushAreaEvent: XYBrushEvent = {};

            if (brushAxis === BrushAxis.X || brushAxis === BrushAxis.Both) {
              brushAreaEvent.x = getXBrushExtent(
                chartDimensions,
                lastDrag,
                rotation,
                histogramMode,
                xScale,
                smallMultipleScales,
                allowBrushingLastHistogramBin,
                seriesSpec,
                minBrushDelta,
                roundHistogramBrushValues,
              );
            }
            if (brushAxis === BrushAxis.Y || brushAxis === BrushAxis.Both) {
              brushAreaEvent.y = getYBrushExtents(
                chartDimensions,
                lastDrag,
                rotation,
                yScales,
                smallMultipleScales,
                minBrushDelta,
              );
            }
            if (brushAreaEvent.x !== undefined || brushAreaEvent.y !== undefined) {
              onBrushEnd(brushAreaEvent);
            }
          }
          prevProps = nextProps;
        },
      );
    }
    if (selector) {
      selector(state);
    }
  };
}

function scalePanelPointsToPanelCoordinates(
  scaleXPoint: boolean,
  { start, end, vPanelStart, hPanelStart, vPanelHeight, hPanelWidth }: PanelPoints,
) {
  // scale screen coordinates down to panel scale
  const startPos = scaleXPoint ? start.x - hPanelStart : start.y - vPanelStart;
  const endPos = scaleXPoint ? end.x - hPanelStart : end.y - vPanelStart;
  const panelMax = scaleXPoint ? hPanelWidth : vPanelHeight;
  return {
    minPos: Math.min(startPos, endPos),
    maxPos: Math.max(startPos, endPos),
    panelMax,
  };
}

function getXBrushExtent(
  chartDimensions: Dimensions,
  lastDrag: DragState,
  rotation: Rotation,
  histogramMode: boolean,
  xScale: ScaleContinuous, // brush is available only on continuous scale right now
  smallMultipleScales: SmallMultipleScales,
  allowBrushingLastHistogramBin: boolean,
  seriesSpecs: SeriesSpecs,
  minBrushDelta?: number,
  roundHistogramBrushValues?: boolean,
): [number, number] | undefined {
  const isXHorizontal = !isVerticalRotation(rotation);
  // scale screen coordinates down to panel scale
  const scaledPanelPoints = getMinMaxPos(chartDimensions, lastDrag, smallMultipleScales, isXHorizontal);
  let { minPos, maxPos } = scaledPanelPoints;
  // reverse the positions if chart is mirrored
  if (rotation === -90 || rotation === 180) {
    minPos = scaledPanelPoints.panelMax - minPos;
    maxPos = scaledPanelPoints.panelMax - maxPos;
  }
  if (minBrushDelta !== undefined ? Math.abs(maxPos - minPos) < minBrushDelta : maxPos === minPos) {
    // if 0 size brush, avoid computing the value
    return;
  }
  const offset = histogramMode ? 0 : -(xScale.bandwidth + xScale.bandwidthPadding) / 2;
  const histogramEnabled = isHistogramEnabled(seriesSpecs);
  const invertValue =
    histogramEnabled && roundHistogramBrushValues
      ? (value: number) => xScale.invertWithStep(value, xScale.domain).value
      : (value: number) => xScale.invert(value);
  const minPosScaled = invertValue(minPos + offset);
  const maxPosScaled = invertValue(maxPos + offset);
  const maxDomainValue =
    xScale.domain[1] + (histogramEnabled && allowBrushingLastHistogramBin ? xScale.minInterval : 0);

  const minValue = clamp(minPosScaled, xScale.domain[0], maxPosScaled);
  const maxValue = clamp(minPosScaled, maxPosScaled, maxDomainValue);

  return [minValue, maxValue];
}

function getMinMaxPos(
  chartDimensions: Dimensions,
  lastDrag: DragState,
  smallMultipleScales: SmallMultipleScales,
  scaleXPoint: boolean,
) {
  const panelPoints = getPanelPoints(chartDimensions, lastDrag, smallMultipleScales);
  // scale screen coordinates down to panel scale
  return scalePanelPointsToPanelCoordinates(scaleXPoint, panelPoints);
}

function getPanelPoints(chartDimensions: Dimensions, lastDrag: DragState, smallMultipleScales: SmallMultipleScales) {
  const plotStartPointPx = getPlotAreaRestrictedPoint(lastDrag.start.position, chartDimensions);
  const plotEndPointPx = getPlotAreaRestrictedPoint(lastDrag.end.position, chartDimensions);
  return getPointsConstraintToSinglePanel(plotStartPointPx, plotEndPointPx, smallMultipleScales);
}

function getYBrushExtents(
  chartDimensions: Dimensions,
  lastDrag: DragState,
  rotation: Rotation,
  yScales: Map<GroupId, ScaleContinuous>,
  smallMultipleScales: SmallMultipleScales,
  minBrushDelta?: number,
): GroupBrushExtent[] | undefined {
  const yValues: GroupBrushExtent[] = [];
  yScales.forEach((yScale, groupId) => {
    const isXVertical = isVerticalRotation(rotation);
    // scale screen coordinates down to panel scale
    const scaledPanelPoints = getMinMaxPos(chartDimensions, lastDrag, smallMultipleScales, isXVertical);
    let { minPos, maxPos } = scaledPanelPoints;

    if (rotation === 90 || rotation === 180) {
      minPos = scaledPanelPoints.panelMax - minPos;
      maxPos = scaledPanelPoints.panelMax - maxPos;
    }
    if (minBrushDelta !== undefined ? Math.abs(maxPos - minPos) < minBrushDelta : maxPos === minPos) {
      // if 0 size brush, avoid computing the value
      return;
    }

    const minPosScaled = yScale.invert(minPos);
    const maxPosScaled = yScale.invert(maxPos);
    const minValue = clamp(minPosScaled, yScale.domain[0], maxPosScaled);
    const maxValue = clamp(minPosScaled, maxPosScaled, yScale.domain[1]);
    yValues.push({ extent: [minValue, maxValue], groupId });
  });
  return yValues.length === 0 ? undefined : yValues;
}
