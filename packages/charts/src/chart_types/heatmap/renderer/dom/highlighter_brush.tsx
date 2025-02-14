/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { connect } from 'react-redux';

import type { HighlighterCellsProps } from './highlighter';
import { DEFAULT_PROPS, HighlighterCellsComponent } from './highlighter';
import type { GlobalChartState } from '../../../../state/chart_state';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalChartStateSelector } from '../../../../state/selectors/get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { computeChartDimensionsSelector } from '../../state/selectors/compute_chart_dimensions';
import { getBrushedHighlightedShapesSelector } from '../../state/selectors/get_brushed_highlighted_shapes';
import { getHighlightedAreaSelector } from '../../state/selectors/get_highlighted_area';
import { getPerPanelHeatmapGeometries } from '../../state/selectors/get_per_panel_heatmap_geometries';

const brushMapStateToProps = (state: GlobalChartState): HighlighterCellsProps => {
  const internalChartState = getInternalChartStateSelector(state);
  if (getInternalIsInitializedSelector(state, internalChartState) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }

  let dragShape = getBrushedHighlightedShapesSelector(state);
  const highlightedArea = getHighlightedAreaSelector(state);

  if (highlightedArea) {
    dragShape = highlightedArea;
  }

  const { chartId } = state;
  const geoms = getPerPanelHeatmapGeometries(state);
  const canvasDimension = computeChartDimensionsSelector(state).chartDimensions;
  const {
    heatmap: { brushMask: brushMaskStyle, brushArea },
  } = getChartThemeSelector(state);

  const brushMaskRect = {
    x: 0,
    y: canvasDimension.top,
    width: canvasDimension.width + canvasDimension.left,
    height: canvasDimension.height,
  };

  return {
    chartId,
    initialized: true,
    canvasDimension,
    geometries: geoms,
    dragShape,
    brushMaskRect,
    brushMaskStyle,
    brushArea,
  };
};

/**
 * @internal
 */
export const HighlighterFromBrush = connect(brushMapStateToProps)(HighlighterCellsComponent);
