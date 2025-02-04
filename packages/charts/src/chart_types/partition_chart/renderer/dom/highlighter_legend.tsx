/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { connect } from 'react-redux';

import { HighlighterComponent, HighlighterProps, DEFAULT_PROPS, highlightSetMapper } from './highlighter';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { partitionDrilldownFocus, partitionMultiGeometries } from '../../state/selectors/geometries';
import { legendHoverHighlightNodes } from '../../state/selectors/get_highlighted_shapes';

const legendMapStateToProps = (state: GlobalChartState): HighlighterProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }

  const { chartId } = state;

  const geometries = legendHoverHighlightNodes(state);
  const geometriesFoci = partitionDrilldownFocus(state);
  const canvasDimension = getChartContainerDimensionsSelector(state);
  const multiGeometries = partitionMultiGeometries(state);
  const highlightMapper = highlightSetMapper(geometries, geometriesFoci);
  const highlightSets = multiGeometries.map(highlightMapper);

  return {
    chartId,
    initialized: true,
    renderAsOverlay: false,
    canvasDimension,
    highlightSets,
  };
};

/**
 * Partition chart highlighter from legend events
 * @internal
 */
export const HighlighterFromLegend = connect(legendMapStateToProps)(HighlighterComponent);
