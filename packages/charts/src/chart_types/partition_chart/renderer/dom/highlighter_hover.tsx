/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { connect } from 'react-redux';

import type { HighlighterProps } from './highlighter';
import { DEFAULT_PROPS, HighlighterComponent, highlightSetMapper } from './highlighter';
import type { GlobalChartState } from '../../../../state/chart_state';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getInternalChartStateSelector } from '../../../../state/selectors/get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { partitionDrilldownFocus, partitionMultiGeometries } from '../../state/selectors/geometries';
import { getPickedShapes } from '../../state/selectors/picked_shapes';

const hoverMapStateToProps = (state: GlobalChartState): HighlighterProps => {
  const internalChartState = getInternalChartStateSelector(state);
  if (getInternalIsInitializedSelector(state, internalChartState) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }

  const canvasDimension = getChartContainerDimensionsSelector(state);
  const { chartId } = state;

  const allGeometries = partitionMultiGeometries(state);
  const geometriesFoci = partitionDrilldownFocus(state);
  const pickedGeometries = getPickedShapes(state);

  const highlightSets = allGeometries.map(highlightSetMapper(pickedGeometries, geometriesFoci));

  return {
    chartId,
    initialized: true,
    renderAsOverlay: true,
    canvasDimension,
    highlightSets,
  };
};

/**
 * Partition chart highlighter from mouse hover events
 * @internal
 */
export const HighlighterFromHover = connect(hoverMapStateToProps)(HighlighterComponent);
