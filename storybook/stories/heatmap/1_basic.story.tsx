/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import React, { useMemo } from 'react';

import {
  Chart,
  Heatmap,
  HeatmapStyle,
  niceTimeFormatter,
  PointerEvent,
  RecursivePartial,
  ScaleType,
  Settings,
} from '@elastic/charts';
import { SEVERITY_COLORS } from '@elastic/charts/src/utils/themes/base_colors';

import { DATA_6 } from '../../../packages/charts/src/utils/data_samples/test_dataset_heatmap';
import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getDebugStateLogger } from '../utils/debug_state_logger';
import { useHeatmapSelection } from '../utils/use_heatmap_selection';

export const Example: ChartsStory = (_, { title, description }) => {
  const { highlightedData, onElementClick, onBrushEnd } = useHeatmapSelection();

  const debugState = boolean('Enable debug state', true);
  const showXAxisTitle = boolean('Show x axis title', false);
  const showYAxisTitle = boolean('Show y axis title', false);
  const showBrushTool = boolean('Show pointer brush area', true);

  const pointerUpdate = (event: PointerEvent) => {
    action('onPointerUpdate')(event);
  };

  const heatmap = useMemo(() => {
    const styles: RecursivePartial<HeatmapStyle> = {
      brushTool: {
        visible: showBrushTool,
      },
      cell: {
        maxWidth: 'fill',
        maxHeight: 3,
        label: {
          visible: false,
        },
        border: {
          stroke: 'transparent',
          strokeWidth: 0,
        },
      },
      yAxisLabel: {
        visible: true,
        width: 'auto',
        padding: { left: 10, right: 10 },
      },
    };

    return styles;
  }, [showBrushTool]);

  return (
    <Chart title={title} description={description}>
      <Settings
        onElementClick={onElementClick}
        onPointerUpdate={pointerUpdate}
        onRenderChange={getDebugStateLogger(debugState)}
        showLegend
        legendPosition="right"
        brushAxis="both"
        xDomain={{ min: 1572825600000, max: 1572912000000 }}
        debugState={debugState}
        theme={{ heatmap }}
        baseTheme={useBaseTheme()}
        onBrushEnd={onBrushEnd}
      />
      <Heatmap
        id="heatmap1"
        colorScale={{
          type: 'bands',
          bands: [
            { start: -Infinity, end: 3.5, color: SEVERITY_COLORS.euiColorSeverity5 },
            { start: 3.5, end: 25, color: SEVERITY_COLORS.euiColorSeverity7 },
            { start: 25, end: 50, color: SEVERITY_COLORS.euiColorSeverity10 },
            { start: 50, end: 75, color: SEVERITY_COLORS.euiColorSeverity12 },
            { start: 75, end: Infinity, color: SEVERITY_COLORS.euiColorSeverity14 },
          ],
        }}
        data={DATA_6.data}
        xAccessor="x"
        yAccessor="y"
        valueAccessor="value"
        valueFormatter={(d) => `${Number(d.toFixed(2))}℃`}
        ySortPredicate="numAsc"
        xScale={{ type: ScaleType.Time, interval: DATA_6.interval }}
        xAxisLabelFormatter={(value) => {
          return niceTimeFormatter([1572825600000, 1572912000000])(value, { timeZone: 'UTC' });
        }}
        timeZone={DATA_6.timeZone}
        highlightedData={highlightedData}
        xAxisTitle={showXAxisTitle ? 'Bottom axis' : undefined}
        yAxisTitle={showYAxisTitle ? 'Left axis' : undefined}
      />
    </Chart>
  );
};
