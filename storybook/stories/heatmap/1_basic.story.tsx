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

import { DATA_6 } from '../../../packages/charts/src/utils/data_samples/test_dataset_heatmap';
import { useBaseTheme } from '../../use_base_theme';
import { getDebugStateLogger } from '../utils/debug_state_logger';
import { useHeatmapSelection } from '../utils/use_heatmap_selection';

export const Example = () => {
  const debugState = boolean('Enable debug state', true);
  const showXAxisTitle = boolean('Show x axis title', false);
  const showYAxisTitle = boolean('Show y axis title', false);
  const pointerUpdate = (event: PointerEvent) => {
    action('onPointerUpdate')(event);
  };
  const { highlightedData, onElementClick, onBrushEnd } = useHeatmapSelection();

  const heatmap = useMemo(() => {
    const styles: RecursivePartial<HeatmapStyle> = {
      brushTool: {
        visible: true,
      },
      grid: {
        cellHeight: {
          min: 20,
        },
        stroke: {
          width: 0.5,
          color: '#bababa',
        },
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
  }, []);

  return (
    <Chart>
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
            { start: -Infinity, end: 3.5, color: '#d2e9f7' },
            { start: 3.5, end: 25, color: '#8bc8fb' },
            { start: 25, end: 50, color: '#fdec25' },
            { start: 50, end: 75, color: '#fba740' },
            { start: 75, end: Infinity, color: '#fe5050' },
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
