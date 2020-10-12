/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { connect } from 'react-redux';

import { GlobalChartState } from '../../../../state/chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { computeChartDimensionsSelector } from '../../state/selectors/compute_chart_dimensions';
import { geometries } from '../../state/selectors/geometries';
import { getBrushedHighlightedShapesSelector } from '../../state/selectors/get_brushed_highlighted_shapes';
import { getHeatmapConfigSelector } from '../../state/selectors/get_heatmap_config';
import { getHighlightedAreaSelector } from '../../state/selectors/get_highlighted_area';
import { DEFAULT_PROPS, HighlighterCellsComponent, HighlighterCellsProps } from './highlighter';

const brushMapStateToProps = (state: GlobalChartState): HighlighterCellsProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }

  const { chartId } = state;

  const geoms = geometries(state);
  const canvasDimension = computeChartDimensionsSelector(state);

  let dragShape = getBrushedHighlightedShapesSelector(state);
  const highlightedArea = getHighlightedAreaSelector(state);
  if (highlightedArea) {
    dragShape = highlightedArea;
  }
  const { brushMask, brushArea } = getHeatmapConfigSelector(state);

  return {
    chartId,
    initialized: true,
    canvasDimension,
    geometries: geoms,
    dragShape,
    brushMask,
    brushArea,
  };
};

/**
 * @internal
 */
export const HighlighterFromBrush = connect(brushMapStateToProps)(HighlighterCellsComponent);
